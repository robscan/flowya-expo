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
 *    - Places API
 *    - Geocoding API
 * 4. Crea credenciales (API keys) para Android e iOS
 * 5. Configura las restricciones de las API keys según tu app
 * 
 * Variables de entorno necesarias:
 * - EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY
 * - EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY
 */

/**
 * Feature flag para desactivar Google Maps temporalmente
 * Cambiar a true cuando las API keys estén disponibles y configuradas
 */
export const USE_GOOGLE_MAPS = true;

// API keys desde variables de entorno
export const GOOGLE_MAPS_ANDROID_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY || '';
export const GOOGLE_MAPS_IOS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY || '';
export const GOOGLE_MAPS_WEB_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY || '';
export const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || GOOGLE_MAPS_ANDROID_API_KEY || GOOGLE_MAPS_IOS_API_KEY || GOOGLE_MAPS_WEB_API_KEY || '';

/**
 * Verifica si las API keys están configuradas
 * Útil para mostrar advertencias en desarrollo
 */
export function areMapsApiKeysConfigured(): boolean {
  if (__DEV__) {
    const hasAndroidKey = !!GOOGLE_MAPS_ANDROID_API_KEY;
    const hasIosKey = !!GOOGLE_MAPS_IOS_API_KEY;
    
    if (!hasAndroidKey || !hasIosKey) {
      console.warn(
        '⚠️ Google Maps API keys not configured. ' +
        'Set EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY and EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY in your .env file'
      );
    }
    
    return hasAndroidKey && hasIosKey;
  }
  
  // En producción, asumimos que están configuradas
  return true;
}

