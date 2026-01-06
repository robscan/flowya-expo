/**
 * Weather Utility
 * Obtiene condiciones climáticas para el degradado sutil en Home
 * 
 * Usa OpenWeatherMap API (gratuita con registro)
 * Free tier: 1,000 calls/day
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const WEATHER_CACHE_KEY = '@flowya_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en milisegundos

// Para desarrollo: usar una API key de prueba o configurar en variables de entorno
// En producción, esto debe estar en variables de entorno
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';

export type WeatherCondition =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
  | 'mist'
  | 'fog'
  | 'drizzle'
  | 'night-clouds'
  | 'default';

interface WeatherCache {
  condition: WeatherCondition;
  temperature: number; // Temperature in Celsius
  timestamp: number;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  condition: WeatherCondition;
  temperature: number; // Temperature in Celsius
}

/**
 * Obtiene la condición climática para una ubicación
 * Usa cache para evitar llamadas excesivas a la API
 */
export async function getWeatherCondition(
  latitude: number,
  longitude: number
): Promise<WeatherCondition> {
  const weatherData = await getWeatherData(latitude, longitude);
  return weatherData.condition;
}

/**
 * Obtiene datos completos del clima (condición y temperatura) para una ubicación
 * Usa cache para evitar llamadas excesivas a la API
 */
export async function getWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  // Verificar cache primero
  try {
    const cached = await AsyncStorage.getItem(WEATHER_CACHE_KEY);
    if (cached) {
      const cacheData: WeatherCache = JSON.parse(cached);
      const now = Date.now();
      const isSameLocation =
        Math.abs(cacheData.latitude - latitude) < 0.01 &&
        Math.abs(cacheData.longitude - longitude) < 0.01;

      // Si el cache es válido (menos de 30 minutos y misma ubicación), usar cache
      if (now - cacheData.timestamp < CACHE_DURATION && isSameLocation) {
        return {
          condition: cacheData.condition,
          temperature: cacheData.temperature,
        };
      }
    }
  } catch (error) {
    console.error('Error reading weather cache:', error);
  }

  // Si no hay API key, retornar datos por defecto
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeatherMap API key not configured. Using default data.');
    return {
      condition: 'default',
      temperature: 20, // Default temperature
    };
  }

  try {
    // Llamar a OpenWeatherMap API con unidades métricas (Celsius)
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const condition = mapWeatherCondition(data.weather[0]?.main?.toLowerCase() || '');
    const temperature = Math.round(data.main?.temp || 20); // Temperature in Celsius, rounded

    // Guardar en cache
    const cacheData: WeatherCache = {
      condition,
      temperature,
      timestamp: Date.now(),
      latitude,
      longitude,
    };

    try {
      await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving weather cache:', error);
    }

    return {
      condition,
      temperature,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // En caso de error, retornar datos por defecto
    return {
      condition: 'default',
      temperature: 20,
    };
  }
}

/**
 * Mapea la condición de OpenWeatherMap a nuestro tipo WeatherCondition
 */
function mapWeatherCondition(weatherMain: string): WeatherCondition {
  const normalized = weatherMain.toLowerCase();

  if (normalized === 'clear') return 'clear';
  if (normalized === 'clouds') return 'clouds';
  if (normalized === 'rain') return 'rain';
  if (normalized === 'snow') return 'snow';
  if (normalized === 'thunderstorm') return 'thunderstorm';
  if (normalized === 'mist' || normalized === 'fog') return 'mist';
  if (normalized === 'drizzle') return 'drizzle';

  return 'default';
}

/**
 * Obtiene el color del degradado basado en la condición climática
 * Colores muy sutiles (opacidad baja 5-10%)
 */
export function getWeatherGradientColor(
  condition: WeatherCondition,
  colorScheme: 'light' | 'dark' | null
): string {
  const isDark = colorScheme === 'dark';

  switch (condition) {
    case 'clear':
      // Amarillo dorado suave para soleado
      return isDark ? 'rgba(255, 235, 180, 0.08)' : 'rgba(255, 235, 180, 0.06)';
    case 'clouds':
      // Gris suave para nublado
      return isDark ? 'rgba(150, 150, 150, 0.06)' : 'rgba(150, 150, 150, 0.04)';
    case 'rain':
      // Azul grisáceo para lluvia
      return isDark ? 'rgba(150, 180, 220, 0.08)' : 'rgba(150, 180, 220, 0.06)';
    case 'snow':
      // Blanco/azul claro para nevado
      return isDark ? 'rgba(200, 220, 255, 0.08)' : 'rgba(200, 220, 255, 0.06)';
    case 'thunderstorm':
      // Gris oscuro para tormenta
      return isDark ? 'rgba(100, 100, 120, 0.06)' : 'rgba(100, 100, 120, 0.04)';
    case 'mist':
    case 'fog':
      // Gris pálido para niebla
      return isDark ? 'rgba(180, 180, 200, 0.05)' : 'rgba(180, 180, 200, 0.03)';
    case 'drizzle':
      // Azul suave para llovizna
      return isDark ? 'rgba(170, 200, 230, 0.07)' : 'rgba(170, 200, 230, 0.05)';
    case 'night-clouds':
      // Gris azulado/morado oscuro muy sutil para noche con nubes
      // Color nebuloso que evoca cielo nocturno con nubes
      return isDark ? 'rgba(80, 90, 140, 0.08)' : 'rgba(100, 110, 150, 0.06)';
    default:
      // Sin degradado o muy sutil para condiciones no reconocidas
      return 'transparent';
  }
}

/**
 * Convertir temperatura de Celsius a Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Convertir temperatura de Fahrenheit a Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

/**
 * Detectar si es día o noche basado en coordenadas y fecha
 * Usa fórmula astronómica aproximada para calcular salida/puesta del sol
 */
export function isDaytime(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): boolean {
  // Convertir latitud y longitud a radianes
  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;

  // Calcular día juliano
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

  // Día juliano (simplificado)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const julianDay = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Día del año (1-365)
  const dayOfYear = Math.floor((julianDay - Math.floor((year - 1) * 365.25) - 1));

  // Declinación solar (aproximada)
  const declination = 23.45 * Math.sin((360 / 365) * (284 + dayOfYear) * (Math.PI / 180));

  // Ecuación del tiempo (aproximada, en minutos)
  const B = (360 / 365) * (dayOfYear - 81) * (Math.PI / 180);
  const equationOfTime = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // Hora solar local (ajustada por ecuación del tiempo y longitud)
  const solarTime = hour + (longitude * 4) / 60 + equationOfTime / 60;

  // Ángulo horario
  const hourAngle = (solarTime - 12) * 15;

  // Ángulo de elevación solar
  const elevation = Math.asin(
    Math.sin(declination * (Math.PI / 180)) * Math.sin(latRad) +
    Math.cos(declination * (Math.PI / 180)) * Math.cos(latRad) * Math.cos(hourAngle * (Math.PI / 180))
  );

  // Convertir a grados
  const elevationDegrees = (elevation * 180) / Math.PI;

  // Es día si la elevación solar es mayor que -0.83 grados (considerando refracción atmosférica)
  // -0.83 grados es aproximadamente cuando el sol está en el horizonte
  return elevationDegrees > -0.83;
}

