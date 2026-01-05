/**
 * Utilidades para estilos Glass (Apple Style)
 * Efecto blur y transparencia para glassmorphism
 */

import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

// Opacidades glass (ajustadas para volumen, no hueco)
export const glassOpacity = {
  strong: 0.95, // Máxima opacidad para volumen
  medium: 0.90, // Aumentado de 0.85 para más volumen
  light: 0.85,  // Aumentado de 0.75 para más volumen
} as const;

// Radio de blur (ajustado para efecto más pronunciado)
export const blurIntensity = {
  light: 25,   // Aumentado de 20
  medium: 35,   // Aumentado de 30
  strong: 45,   // Aumentado de 40
} as const;

/**
 * Colores glass para dark/light mode
 */
export const glassColors = {
  light: {
    background: `rgba(255, 255, 255, ${glassOpacity.strong})`,
    backgroundMedium: `rgba(255, 255, 255, ${glassOpacity.medium})`,
    backgroundLight: `rgba(255, 255, 255, ${glassOpacity.light})`,
    // Fondo gris muy muy suave cuando no hay imagen (casi imperceptible)
    backgroundGray: `rgba(250, 250, 250, ${glassOpacity.strong})`, // Gris muy muy suave (250, 250, 250)
    border: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    background: `rgba(28, 28, 30, ${glassOpacity.strong})`,
    backgroundMedium: `rgba(28, 28, 30, ${glassOpacity.medium})`,
    backgroundLight: `rgba(28, 28, 30, ${glassOpacity.light})`,
    // Fondo gris muy muy suave cuando no hay imagen (dark mode)
    backgroundGray: `rgba(32, 32, 34, ${glassOpacity.strong})`, // Gris muy muy suave (ligeramente más claro que el fondo)
    border: 'rgba(255, 255, 255, 0.06)', // Reducido de 0.1 a 0.06 para suavizar en dark mode
  },
};

/**
 * Colores para glow interno (borde degradado)
 * Simula el resplandor de luz reflejado en el borde del objeto glass
 * Blanco puro que se acentúa por la sombra
 */
export const glowColors = {
  light: {
    // Blanco puro que se acentúa por la sombra - muy sutil pero visible
    top: 'rgba(255, 255, 255, 0.5)',      // Blanco puro, más visible en la parte superior
    sides: 'rgba(255, 255, 255, 0.3)',    // Blanco puro, menos visible en los lados
    bottom: 'rgba(255, 255, 255, 0.1)',   // Blanco puro, muy sutil en la parte inferior
    contour: 'rgba(255, 255, 255, 0.4)',  // Blanco puro para contorno completo
  },
  dark: {
    // En dark mode, el glow es más sutil y suave para evitar bordes duros
    top: 'rgba(255, 255, 255, 0.15)',
    sides: 'rgba(255, 255, 255, 0.1)',
    bottom: 'rgba(255, 255, 255, 0.05)',
    contour: 'rgba(255, 255, 255, 0.12)', // Reducido de 0.25 a 0.12 para suavizar
  },
};

/**
 * Helper para crear estilos glass con volumen y glow interno
 */
export function createGlassStyle(
  colorScheme: 'light' | 'dark' = 'light',
  opacity: keyof typeof glassOpacity = 'strong',
  shadowLevel: ShadowLevel = 'none',
  enableGlow: boolean = true,
  useGrayBackground: boolean = false // Nueva prop: usar fondo gris (cuando no hay imagen)
) {
  const colors = glassColors[colorScheme];
  const opacityValue = glassOpacity[opacity];
  const shadow = shadows[shadowLevel];

  // Seleccionar fondo: gris si useGrayBackground, normal si no
  const backgroundColor = useGrayBackground
    ? colors.backgroundGray
    : colorScheme === 'light'
        ? `rgba(255, 255, 255, ${opacityValue})`
    : `rgba(28, 28, 30, ${opacityValue})`;

  const baseStyle = {
    backgroundColor,
    borderColor: colors.border,
    borderWidth: 1,
    borderTopWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    ...shadow,
  };

  // Si el glow está deshabilitado, retornar estilo base
  if (!enableGlow) {
    return baseStyle;
  }

  // Agregar borde superior con glow (más visible)
  return {
    ...baseStyle,
    borderTopColor: glowColors[colorScheme].top,
  };
}

/**
 * BlurView component wrapper para uso en componentes
 */
export { BlurView };

/**
 * Sistema de sombras para elevación (basado en referencias Apple Music)
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Android
  },
  subtle: {
    // Nivel 1: Sutil - para elementos base con ligera elevación
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android
  },
  medium: {
    // Nivel 2: Medio - para elementos flotantes (tab bar, player)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4, // Android
  },
  strong: {
    // Nivel 3: Pronunciado - para modales, drawers
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8, // Android
  },
} as const;

export type ShadowLevel = keyof typeof shadows;

/**
 * Colores para gradiente vertical del fondo gris
 * Zonas más intensas arriba, más suaves abajo para realismo
 * Variación sutil pero perceptible para crear profundidad
 */
export function getGrayGradientColors(colorScheme: 'light' | 'dark'): string[] {
  if (colorScheme === 'light') {
    return [
      `rgba(242, 242, 242, ${glassOpacity.strong})`, // Arriba: más intenso (zona de sombra)
      `rgba(248, 248, 248, ${glassOpacity.strong})`, // Centro-medio: transición
      `rgba(250, 250, 250, ${glassOpacity.strong})`, // Centro: muy suave
      `rgba(252, 252, 252, ${glassOpacity.strong})`, // Abajo: más claro (zona de luz)
    ];
  } else {
    return [
      `rgba(28, 28, 30, ${glassOpacity.strong})`, // Arriba: más oscuro (zona de sombra)
      `rgba(30, 30, 32, ${glassOpacity.strong})`, // Centro-medio: transición
      `rgba(32, 32, 34, ${glassOpacity.strong})`, // Centro: muy suave
      `rgba(34, 34, 36, ${glassOpacity.strong})`, // Abajo: más claro (zona de luz)
    ];
  }
}

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

