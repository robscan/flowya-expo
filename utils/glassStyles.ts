/**
 * Utilidades para estilos Glass (Apple Style)
 * Efecto blur y transparencia para glassmorphism
 */

import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

// Opacidades glass
export const glassOpacity = {
  strong: 0.95,
  medium: 0.85,
  light: 0.75,
} as const;

// Radio de blur
export const blurIntensity = {
  light: 20,
  medium: 30,
  strong: 40,
} as const;

/**
 * Colores glass para dark/light mode
 */
export const glassColors = {
  light: {
    background: `rgba(255, 255, 255, ${glassOpacity.strong})`,
    backgroundMedium: `rgba(255, 255, 255, ${glassOpacity.medium})`,
    backgroundLight: `rgba(255, 255, 255, ${glassOpacity.light})`,
    border: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    background: `rgba(28, 28, 30, ${glassOpacity.strong})`,
    backgroundMedium: `rgba(28, 28, 30, ${glassOpacity.medium})`,
    backgroundLight: `rgba(28, 28, 30, ${glassOpacity.light})`,
    border: 'rgba(255, 255, 255, 0.1)',
  },
};

/**
 * Helper para crear estilos glass
 */
export function createGlassStyle(
  colorScheme: 'light' | 'dark' = 'light',
  opacity: keyof typeof glassOpacity = 'strong'
) {
  const colors = glassColors[colorScheme];
  const opacityValue = glassOpacity[opacity];

  return {
    backgroundColor:
      colorScheme === 'light'
        ? `rgba(255, 255, 255, ${opacityValue})`
        : `rgba(28, 28, 30, ${opacityValue})`,
    borderColor: colors.border,
    borderWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  };
}

/**
 * BlurView component wrapper para uso en componentes
 */
export { BlurView };

/**
 * Configuración de blur por plataforma
 */
export const blurConfig = Platform.select({
  ios: {
    intensity: blurIntensity.medium,
    tint: 'default' as const,
  },
  android: {
    intensity: blurIntensity.medium,
    tint: 'default' as const,
  },
  web: {
    // Web fallback: usar solo transparencia sin blur
    intensity: 0,
  },
});

