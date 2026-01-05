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
  timestamp: number;
  latitude: number;
  longitude: number;
}

/**
 * Obtiene la condición climática para una ubicación
 * Usa cache para evitar llamadas excesivas a la API
 */
export async function getWeatherCondition(
  latitude: number,
  longitude: number
): Promise<WeatherCondition> {
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
        return cacheData.condition;
      }
    }
  } catch (error) {
    console.error('Error reading weather cache:', error);
  }

  // Si no hay API key, retornar condición por defecto
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeatherMap API key not configured. Using default condition.');
    return 'default';
  }

  try {
    // Llamar a OpenWeatherMap API
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    const condition = mapWeatherCondition(data.weather[0]?.main?.toLowerCase() || '');

    // Guardar en cache
    const cacheData: WeatherCache = {
      condition,
      timestamp: Date.now(),
      latitude,
      longitude,
    };

    try {
      await AsyncStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving weather cache:', error);
    }

    return condition;
  } catch (error) {
    console.error('Error fetching weather:', error);
    // En caso de error, retornar condición por defecto
    return 'default';
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

