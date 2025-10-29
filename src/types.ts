import z from "zod";

type BaseCountryInfo = { independent: boolean };

type ExchangeApiReturn = {
  base_code: string;
  rates: Record<string, number>;
};

type QueryCountriesByName = { name: string } & BaseCountryInfo;

type QueryCountriesByCapital = {
  capital: string;
} & BaseCountryInfo;

type QueryCountriesByRegion = {
  region: string;
} & BaseCountryInfo;

type QueryCountriesByPopulation = {
  population: string;
} & BaseCountryInfo;

type QueryCountriesByFlag = {
  flag: string;
} & BaseCountryInfo;

type QueryCountriesByCurrencies = {
  currencies: {
    code: string;
    name: string;
    symbol: string;
  }[];
} & BaseCountryInfo;

type CountriesApiResponse = {
  name: QueryCountriesByName[];
  capital: QueryCountriesByCapital[];
  region: QueryCountriesByRegion[];
  population: QueryCountriesByPopulation[];
  flag: QueryCountriesByFlag[];
  currencies: QueryCountriesByCurrencies[];
};

type AllCountriesData = {
  name: string;
  capital: string;
  region: string;
  population: number;
  flag: string | null;
  independent: boolean;
  currencies: Currency[] | null;
};

type Currency = {
  code: string;
  name: string;
  symbol: string;
};

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

const sortOptions = [
  "gdp_asc",
  "gdp_desc",
  "population_asc",
  "population_desc",
] as const;

const getCountriesQuerySchema = z
  .object({
    region: z.string().optional(),
    currency: z.string().optional(),
    population: z.coerce.number().optional(),
    currency_code: z.string().optional(),
    exchange_rate: z.coerce.number().optional(),
    sort: z.enum(sortOptions).optional(),
  })
  .strict();

type getCountriesQueryParams = z.infer<typeof getCountriesQuerySchema>;
type Country = {
  name: string;
  estimated_gdp: number;
};

export type {
  ExchangeApiReturn,
  CountriesApiResponse,
  AllCountriesData,
  CountryMapData,
  getCountriesQueryParams,
  Country,
};
export { getCountriesQuerySchema };
