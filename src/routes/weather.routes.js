import { Router } from 'express';
import { parseCity, parseCities } from '../validators/weather-query.js';
import { getCityWeather } from '../lib/weather.js';
import { HttpError } from '../lib/http-error.js';

export const weatherRouter = Router();

const attribution = 'Weather data by Open-Meteo.com (https://open-meteo.com/)';

weatherRouter.get('/weather', async (req, res) => {
  const city = parseCity(req.query.city);
  const data = await getCityWeather(city);

  res.json({ data, attribution });
});

weatherRouter.get('/compare', async (req, res) => {
  const cities = parseCities(req.query.cities);

  const settledResults = await Promise.allSettled(
    cities.map((city) => getCityWeather(city)),
  );

  const results = settledResults.map((result, index) => {
    if (result.status === 'fulfilled') {
      return {
        city: cities[index],
        ok: true,
        weather: result.value,
      };
    }

    const error = result.reason;
    const status = error instanceof HttpError ? error.status : 500;

    if (!(error instanceof HttpError)) {
      console.error(error);
    }

    return {
      city: cities[index],
      ok: false,
      error: {
        status,
        message:
          error instanceof HttpError
            ? error.message
            : 'Internal server error',
      },
    };
  });

  const successful = results.filter((result) => result.ok);
  const failed = results.length - successful.length;

  let warmest = null;
  let coldest = null;

  for (const result of successful) {
    const temperature = result.weather.current.temperatureC;

    if (
      warmest === null ||
      temperature > warmest.temperatureC
    ) {
      warmest = {
        city: result.city,
        temperatureC: temperature,
      };
    }

    if (
      coldest === null ||
      temperature < coldest.temperatureC
    ) {
      coldest = {
        city: result.city,
        temperatureC: temperature,
      };
    }
  }

  res.json({
    data: {
      cities: results,
      summary: {
        succeeded: successful.length,
        failed,
        warmest,
        coldest,
      },
    },
    attribution,
  });
});
