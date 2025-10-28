import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from ".";
import { CountryMapData } from "../types";

const insertCountry = async (country: Omit<CountryMapData, "id">) => {
  try {
    const sql = `
   INSERT INTO Countries
        (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        capital = VALUES(capital),
        region = VALUES(region),
        population = VALUES(population),
        currency_code = VALUES(currency_code),
        exchange_rate = VALUES(exchange_rate),
        estimated_gdp = VALUES(estimated_gdp),
        flag_url = VALUES(flag_url),
        last_refreshed_at = VALUES(last_refreshed_at);
  `;

    const values = [
      country.name,
      country.capital,
      country.region,
      country.population,
      country.currency_code ?? null,
      country.exchange_rate ?? null,
      country.estimated_gdp ?? null,
      country.flag_url ?? null,
      country.last_refreshed_at,
    ];

    const [result] = await db.query(sql, values);
    return result;
  } catch (err) {
    throw err;
  }
};

const getAllCountries = async (): Promise<CountryMapData[]> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM Countries");
    return rows as CountryMapData[];
  } catch (err) {
    throw err;
  }
};

const getCountry = async (countryName: string): Promise<CountryMapData[]> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM Countries where name = (?)",
      countryName
    );
    return rows as CountryMapData[];
  } catch (err) {
    throw err;
  }
};

const deleteCountry = async (countryName: string): Promise<ResultSetHeader> => {
  try {
    const [query] = await db.query<ResultSetHeader>(
      "DELETE FROM Countries where name = (?)",
      countryName
    );
    return query;
  } catch (err) {
    throw err;
  }
};

const getTableCount = async (): Promise<{ total_countries: number }[]> => {
  try {
    const [result] = await db.query<RowDataPacket[]>(
      "Select Count(*) as total_countries from Countries"
    );
    return result as { total_countries: number }[];
  } catch (err) {
    throw err;
  }
};

const getLastUpdate = async (): Promise<{ last_refreshed_at: string }[]> => {
  try {
    const [result] = await db.query<RowDataPacket[]>(
      "Select last_refreshed_at from Countries limit 1;"
    );
    return result as { last_refreshed_at: string }[];
  } catch (err) {
    throw err;
  }
};

export {
  insertCountry,
  getAllCountries,
  getCountry,
  deleteCountry,
  getTableCount,
  getLastUpdate,
};
