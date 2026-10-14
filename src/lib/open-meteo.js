
import { config } from '../config.js';
import { HttpError } from './http-error.js';

async function fetchJson(url, serviceName) {
  let response;

  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(config.upstreamTimeoutMs),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError') {
      throw new HttpError(
        504,
        `The ${serviceName} did not respond within ${config.upstreamTimeoutMs} ms`,
      );
    }

    throw new HttpError(
      502,
      `Could not get a valid response from the ${serviceName}`,
    );
  }

  if (!response.ok) {
    throw new HttpError(
      502,
      `The ${serviceName} returned HTTP ${response.status}`,
    );
  }

  try {
    return await response.json();
  } catch (error) {
    if (error?.name === 'TimeoutError') {
      throw new HttpError(
        504,
        `The ${serviceName} did not respond within ${config.upstreamTimeoutMs} ms`,
      );
    }

    throw new HttpError(
      502,
      `The ${serviceName} returned invalid JSON`,
    );
  }
}

export async function geocodeCity(name) {
  const url = new URL(`${config.geocodingUrl}/search`);

  url.search = new URLSearchParams({
    name,
    count: '1',
    language: 'en',
    format: 'json',
  }).toString();

  const body = await fetchJson(url, 'geocoding service');
  const result = body.results?.[0];

  if (!result) {
    throw new HttpError(404, `City not found: ${name}`);
  }

  return {
    name: result.name,
    region: result.admin1 ?? null,
    country: result.country ?? null,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

export async function getForecast(latitude, longitude) {
  const url = new URL(`${config.forecastUrl}/forecast`);

  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '3',
  }).toString();

  return fetchJson(url, 'forecast service');
}
