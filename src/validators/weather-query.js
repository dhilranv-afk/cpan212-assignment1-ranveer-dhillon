
import { HttpError } from '../lib/http-error.js';

function invalidQuery(details) {
  throw new HttpError(400, 'Invalid query parameters', details);
}

export function parseCity(value) {
  if (typeof value !== 'string') {
    invalidQuery({ city: 'Provide exactly one city name.' });
  }

  const city = value.trim();

  if (city.length < 2 || city.length > 60) {
    invalidQuery({ city: 'City name must be between 2 and 60 characters.' });
  }

  return city;
}

export function parseCities(value) {
  if (typeof value !== 'string') {
    invalidQuery({ cities: 'Provide a comma-separated list of cities.' });
  }

  const cities = value.split(',').map((city) => city.trim());

  if (cities.length < 2 || cities.length > 5) {
    invalidQuery({ cities: 'Provide between 2 and 5 cities.' });
  }

  if (cities.some((city) => city.length < 2 || city.length > 60)) {
    invalidQuery({
      cities: 'Each city name must be between 2 and 60 characters.',
    });
  }

  const normalized = cities.map((city) => city.toLowerCase());

  if (new Set(normalized).size !== normalized.length) {
    invalidQuery({ cities: 'Duplicate city names are not allowed.' });
  }

  return cities;
}
