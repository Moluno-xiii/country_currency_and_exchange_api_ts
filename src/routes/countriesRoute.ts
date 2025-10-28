import { Router, Request, Response, NextFunction } from "express";
import { CountriesApiResponse, ExchangeApiReturn } from "../types";
import HTTPError from "../utils/error";
import getCountriesExchangeRate from "../utils/getCountriesExchangeRate";
import getCountriesData, {
  getAllCountriesData,
} from "../utils/getCountriesData";
import countriesStatus from "../utils/countriesStatus";
const countriesRoute = Router();

type CountryMapData = {
  id: string;
  name: string;
  capital: string;
  region: string;
  population: number;
  currency_code: string | null;
  exchange_rate: number | null;
  estimated_gdp: number | null;
  flag_url: string | null;
  last_refreshed_at: string;
};

const countriesMap = new Map<string | null, CountryMapData>();
const invalidCountryCodes: string[] = [];
const countriesWithNoCurrencies: string[] = [];
// const invalidCountryCodes = new Map<string | null, string>();

//    Math.random() * (2000 - 1000) + 1000

// post countries/refresh
// each country with it's rate e.g NGN => 1600
// estimated_gdp = population * (random 1000 - 2000) / exchange rate
// store or update it in mysql as cached data.

// currency handling : store one currncy if a country has more than one.
// if currencies array is empty, don't call the currencies api for thi country :
// set country_code to null, exchange_rate to null, estimated_gdp to 0

// if currency_code is not found in the exchange rates api:
//  set exchange_rate to null
// set estimated_gdp to null
// still store the country record

// batch update the db, instead of multiple round trips

countriesRoute.get("/", (req: Request, res: Response, next: NextFunction) => {
  const { region, currency, sort } = req.query;
  res.json({
    countries: Object.fromEntries(countriesMap.entries()),
    queries: req.query,
  });
});

countriesRoute.get(
  "/:name",
  (req: Request, res: Response, next: NextFunction) => {
    const { name: countryName } = req.params;
    const country = countriesMap.get(countryName);

    if (!country) {
      res.status(404).json({ mesage: "Country not found" });
      return;
    }

    res.json({
      country,
    });
  }
);

countriesRoute.delete(
  "/:name",
  (req: Request, res: Response, next: NextFunction) => {
    const { name: countryName } = req.params;
    countriesMap.delete(countryName);
    countriesStatus.updateTotalCountries(countriesMap.size);

    res.json({
      message: countryName + " deleted successfully!",
      size: countriesMap.size,
    });
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
        console.log("current map data", countriesMap.entries());
        console.error(err);
        res.status(err.statusCode).json({
          message: err.message,
          details: `Cound not fetch data from ${err.apiName}`,
        });
        return;
      }
      if (err instanceof Error) {
        console.log("current map data", countriesMap.entries());
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
