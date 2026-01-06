/**
 * Utilidad para limpiar AsyncStorage
 * Útil para desarrollo y testing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Limpiar todos los datos guardados en AsyncStorage
 * Esto incluye:
 * - Spots (@flowya_spots)
 * - Flows (@flowya_flows)
 * - Saved data (@flowya_saved)
 * - Preferences (@flowya_preferences)
 */
export async function clearAllStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      '@flowya_spots',
      '@flowya_flows',
      '@flowya_saved',
      '@flowya_preferences',
      // Mantener compatibilidad con keys antiguas por si acaso
      '@mini_tours_spots',
      '@mini_tours_paths',
      '@mini_tours_flows',
      '@mini_tours_saved',
      '@mini_tours_preferences',
    ]);
    console.log('✅ AsyncStorage limpiado correctamente');
  } catch (error) {
    console.error('❌ Error limpiando AsyncStorage:', error);
    throw error;
  }
}

/**
 * Limpiar solo los datos de spots
 */
export async function clearSpotsStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(['@flowya_spots', '@mini_tours_spots']);
    console.log('✅ Spots storage limpiado');
  } catch (error) {
    console.error('❌ Error limpiando spots storage:', error);
    throw error;
  }
}

/**
 * Limpiar solo los datos de flows
 */
export async function clearPathsStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(['@flowya_flows', '@mini_tours_paths', '@mini_tours_flows']);
    console.log('✅ Flows storage limpiado');
  } catch (error) {
    console.error('❌ Error limpiando flows storage:', error);
    throw error;
  }
}

/**
 * Limpiar solo los datos guardados (likes, saves, etc.)
 */
export async function clearSavedStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(['@flowya_saved', '@mini_tours_saved']);
    console.log('✅ Saved data storage limpiado');
  } catch (error) {
    console.error('❌ Error limpiando saved data storage:', error);
    throw error;
  }
}

