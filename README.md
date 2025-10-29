# Countries currency and exchange API.

Fetches countries data from external API's and caches them in a MySQL db for read, and write.

## Technologies used

- [Typescript](https://yaak.app/download)
- [Express](https://expressjs.com/)
- [Yaak API client](https://yaak.app/download)
- [Aiven cloud service](https://aiven.io/)
- ### External APIs
  - [Open Er ](https://open.er-api.com/v6/latest/USD)
  - [Rest countries](https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies)

## Valid routes

- GET /countries/:name
- POST /countries/refresh
- DELETE /countries/:name
- GET /countries? => query params = region, currency, population, sort[population_asc, population_desc, gdp_asc, gdp_asc]
- GET /countries/image
- GET /status
- GET /
