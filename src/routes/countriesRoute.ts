import path from "path";
import fs from "fs";
import { NextFunction, Request, Response, Router } from "express";
import z from "zod";
import {
  deleteCountry,
  generateImage,
  getAllCountries,
  getCountry,
  insertCountries,
} from "../db/dbQuery";
import validate from "../middlewares/validate";
import {
  CountryMapData,
  getCountriesQueryParams,
  getCountriesQuerySchema,
} from "../types";
import countriesStatus from "../utils/countriesStatus";
import HTTPError from "../utils/error";
import { getAllCountriesData } from "../utils/getCountriesData";
import getCountriesExchangeRate from "../utils/getCountriesExchangeRate";

const countriesRoute = Router();

const invalidCountryCodes: string[] = [];
const countriesWithNoCurrencies: string[] = [];

countriesRoute.get(
  "/",
  validate(getCountriesQuerySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { region, currency, population, currency_code, exchange_rate, sort } =
      req.query as getCountriesQueryParams;

    const countries = await getAllCountries({
      region,
      currency,
      population,
      currency_code,
      exchange_rate,
      sort,
    });
    res.json(countries);
  }
);

countriesRoute.get("/image", async (req, res) => {
  const imagePath = path.join(process.cwd(), "cache", "summary.png");

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: "Summary image not found" });
  }
});

countriesRoute.get(
  "/:name",
  validate(z.object({ name: z.string() }), "params"),
  async (req: Request, res: Response, next: NextFunction) => {
    const { name: countryName } = req.params;
    const country = await getCountry(countryName);
    if (country.length < 1) {
      res.status(404).json({ error: "Country not found" });
      return;
    }
    res.json(country[0]);
  }
);

countriesRoute.delete(
  "/:name",
  async (req: Request, res: Response, next: NextFunction) => {
    const { name: countryName } = req.params;

    try {
      const query = await deleteCountry(countryName);

      if (query.affectedRows === 0) {
        res.status(404).json({ message: "Country not found" });
        return;
      }

      res.json({
        message: countryName + " deleted successfully!",
      });
    } catch (err) {
      res.status(500).json({ message: "INternal server error" });
    }
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
      const allCountriesToInsert: Omit<CountryMapData, "id">[] = [];

      const refreshDate = new Date().toISOString();
      countriesStatus.updateRefreshDate(refreshDate);
      for (const country of countriesData) {
        let storedData: Omit<CountryMapData, "id">;

        const countryCurrencyArray = country.currencies?.[0] ?? null;

        if (!countryCurrencyArray) {
          countriesWithNoCurrencies.push(country.name);
          storedData = {
            name: country.name,
            capital: country.capital,
            region: country.region,
            population: country.population,
            exchange_rate: null,
            estimated_gdp: 0,
            last_refreshed_at: refreshDate,
            currency_code: null,
            flag_url: country.flag,
          };
          allCountriesToInsert.push(storedData);
          continue;
        }

        const countryCurrencyCode = country.currencies?.[0].code;
        const exchangeRate =
          countryCurrencies.rates[countryCurrencyCode as string];
        if (!exchangeRate) {
          invalidCountryCodes.push(country.name);
          storedData = {
            name: country.name,
            capital: country.capital,
            region: country.region,
            population: country.population,
            exchange_rate: null,
            estimated_gdp: null,
            last_refreshed_at: refreshDate,
            currency_code: null,
            flag_url: country.flag,
          };
          allCountriesToInsert.push(storedData);

          continue;
        }

        const countryGDP =
          (country.population * (Math.random() * (2000 - 1000) + 1000)) /
          exchangeRate;

        storedData = {
          name: country.name,
          capital: country.capital,
          region: country.region,
          population: country.population,
          exchange_rate: exchangeRate,
          estimated_gdp: countryGDP,
          last_refreshed_at: refreshDate,
          currency_code: country.currencies![0].code,
          flag_url: country.flag,
        };
        allCountriesToInsert.push(storedData);
      }
      await insertCountries(allCountriesToInsert);
      await generateImage();

      res.json({
        message: "Cache refreshed successfully",
        invalidCountryCodes,
        countriesWithNoCurrencies,
      });
    } catch (err: unknown) {
      if (err instanceof HTTPError) {
        res.status(err.statusCode).json({
          message: err.message,
          details: `Cound not fetch data from ${err.apiName}`,
        });
        return;
      }
      if (err instanceof Error) {
        res
          .status(500)
          .json({ message: err.message ?? "Unexpected error, try again." });
        return;
      }
    }
  }
);

export default countriesRoute;
