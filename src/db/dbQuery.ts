import { OkPacket, ResultSetHeader, RowDataPacket } from "mysql2";
import db from ".";
import { CountryMapData } from "../types";

const insertCountry = async (country: Omit<CountryMapData, "id">) => {
  try {
    const sql = `
    INSERT INTO Countries
    (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    ];

    const [result] = await db.query(sql, values);
    console.log("input result", result);
    return result;
  } catch (err) {
    // const errMessage  = err instanceof Error ? err.message : 'Unexpected error'
    throw err;
  }
};

const getAllCountries = async (): Promise<CountryMapData[]> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>("SELECT * FROM Countries");
    console.log("all data", rows);
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
    console.log("country data", rows);
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
    console.log("delete query resutl", query);
    return query;
  } catch (err) {
    throw err;
  }
};

export { insertCountry, getAllCountries, getCountry, deleteCountry };
