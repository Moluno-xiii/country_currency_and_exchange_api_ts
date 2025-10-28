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

export type { ExchangeApiReturn, CountriesApiResponse, AllCountriesData };
