/**
 * Maps Configuration
 * Configuración de API keys para Google Maps
 * 
 * Para obtener las API keys:
 * 1. Ve a https://console.cloud.google.com/
 * 2. Crea un nuevo proyecto o selecciona uno existente
 * 3. Habilita las siguientes APIs:
 *    - Maps SDK for Android
 *    - Maps SDK for iOS
 *    - Maps JavaScript API (para web)
 *    - Places API
 *    - Geocoding API
 * 4. Crea credenciales (API keys) para Android, iOS y Web
 * 5. Configura las restricciones de las API keys según tu app
 * 
 * Variables de entorno necesarias:
 * - EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY
 * - EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY
 * - EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY
 */

import Constants from 'expo-constants';

/**
 * Feature flag para desactivar Google Maps temporalmente
 * Cambiar a true cuando las API keys estén disponibles y configuradas
 */
export const USE_GOOGLE_MAPS = true;

// Helper para obtener variables de entorno (similar a supabase.ts)
// En Expo, las variables de entorno pueden estar en process.env o en Constants.expoConfig.extra
const getEnvVar = (key: string): string => {
  // Primero intentar process.env (funciona en desarrollo y web)
  if (process.env[key]) {
    return process.env[key] || '';
  }
  // Fallback a Constants.expoConfig.extra (para builds nativos)
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key] || '';
  }
  return '';
};

// API keys desde variables de entorno
export const GOOGLE_MAPS_ANDROID_API_KEY = getEnvVar('EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY');
export const GOOGLE_MAPS_IOS_API_KEY = getEnvVar('EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY');
export const GOOGLE_MAPS_WEB_API_KEY = getEnvVar('EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY');
export const GOOGLE_PLACES_API_KEY = getEnvVar('EXPO_PUBLIC_GOOGLE_PLACES_API_KEY') || GOOGLE_MAPS_ANDROID_API_KEY || GOOGLE_MAPS_IOS_API_KEY || GOOGLE_MAPS_WEB_API_KEY || '';

/**
 * Verifica si las API keys están configuradas
 * Útil para mostrar advertencias en desarrollo
 */
export function areMapsApiKeysConfigured(): boolean {
  if (__DEV__) {
    const hasAndroidKey = !!GOOGLE_MAPS_ANDROID_API_KEY;
    const hasIosKey = !!GOOGLE_MAPS_IOS_API_KEY;
    const hasWebKey = !!GOOGLE_MAPS_WEB_API_KEY;
    
    if (!hasAndroidKey || !hasIosKey || !hasWebKey) {
      console.warn(
        '⚠️ Google Maps API keys not configured. ' +
        'Set EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY, EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY, and EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY in your .env file'
      );
      // Debug: mostrar qué variables están disponibles
      console.log('Available env vars:', {
        hasAndroidKey: !!process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY,
        hasIosKey: !!process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY,
        hasWebKey: !!process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY,
        androidKeyLength: GOOGLE_MAPS_ANDROID_API_KEY.length,
        iosKeyLength: GOOGLE_MAPS_IOS_API_KEY.length,
        webKeyLength: GOOGLE_MAPS_WEB_API_KEY.length,
      });
    }
    
    return hasAndroidKey && hasIosKey && hasWebKey;
  }
  
  // En producción, asumimos que están configuradas
  return true;
}

