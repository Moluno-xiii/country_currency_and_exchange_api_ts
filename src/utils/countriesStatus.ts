class CountriesStatus {
  private refreshedAt: string | null = null;
  private totalCountries: number = 0;
  private static instance: CountriesStatus | null;

  private constructor() {}

  static instantiate = () => {
    if (CountriesStatus.instance) {
      return CountriesStatus.instance;
    }

    return new CountriesStatus();
  };

  updateRefreshDate = (date: string) => {
    this.refreshedAt = date;
  };

  updateTotalCountries = (newTotal: number) => {
    this.totalCountries = newTotal;
  };

  getRefreshDate = () => {
    return this.refreshedAt;
  };

  getTotal = () => {
    return this.totalCountries;
  };
}

const countriesStatus = CountriesStatus.instantiate();
export default countriesStatus;
