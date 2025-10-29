import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from ".";
import { Country, CountryMapData, getCountriesQueryParams } from "../types";
import generateSummaryImage from "../utils/generateSummaryImage";

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

const sortFieldMap: Record<string, string> = {
  gdp: "estimated_gdp",
  population: "population",
  exchange_rate: "exchange_rate",
};

const getAllCountries = async (
  filters: getCountriesQueryParams
): Promise<CountryMapData[]> => {
  const { currency, region, population, currency_code, exchange_rate, sort } =
    filters;

  let query = "SELECT * FROM Countries";
  const conditions: string[] = [];
  const values: any[] = [];

  if (region) {
    conditions.push("region = ?");
    values.push(region);
  }
  if (currency) {
    conditions.push("currency_code = ?");
    values.push(currency);
  }
  if (population) {
    conditions.push("population = ?");
    values.push(population);
  }
  if (currency_code) {
    conditions.push("currency_code = ?");
    values.push(currency_code);
  }
  if (exchange_rate) {
    conditions.push("exchange_rate = ?");
    values.push(exchange_rate);
  }

  if (conditions.length > 0) {
    query += " where " + conditions.join(" and ");
  }

  if (sort) {
    const [field, order] = sort.split("_");

    const allowedOrders = ["asc", "desc"];
    const column = sortFieldMap[field];

    if (column.includes(field) && allowedOrders.includes(order)) {
      query += ` order by ${column} ${order.toUpperCase()}`;
    }
  }

  try {
    const [rows] = await db.query<RowDataPacket[]>(query, values);
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

const generateImage = async (): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT name, estimated_gdp FROM Countries ORDER BY estimated_gdp DESC limit 5"
    );
    const top5 = rows as Country[];
    const timestamp = new Date().toLocaleString();

    await generateSummaryImage(top5);
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
  generateImage,
};
