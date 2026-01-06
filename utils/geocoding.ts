/**
 * Geocoding Utility
 * Funciones para obtener nombres de ciudades y coordenadas
 * 
 * Usa Google Geocoding API a través de placesApi.ts
 * También incluye ciudades predefinidas de Riviera Maya
 */

import { reverseGeocode, GeocodeResult } from './placesApi';
import { calculateDistance } from './distance';

// Ciudades predefinidas de Riviera Maya
export interface PredefinedCity {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const PREDEFINED_CITIES: PredefinedCity[] = [
  {
    name: 'Cancún',
    coordinates: {
      latitude: 21.1619,
      longitude: -86.8515,
    },
  },
  {
    name: 'Playa del Carmen',
    coordinates: {
      latitude: 20.6296,
      longitude: -87.0731,
    },
  },
  {
    name: 'Puerto Morelos',
    coordinates: {
      latitude: 20.8500,
      longitude: -86.8667,
    },
  },
  {
    name: 'Tulum',
    coordinates: {
      latitude: 20.2114,
      longitude: -87.4653,
    },
  },
  {
    name: 'Akumal',
    coordinates: {
      latitude: 20.3961,
      longitude: -87.3139,
    },
  },
  {
    name: 'Cozumel',
    coordinates: {
      latitude: 20.5083,
      longitude: -86.9458,
    },
  },
];

/**
 * Obtener nombre de ciudad desde coordenadas
 * Usa reverse geocoding para extraer el nombre de la ciudad
 * Busca múltiples tipos de componentes para mejor precisión
 */
export async function getCityNameFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const result = await reverseGeocode(latitude, longitude);
    if (!result) {
      console.warn('Reverse geocoding returned no result');
      return null;
    }

    // Intentar extraer el nombre de la ciudad de los componentes de dirección
    if (result.addressComponents && result.addressComponents.length > 0) {
      // Prioridad 1: Buscar componente de tipo "locality" (ciudad principal)
      const cityComponent = result.addressComponents.find((comp) =>
        comp.types.includes('locality')
      );
      if (cityComponent) {
        console.log('Found city name from locality:', cityComponent.longName);
        return cityComponent.longName;
      }

      // Prioridad 2: Buscar "sublocality_level_1" o "sublocality" (barrio/área urbana)
      const sublocalityComponent = result.addressComponents.find((comp) =>
        comp.types.some(type => type.includes('sublocality'))
      );
      if (sublocalityComponent) {
        console.log('Found city name from sublocality:', sublocalityComponent.longName);
        return sublocalityComponent.longName;
      }

      // Prioridad 3: Buscar "neighborhood" (vecindario)
      const neighborhoodComponent = result.addressComponents.find((comp) =>
        comp.types.includes('neighborhood')
      );
      if (neighborhoodComponent) {
        console.log('Found city name from neighborhood:', neighborhoodComponent.longName);
        return neighborhoodComponent.longName;
      }

      // Prioridad 4: Buscar "administrative_area_level_2" (municipio/condado)
      const adminComponent = result.addressComponents.find((comp) =>
        comp.types.includes('administrative_area_level_2')
      );
      if (adminComponent) {
        console.log('Found city name from administrative_area_level_2:', adminComponent.longName);
        return adminComponent.longName;
      }

      // Prioridad 5: Buscar "administrative_area_level_1" (estado/provincia) como último recurso
      const stateComponent = result.addressComponents.find((comp) =>
        comp.types.includes('administrative_area_level_1')
      );
      if (stateComponent) {
        console.log('Found city name from administrative_area_level_1:', stateComponent.longName);
        return stateComponent.longName;
      }
    }

    // Si no se encuentra componente específico, intentar parsear formattedAddress
    if (result.formattedAddress) {
      // Dividir por comas y tomar la primera parte (generalmente el nombre de la ciudad)
      const parts = result.formattedAddress.split(',');
      if (parts.length > 0) {
        const firstPart = parts[0].trim();
        // Filtrar partes comunes que no son nombres de ciudad
        if (firstPart && !firstPart.match(/^\d+/)) { // No empieza con número (dirección)
          console.log('Found city name from formattedAddress:', firstPart);
          return firstPart;
        }
        // Si la primera parte es una dirección, intentar con la segunda
        if (parts.length > 1) {
          const secondPart = parts[1].trim();
          console.log('Found city name from formattedAddress (second part):', secondPart);
          return secondPart;
        }
      }
    }

    console.warn('Could not extract city name from geocoding result');
    return null;
  } catch (error) {
    console.error('Error getting city name from coordinates:', error);
    return null;
  }
}

/**
 * Obtener coordenadas desde nombre de ciudad
 * Primero busca en ciudades predefinidas, luego usa geocoding si no se encuentra
 */
export async function getCoordinatesFromCityName(
  cityName: string
): Promise<{ latitude: number; longitude: number } | null> {
  // Buscar en ciudades predefinidas primero (más rápido y sin costo)
  const predefined = PREDEFINED_CITIES.find(
    (city) => city.name.toLowerCase() === cityName.toLowerCase()
  );
  if (predefined) {
    return predefined.coordinates;
  }

  // Si no se encuentra, usar geocoding API
  // Nota: Esto requeriría implementar geocoding forward, pero por ahora
  // solo usamos ciudades predefinidas según el plan
  console.warn(`City "${cityName}" not found in predefined cities`);
  return null;
}

/**
 * Verificar si una ciudad está en la lista predefinida
 */
export function isPredefinedCity(cityName: string): boolean {
  return PREDEFINED_CITIES.some(
    (city) => city.name.toLowerCase() === cityName.toLowerCase()
  );
}

/**
 * Obtener todas las ciudades predefinidas
 */
export function getPredefinedCities(): PredefinedCity[] {
  return PREDEFINED_CITIES;
}

/**
 * Encontrar la ciudad predefinida más cercana a las coordenadas dadas
 * @param latitude Latitud
 * @param longitude Longitud
 * @param maxDistanceMeters Distancia máxima en metros (default: 10000 = 10km)
 * @returns Ciudad predefinida más cercana o null si no hay ninguna dentro del radio
 */
export function findNearestPredefinedCity(
  latitude: number,
  longitude: number,
  maxDistanceMeters: number = 10000
): PredefinedCity | null {
  let nearestCity: PredefinedCity | null = null;
  let minDistance = Infinity;

  for (const city of PREDEFINED_CITIES) {
    const distance = calculateDistance(
      latitude,
      longitude,
      city.coordinates.latitude,
      city.coordinates.longitude
    );

    if (distance < minDistance && distance <= maxDistanceMeters) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  if (nearestCity) {
    console.log(`Found nearest predefined city: ${nearestCity.name} (${Math.round(minDistance)}m away)`);
  } else {
    console.log(`No predefined city found within ${maxDistanceMeters}m`);
  }

  return nearestCity;
}

