import { AllCountriesData, CountriesApiResponse } from "../types";
import HTTPError from "./error";

const getCountriesData = async <K extends keyof CountriesApiResponse>(
  query: K
): Promise<CountriesApiResponse[K]> => {
  try {
    const request = await fetch(`${process.env.COUNTRIES_API}=${query}`);
    if (!request.ok) {
      throw new Error();
    }
    const data = await request.json();
    return data;
  } catch (error: unknown) {
    throw error;
  }
};

export default getCountriesData;

const getAllCountriesData = async (): Promise<AllCountriesData[]> => {
  try {
    const request = await fetch(`${process.env.COUNTRIES_API_ALL}`);
    if (!request.ok) {
      throw new Error();
    }
    const data = await request.json();
    return data;
  } catch (err) {
    console.error("error occured", err);
    throw new HTTPError(
      "External data source unavailable",
      503,
      "Rest countries API"
    );
  }
};

export { getAllCountriesData };
