import { Router, Request, Response, NextFunction } from "express";
import { CountriesApiResponse, ExchangeApiReturn } from "../types";
import HTTPError from "../utils/error";
import getCountriesExchangeRate from "../utils/getCountriesExchangeRate";
import getCountriesData from "../utils/getCountriesData";
const countriesRoute = Router();

type CountryMapData = {
  //   id: string;
  //   name: string;
  //   capital: string;
  //   region: string;
  //   population: number;
  currency_code: string | null;
  exchange_rate: number | null;
  estimated_gdp: number | null;
  //   flag_url: string | null;
  last_refreshed_at: string;
  country_code: string | null;
};

const countriesMap = new Map<string | null, CountryMapData>();

// post countries/refresh
// each country with it's rate e.g NGN => 1600
// estimated_gdp = population * (random 1000 - 2000) / exchange rate
// store or update it in mysql as cached data.

// country fields
// id : auto generated
// name : required
// capital : optional
// region : optional
// population : required
// currency_code : required
// exchange_rate : required
// estimated_gdp : required
// flag_url : optional
// last_refreshed_at : auto timestamp

// coujtries query name, capital, regioni, population, flag, currencies

// get status total countries : number, last_refreshed_at : timestamp.

// currency handling : store one currncy if a country has more than one.
// if currencies array is empty, don't call the currencies api for thi country :
// set country_code to null, exchange_rate to null, estimated_gdp to 0

// if currency_code is not found in the exchange rates api:
//  set exchange_rate to null
// set estimated_gdp to null
// still store the country record

countriesRoute.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("");
});

countriesRoute.get(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [
        countriesData,
        currenciesData,
        countriesPopulationData,
        countriesRegionData,
        countriesCapitalData,
      ] = await Promise.all([
        getCountriesData("currencies"),
        getCountriesExchangeRate(),
        getCountriesData("population"),
        getCountriesData("region"),
        getCountriesData("capital"),
      ]);

      for (const country of countriesData) {
        const currentCountryCurrencyCode =
          country.currencies?.[0]?.code ?? null;
        const countryData: CountryMapData = {
          country_code: currentCountryCurrencyCode,
          exchange_rate:
            currentCountryCurrencyCode &&
            currenciesData.rates[currentCountryCurrencyCode]
              ? currenciesData.rates[currentCountryCurrencyCode]
              : null,
          currency_code: currentCountryCurrencyCode ?? null,
          estimated_gdp: currentCountryCurrencyCode
            ? currenciesData.rates[currentCountryCurrencyCode]
              ? Math.random() * (2000 - 1000) + 1000
              : null
            : 0,
          last_refreshed_at: new Date().toISOString(),
        };
        countriesMap.set(currentCountryCurrencyCode, countryData);
      }

      res.json({
        countryData: Object.fromEntries(countriesMap.entries()),
        size: countriesMap.size,
      });
    } catch (err: unknown) {
      if (err instanceof HTTPError) {
        console.log("current map data", countriesMap.entries());
        console.error(err);
        res.status(err.statusCode).json({ message: err.message });
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

countriesRoute.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ message: "" });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default countriesRoute;
