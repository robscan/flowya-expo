/**
 * Sistema para determinar dificultad de un Path
 * Basado en modo de movimiento, duración y número de spots
 */

import { Path } from '@/data/paths';

export type PathDifficulty = 'EASY' | 'MED' | 'HARD';

/**
 * Determinar dificultad de un path basado en varios factores
 */
export function getPathDifficulty(path: Path): PathDifficulty {
  const { movementMode, estimatedDuration, spots } = path;

  // Factores de dificultad
  let difficultyScore = 0;

  // Factor por modo de movimiento
  switch (movementMode) {
    case 'walking':
      difficultyScore += 1; // Más fácil (caminar)
      break;
    case 'bike':
      difficultyScore += 2; // Medio (requiere bici)
      break;
    case 'car':
      difficultyScore += 0; // Fácil pero puede ser largo
      break;
  }

  // Factor por duración (en horas)
  const durationHours = estimatedDuration / 60;
  if (durationHours < 1) {
    difficultyScore += 0; // Menos de 1 hora = fácil
  } else if (durationHours < 2) {
    difficultyScore += 1; // 1-2 horas = medio
  } else {
    difficultyScore += 2; // Más de 2 horas = difícil
  }

  // Factor por número de spots
  if (spots.length <= 3) {
    difficultyScore += 0; // Pocos spots = fácil
  } else if (spots.length <= 5) {
    difficultyScore += 1; // Medio número de spots
  } else {
    difficultyScore += 2; // Muchos spots = difícil
  }

  // Determinar dificultad basado en score
  if (difficultyScore <= 2) {
    return 'EASY';
  } else if (difficultyScore <= 4) {
    return 'MED';
  } else {
    return 'HARD';
  }
}

/**
 * Colores para tags de dificultad
 */
export const difficultyColors = {
  EASY: {
    light: '#10b981', // Verde claro
    dark: '#34d399',
    background: {
      light: '#d1fae5', // Verde muy claro para fondo
      dark: '#064e3b',
    },
  },
  MED: {
    light: '#8b5cf6', // Morado claro
    dark: '#a78bfa',
    background: {
      light: '#e9d5ff', // Morado muy claro para fondo
      dark: '#4c1d95',
    },
  },
  HARD: {
    light: '#f59e0b', // Naranja claro
    dark: '#fbbf24',
    background: {
      light: '#fed7aa', // Naranja muy claro para fondo
      dark: '#78350f',
    },
  },
} as const;

/**
 * Obtener color de dificultad según tema
 */
export function getDifficultyColor(difficulty: PathDifficulty, colorScheme: 'light' | 'dark' = 'light'): string {
  return difficultyColors[difficulty][colorScheme];
}

/**
 * Obtener color de fondo de dificultad según tema
 */
export function getDifficultyBackgroundColor(difficulty: PathDifficulty, colorScheme: 'light' | 'dark' = 'light'): string {
  return difficultyColors[difficulty].background[colorScheme];
}

