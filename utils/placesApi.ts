/**
 * Google Places API Utility
 * Scope 2: Google Places API - Búsqueda y Autocompletado
 * 
 * Funcionalidades:
 * - Autocomplete: Búsqueda de lugares mientras el usuario escribe
 * - Place Details: Obtener detalles completos de un lugar
 * - Reverse Geocoding: Obtener dirección desde coordenadas
 * - Nearby Search: Buscar lugares cercanos
 * 
 * Usa Google Places API (REST - Classic)
 * Documentación: https://developers.google.com/maps/documentation/places/web-service
 * 
 * Costos (aproximados):
 * - Autocomplete: $2.83 por 1000 requests
 * - Place Details: $17 por 1000 requests
 * - Geocoding: $5 por 1000 requests
 * - Nearby Search: $32 por 1000 requests
 * 
 * Free tier: $200 crédito mensual (equivalente a ~70,000 autocomplete requests)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_PLACES_API_KEY } from './mapsConfig';

const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const GEOCODING_API_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Cache keys
const PLACES_CACHE_KEY = '@flowya_places_cache';
const PLACE_DETAILS_CACHE_KEY = '@flowya_place_details_cache';
const GEOCODE_CACHE_KEY = '@flowya_geocode_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText?: string;
  secondaryText?: string;
  types?: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  types: string[];
  photos?: string[];
  rating?: number;
  userRatingCount?: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: {
    openNow?: boolean;
    weekdayText?: string[];
  };
  priceLevel?: number;
  addressComponents?: Array<{
    longName: string;
    shortName: string;
    types: string[];
  }>;
}

export interface GeocodeResult {
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  addressComponents?: Array<{
    longName: string;
    shortName: string;
    types: string[];
  }>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Obtener datos del cache
 */
async function getCached<T>(cacheKey: string, key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const cache: Record<string, CacheEntry<T>> = JSON.parse(cached);
      const entry = cache[key];
      if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
        return entry.data;
      }
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return null;
}

/**
 * Guardar datos en cache
 */
async function setCached<T>(cacheKey: string, key: string, data: T): Promise<void> {
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    const cache: Record<string, CacheEntry<T>> = cached ? JSON.parse(cached) : {};
    cache[key] = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

/**
 * Autocomplete: Buscar lugares mientras el usuario escribe
 * Usa Places API (REST) - Autocomplete
 */
export async function searchPlaces(
  query: string,
  location?: { latitude: number; longitude: number },
  radius?: number
): Promise<PlacePrediction[]> {
  if (!query.trim()) {
    return [];
  }

  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured');
    return [];
  }

  const cacheKey = `autocomplete_${query}_${location ? `${location.latitude},${location.longitude}` : ''}_${radius || ''}`;
  const cached = await getCached<PlacePrediction[]>(PLACES_CACHE_KEY, cacheKey);
  if (cached) {
    return cached;
  }

  try {
    let url = `${PLACES_API_BASE_URL}/autocomplete/json?input=${encodeURIComponent(query)}&language=es&key=${GOOGLE_PLACES_API_KEY}`;
    
    if (location) {
      url += `&location=${location.latitude},${location.longitude}&radius=${radius || 5000}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API error: ${data.status}`);
    }

    const predictions: PlacePrediction[] = (data.predictions || []).map((prediction: any) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text,
      secondaryText: prediction.structured_formatting?.secondary_text,
      types: prediction.types || [],
    }));

    await setCached(PLACES_CACHE_KEY, cacheKey, predictions);
    return predictions;
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

