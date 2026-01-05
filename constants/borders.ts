/**
 * Sistema de border radius (múltiplos de 8px)
 * Basado en referencias visuales Apple Music
 */

export const borderRadius = {
  none: 0,
  sm: 8,    // Botones, elementos pequeños
  md: 12,   // Cards pequeñas
  lg: 16,   // Cards estándar
  xl: 24,   // Modales, drawers (esquinas superiores)
  full: 9999, // Círculos completos
} as const;

export type BorderRadiusValue = typeof borderRadius[keyof typeof borderRadius];

/**
 * Tokens predefinidos para componentes comunes
 */
export const borderTokens = {
  button: borderRadius.sm,      // 8px
  card: borderRadius.lg,        // 16px
  cardSmall: borderRadius.md,  // 12px
  modal: borderRadius.xl,       // 24px
  avatar: borderRadius.full,   // Círculo completo
} as const;

