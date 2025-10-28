import { ExchangeApiReturn } from "../types";
import HTTPError from "./error";

const getCountriesExchangeRate = async (): Promise<ExchangeApiReturn> => {
  try {
    const request = await fetch(`${process.env.EXCHANGE_RATE_API}`);
    if (!request.ok) {
      throw new Error();
    }
    const data = await request.json();
    return data;
  } catch (error: unknown) {
    throw new HTTPError(
      "External data source unavailable",
      503,
      "Exchange rate API"
    );
  }
};

export default getCountriesExchangeRate;
