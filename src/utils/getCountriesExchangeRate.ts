import { ExchangeApiReturn } from "../types";
import HTTPError from "./error";

const getCountriesExchangeRate = async (): Promise<ExchangeApiReturn> => {
  try {
    const request = await fetch(`${process.env.EXCHANGE_RATE_API}`);
    if (!request.ok) {
      throw new HTTPError(
        request.statusText || "Service unavailable",
        request.status
      );
    }
    const data = await request.json();
    return data;
  } catch (error: unknown) {
    throw error;
  }
};

export default getCountriesExchangeRate;
