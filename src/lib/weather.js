
import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';
import { TtlCache } from './cache.js';

const weatherCache = new TtlCache(config.cacheTtlSeconds);

export async function getCityWeather(city) {
  const key = city.trim().toLowerCase();
  const cachedWeather = weatherCache.get(key);

  if (cachedWeather !== undefined) {
    return {
      ...cachedWeather,
      cached: true,
    };
  }

  const location = await geocodeCity(city);
  const forecast = await getForecast(
    location.latitude,
    location.longitude,
  );

  const current = forecast.current;
  const daily = forecast.daily;

  const fetchedAt = new Date().toISOString();

  const weather = {
    location: {
      name: location.name,
      region: location.region,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
    },
    current: {
      time: current.time,
      temperatureC: current.temperature_2m,
      feelsLikeC: current.apparent_temperature,
      humidityPercent: current.relative_humidity_2m,
      windKmh: current.wind_speed_10m,
      weatherCode: current.weather_code,
      conditions: describeWeatherCode(current.weather_code),
    },
    daily: daily.time.map((date, index) => ({
      date,
      minC: daily.temperature_2m_min[index],
      maxC: daily.temperature_2m_max[index],
      precipitationChancePercent:
        daily.precipitation_probability_max?.[index] ?? null,
      weatherCode: daily.weather_code[index],
      conditions: describeWeatherCode(daily.weather_code[index]),
    })),
    fetchedAt,
    cached: false,
  };

  weatherCache.set(key, weather);

  return weather;
}

export function getCacheStats() {
  return weatherCache.stats();
}
