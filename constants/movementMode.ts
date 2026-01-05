/**
 * Movement mode colors
 * Consistent color tokens for tour type chips
 */

export type MovementMode = 'walking' | 'bike' | 'car';

export const movementModeColors = {
  walking: {
    light: {
      text: '#065f46', // Dark green
      background: '#d1fae5', // Very light green
    },
    dark: {
      text: '#34d399', // Light green
      background: '#064e3b', // Very dark green
    },
  },
  bike: {
    light: {
      text: '#6b21a8', // Dark purple
      background: '#e9d5ff', // Very light purple
    },
    dark: {
      text: '#a78bfa', // Light purple
      background: '#4c1d95', // Very dark purple
    },
  },
  car: {
    light: {
      text: '#92400e', // Dark orange
      background: '#fed7aa', // Very light orange
    },
    dark: {
      text: '#fbbf24', // Light orange
      background: '#78350f', // Very dark orange
    },
  },
} as const;

/**
 * Gets text color for a movement mode
 */
export function getMovementModeTextColor(
  mode: MovementMode,
  colorScheme: 'light' | 'dark'
): string {
  return movementModeColors[mode][colorScheme].text;
}

/**
 * Gets background color for a movement mode
 */
export function getMovementModeBackgroundColor(
  mode: MovementMode,
  colorScheme: 'light' | 'dark'
): string {
  return movementModeColors[mode][colorScheme].background;
}

/**
 * Gets label for a movement mode
 */
export function getMovementModeLabel(mode: MovementMode): string {
  const labels: Record<MovementMode, string> = {
    walking: 'Walking',
    bike: 'Biking',
    car: 'Driving',
  };
  return labels[mode];
}
