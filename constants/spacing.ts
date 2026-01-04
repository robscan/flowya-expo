/**
 * Sistema de espaciado basado en múltiplos de 8px
 * CRÍTICO: Todos los tamaños, padding, margins, gaps deben ser múltiplos de 8px
 * NUNCA usar valores como 10, 12, 14, 18, 20, 22, etc.
 */

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 56,
  '4xl': 64,
  '5xl': 72,
  '6xl': 80,
  '7xl': 88,
  '8xl': 96,
  '9xl': 104,
  '10xl': 112,
  '11xl': 120,
  '12xl': 128,
} as const;

export type SpacingValue = typeof spacing[keyof typeof spacing];

/**
 * Helper functions para crear estilos con espaciado consistente
 */
export const padding = {
  xs: { padding: spacing.xs },
  sm: { padding: spacing.sm },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
  xl: { padding: spacing.xl },
  '2xl': { padding: spacing['2xl'] },
} as const;

export const margin = {
  xs: { margin: spacing.xs },
  sm: { margin: spacing.sm },
  md: { margin: spacing.md },
  lg: { margin: spacing.lg },
  xl: { margin: spacing.xl },
  '2xl': { margin: spacing['2xl'] },
} as const;

export const gap = {
  xs: { gap: spacing.xs },
  sm: { gap: spacing.sm },
  md: { gap: spacing.md },
  lg: { gap: spacing.lg },
  xl: { gap: spacing.xl },
  '2xl': { gap: spacing['2xl'] },
} as const;

