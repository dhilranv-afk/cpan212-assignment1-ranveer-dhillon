# City Weather API

A REST API built with Express 5 and Node.js that retrieves current weather conditions and a three-day forecast for cities using the [Open-Meteo API](https://open-meteo.com/). It also supports comparing multiple cities and caching successful weather lookups with a configurable time-to-live (TTL).

## Requirements

- Node.js 24 or later
- npm
- Internet access to reach the Open-Meteo geocoding and forecast services

## Run it

Clone or download this repository, then open a terminal in the project directory.

```bash
npm install
cp .env.example .env
npm run dev
```

The development server runs at `http://localhost:4000` by default.

For production-style startup, use:

```bash
npm start
```

Keep the `.env` file local. Do not commit `.env` or `node_modules`.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port used by the Express server |
| `GEOCODING_URL` | `https://geocoding-api.open-meteo.com/v1` | Base URL for city geocoding |
| `FORECAST_URL` | `https://api.open-meteo.com/v1` | Base URL for weather forecasts |
| `UPSTREAM_TIMEOUT_MS` | `5000` | Timeout for each upstream request, in milliseconds |
| `CACHE_TTL_SECONDS` | `600` | How long successful weather results remain cached, in seconds |

## Endpoints

### 1. Get weather for a city

**Request**

```http
GET /api/weather?city=Toronto
```

Example with curl:

```bash
curl -i "http://localhost:4000/api/weather?city=Toronto"
```

Returns a `data` object containing location details, current conditions, a three-day forecast, the retrieval timestamp, and whether the result came from cache. The response also includes Open-Meteo attribution.

### 2. Compare multiple cities

**Request**

```http
GET /api/compare?cities=Toronto,Vancouver,Halifax
```

Example with curl:

```bash
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"
```

Accepts between two and five distinct city names. The response preserves the requested order, reports each city's success or failure, and includes a summary with the number of successful and failed lookups and the warmest and coldest successful results.

### 3. Get cache statistics

**Request**

```http
GET /api/cache/stats
```

Example with curl:

```bash
curl -i "http://localhost:4000/api/cache/stats"
```

Returns the number of active cache entries, cache hits, cache misses, and configured TTL in seconds.

## Error handling and validation

- `400 Bad Request`: Missing, repeated, or invalid query parameters; invalid comparison size; duplicate city names.
- `404 Not Found`: City not found or route not found.
- `502 Bad Gateway`: Upstream service errors, unsuccessful upstream responses, or invalid upstream JSON.
- `504 Gateway Timeout`: An upstream request exceeds the configured timeout.
- `500 Internal Server Error`: Unexpected server-side errors.

Successful weather results are cached using normalized, case-insensitive city keys. Invalid requests are rejected before the cache is queried.

## Testing

Start the server before running these commands. The expected status codes assume Open-Meteo is reachable for requests that need live data.

```bash
# 1. Weather for Toronto: 200
curl -i "http://localhost:4000/api/weather?city=Toronto"

# 2. Weather with a missing city: 400
curl -i "http://localhost:4000/api/weather"

# 3. Repeated city query parameter: 400
curl -i "http://localhost:4000/api/weather?city=Toronto&city=Vancouver"

# 4. Unknown city: 404
curl -i "http://localhost:4000/api/weather?city=NoSuchCityXYZ"

# 5. Compare three cities: 200
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"

# 6. Comparison with only one city: 400
curl -i "http://localhost:4000/api/compare?cities=Toronto"

# 7. Duplicate city names: 400
curl -i "http://localhost:4000/api/compare?cities=Toronto,toronto"

# 8. Comparison with more than five cities: 400
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax,Ottawa,Montreal,Calgary"

# 9. Cache statistics: 200
curl -i "http://localhost:4000/api/cache/stats"

# 10. Unknown route: 404
curl -i "http://localhost:4000/api/does-not-exist"
```

## Data source

Weather and geocoding data are provided by [Open-Meteo](https://open-meteo.com/). Responses from the weather endpoints include source attribution.

## AI use

ChatGPT was used for programming assistance during development, including help implementing and reviewing API modules, query validation, cache behavior, route handling, error handling, and API testing. The developer should review and understand the final implementation and verify that it meets the assignment requirements.
