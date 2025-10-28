import { Router, Request, Response, NextFunction } from "express";
import {
  CountriesApiResponse,
  CountryMapData,
  ExchangeApiReturn,
} from "../types";
import HTTPError from "../utils/error";
import getCountriesExchangeRate from "../utils/getCountriesExchangeRate";
import getCountriesData, {
  getAllCountriesData,
} from "../utils/getCountriesData";
import countriesStatus from "../utils/countriesStatus";
import {
  deleteCountry,
  getAllCountries,
  getCountry,
  insertCountry,
} from "../db/dbQuery";

const countriesRoute = Router();

const countriesMap = new Map<string | null, CountryMapData>();
const invalidCountryCodes: string[] = [];
const countriesWithNoCurrencies: string[] = [];

countriesRoute.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      region,
      currency,
      sort,
      name,
      population,
      currency_code,
      exchange_rate,
    } = req.query;

    const countries = await getAllCountries();
    res.json({
      countries,
      queries: req.query,
    });
  }
);

countriesRoute.post(
  "/country",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const countries = await insertCountry({
        capital: "Accra",
        currency_code: "GHC",
        estimated_gdp: 100302,
        exchange_rate: 1500.42,
        flag_url: "https://flagcdn.com/ng.svg",
        last_refreshed_at: new Date().toISOString(),
        name: "Ghana",
        population: 230000000,
        region: "Africa",
      });
      res.json({
        countries,
        message: "INsert successful",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: err instanceof Error ? err.message : "unknown error",
      });
      next();
    }
  }
);

countriesRoute.get(
  "/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name: countryName } = req.params;
    const country = await getCountry(countryName);
    // validate countryName
    if (country.length < 1) {
      res.status(404).json({ message: "Country not found" });
      return;
    }
    // res.json({
    //   country: country[0],
    // });
    res.json(country[0]);
  }
);

countriesRoute.delete(
  "/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name: countryName } = req.params;
    // countriesMap.delete(countryName);
    // countriesStatus.updateTotalCountries(countriesMap.size);

    try {
      const query = await deleteCountry(countryName);

      if (query.affectedRows === 0) {
        res.status(400).json({ message: "Country not found" });
        return;
      }

      res.json({
        message: countryName + " deleted successfully!",
        // size: countriesMap.size,
      });
    } catch (err) {
      res.status(500).json({ message: "INternal server error" });
    }
  }
);

countriesRoute.get(
  "/image",
  (req: Request, res: Response, next: NextFunction) => {
    res.json({
      generated_image: "image from cache",
    });
  }
);

countriesRoute.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [countriesData, countryCurrencies] = await Promise.all([
        getAllCountriesData(),
        getCountriesExchangeRate(),
      ]);
      const refreshDate = new Date().toISOString();
      countriesStatus.updateRefreshDate(refreshDate);
      for (const country of countriesData) {
        let storedData: CountryMapData;

        const countryCurrencyArray = country.currencies?.[0] ?? null;

        if (!countryCurrencyArray) {
          countriesWithNoCurrencies.push(country.name);
          storedData = {
            name: country.name,
            id: crypto.randomUUID(),
            capital: country.capital,
            region: country.region,
            population: country.population,
            exchange_rate: null,
            estimated_gdp: 0,
            last_refreshed_at: refreshDate,
            currency_code: null,
            flag_url: country.flag,
          };
          countriesMap.set(country.name, storedData);
          continue;
        }

        const countryCurrencyCode = country.currencies?.[0].code;
        const exchangeRate =
          countryCurrencies.rates[countryCurrencyCode as string];
        if (!exchangeRate) {
          invalidCountryCodes.push(country.name);
          storedData = {
            name: country.name,
            id: crypto.randomUUID(),
            capital: country.capital,
            region: country.region,
            population: country.population,
            exchange_rate: null,
            estimated_gdp: null,
            last_refreshed_at: refreshDate,
            currency_code: null,
            flag_url: country.flag,
          };

          countriesMap.set(country.name, storedData);
        }

        const countryGDP =
          (country.population * (Math.random() * (2000 - 1000) + 1000)) /
          exchangeRate;

        storedData = {
          name: country.name,
          id: crypto.randomUUID(),
          capital: country.capital,
          region: country.region,
          population: country.population,
          exchange_rate: exchangeRate,
          estimated_gdp: countryGDP,
          last_refreshed_at: refreshDate,
          currency_code: country.currencies![0].code,
          flag_url: country.flag,
        };
        countriesMap.set(country.name, storedData);
      }
      countriesStatus.updateTotalCountries(countriesMap.size);
      res.json({
        countryMapData: Object.fromEntries(countriesMap.entries()),
        countriesSize: countriesMap.size,
        invalidCountryCodes,
        countriesWithNoCurrencies,
      });
    } catch (err: unknown) {
      if (err instanceof HTTPError) {
        // console.log("current map data", countriesMap.entries());
        console.error(err);
        res.status(err.statusCode).json({
          message: err.message,
          details: `Cound not fetch data from ${err.apiName}`,
        });
        return;
      }
      if (err instanceof Error) {
        // console.log("current map data", countriesMap.entries());
        console.error(err);
        res
          .status(500)
          .json({ message: err.message ?? "Unexpected error, try again." });
        return;
      }
    }
  }
);

export default countriesRoute;