/**
 * Obtener detalles completos de un lugar
 * Usa Places API (REST) - Place Details
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!placeId) {
    return null;
  }

  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured');
    return null;
  }

  const cacheKey = `details_${placeId}`;
  const cached = await getCached<PlaceDetails>(PLACE_DETAILS_CACHE_KEY, cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const fields = [
      'place_id',
      'name',
      'formatted_address',
      'geometry',
      'types',
      'photos',
      'rating',
      'user_ratings_total',
      'formatted_phone_number',
      'website',
      'opening_hours',
      'price_level',
      'address_components',
    ].join(',');

    const response = await fetch(
      `${PLACES_API_BASE_URL}/details/json?place_id=${placeId}&fields=${fields}&language=es&key=${GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Place Details API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Place Details API error: ${data.status}`);
    }

    const result = data.result;
    const placeDetails: PlaceDetails = {
      placeId: result.place_id || placeId,
      name: result.name || '',
      formattedAddress: result.formatted_address || '',
      location: {
        latitude: result.geometry?.location?.lat || 0,
        longitude: result.geometry?.location?.lng || 0,
      },
      types: result.types || [],
      photos: result.photos?.slice(0, 5).map((photo: any) => 
        `${PLACES_API_BASE_URL}/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      ) || [],
      rating: result.rating,
      userRatingCount: result.user_ratings_total,
      phoneNumber: result.formatted_phone_number,
      website: result.website,
      openingHours: result.opening_hours
        ? {
            openNow: result.opening_hours.open_now,
            weekdayText: result.opening_hours.weekday_text,
          }
        : undefined,
      priceLevel: result.price_level,
      addressComponents: result.address_components?.map((comp: any) => ({
        longName: comp.long_name,
        shortName: comp.short_name,
        types: comp.types || [],
      })),
    };

    await setCached(PLACE_DETAILS_CACHE_KEY, cacheKey, placeDetails);
    return placeDetails;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

/**
 * Reverse Geocoding: Obtener dirección desde coordenadas
 * Usa Geocoding API
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured');
    return null;
  }

  const cacheKey = `reverse_${latitude}_${longitude}`;
  const cached = await getCached<GeocodeResult>(GEOCODE_CACHE_KEY, cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(
      `${GEOCODING_API_BASE_URL}?latlng=${latitude},${longitude}&language=en&key=${GOOGLE_PLACES_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null;
    }

    const result = data.results[0];
    const geocodeResult: GeocodeResult = {
      formattedAddress: result.formatted_address,
      location: {
        latitude,
        longitude,
      },
      addressComponents: result.address_components?.map((comp: any) => ({
        longName: comp.long_name,
        shortName: comp.short_name,
        types: comp.types || [],
      })),
    };

    await setCached(GEOCODE_CACHE_KEY, cacheKey, geocodeResult);
    return geocodeResult;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
}

/**
 * Buscar lugares cercanos
 * Usa Places API (REST) - Nearby Search
 */
export async function searchNearby(
  location: { latitude: number; longitude: number },
  radius: number = 5000,
  type?: string
): Promise<PlaceDetails[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('Google Places API key not configured');
    return [];
  }

  const cacheKey = `nearby_${location.latitude}_${location.longitude}_${radius}_${type || ''}`;
  const cached = await getCached<PlaceDetails[]>(PLACES_CACHE_KEY, cacheKey);
  if (cached) {
    return cached;
  }

  try {
    let url = `${PLACES_API_BASE_URL}/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&language=es&key=${GOOGLE_PLACES_API_KEY}`;
    
    if (type) {
      url += `&type=${type}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Nearby Search API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Nearby Search API error: ${data.status}`);
    }

    const places: PlaceDetails[] = (data.results || []).map((result: any) => ({
      placeId: result.place_id,
      name: result.name || '',
      formattedAddress: result.vicinity || result.formatted_address || '',
      location: {
        latitude: result.geometry?.location?.lat || 0,
        longitude: result.geometry?.location?.lng || 0,
      },
      types: result.types || [],
      rating: result.rating,
      userRatingCount: result.user_ratings_total,
      photos: result.photos?.slice(0, 1).map((photo: any) => 
        `${PLACES_API_BASE_URL}/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      ) || [],
    }));

    await setCached(PLACES_CACHE_KEY, cacheKey, places);
    return places;
  } catch (error) {
    console.error('Error searching nearby places:', error);
    return [];
  }
}
