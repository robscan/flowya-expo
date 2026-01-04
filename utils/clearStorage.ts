/**
 * Utilidad para limpiar AsyncStorage
 * Útil para desarrollo y testing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Limpiar todos los datos guardados en AsyncStorage
 * Esto incluye:
 * - Spots (@mini_tours_spots)
 * - Paths (@mini_tours_paths)
 * - Saved data (@mini_tours_saved)
 */
export async function clearAllStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      '@mini_tours_spots',
      '@mini_tours_paths',
      '@mini_tours_saved',
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
    await AsyncStorage.removeItem('@mini_tours_spots');
    console.log('✅ Spots storage limpiado');
  } catch (error) {
    console.error('❌ Error limpiando spots storage:', error);
    throw error;
  }
}

/**
 * Limpiar solo los datos de paths
 */
export async function clearPathsStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem('@mini_tours_paths');
    console.log('✅ Paths storage limpiado');
  } catch (error) {
    console.error('❌ Error limpiando paths storage:', error);
    throw error;
  }
}

/**
 * Limpiar solo los datos guardados (likes, saves, etc.)
 */
export async function clearSavedStorage(): Promise<void> {
  try {
    await AsyncStorage.removeItem('@mini_tours_saved');
    console.log('✅ Saved data storage limpiado');
  } catch (error) {
    console.error('❌ Error limpiando saved data storage:', error);
    throw error;
  }
}

