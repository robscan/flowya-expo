/**
 * Modelo de Datos - Narrations
 * Scope 6: Mock data de narrations para desarrollo
 * 
 * Tipos de narration según definición:
 * - anticipation: Se activa antes de llegar al Spot
 * - presence: Se activa al llegar al Spot
 * - transition: Se activa al salir del Spot
 * - context: Aparece entre Spots (contexto de Path)
 */

import { Narration, NarrationType } from '@/contexts/NarrationContext';

/**
 * Narrations de ejemplo para desarrollo
 * En producción, estas vendrían de una API o base de datos
 */
export const mockNarrations: Narration[] = [
  // Anticipation - Se activa antes de llegar
  {
    id: 'narration-1',
    spotId: '1',
    type: 'anticipation',
    text: 'A medida que te acercas, el sonido del océano se vuelve más presente.',
    duration: 8,
  },
  {
    id: 'narration-2',
    spotId: '1',
    type: 'anticipation',
    text: 'La brisa marina anuncia la proximidad de la playa.',
    duration: 6,
  },
  // Presence - Se activa al llegar
  {
    id: 'narration-3',
    spotId: '1',
    type: 'presence',
    text: 'Estás aquí. El horizonte se extiende infinito. Respira.',
    duration: 10,
  },
  {
    id: 'narration-4',
    spotId: '1',
    type: 'presence',
    text: 'Este lugar ha sido testigo de infinitos atardeceres.',
    duration: 8,
  },
  // Transition - Se activa al salir
  {
    id: 'narration-5',
    spotId: '1',
    type: 'transition',
    text: 'Lleva contigo este momento. El siguiente lugar te espera.',
    duration: 7,
  },
  // Context - Entre Spots (Path context)
  {
    id: 'narration-6',
    pathId: 'path-1',
    type: 'context',
    text: 'El camino costero conecta estos lugares como puntos en un mapa emocional.',
    duration: 9,
  },
  {
    id: 'narration-7',
    pathId: 'path-1',
    type: 'context',
    text: 'Cada paso te acerca a descubrir más de este lugar.',
    duration: 6,
  },
];

/**
 * Helper para obtener narrations por Spot ID
 */
export function getNarrationsBySpotId(spotId: string): Narration[] {
  return mockNarrations.filter((narration) => narration.spotId === spotId);
}

/**
 * Helper para obtener narrations por Path ID
 */
export function getNarrationsByPathId(pathId: string): Narration[] {
  return mockNarrations.filter((narration) => narration.pathId === pathId);
}

/**
 * Helper para obtener narrations por tipo
 */
export function getNarrationsByType(type: NarrationType): Narration[] {
  return mockNarrations.filter((narration) => narration.type === type);
}

/**
 * Helper para obtener una narration aleatoria de un tipo específico para un Spot
 */
export function getRandomNarrationBySpotAndType(
  spotId: string,
  type: NarrationType
): Narration | null {
  const narrations = mockNarrations.filter(
    (narration) => narration.spotId === spotId && narration.type === type
  );
  if (narrations.length === 0) return null;
  return narrations[Math.floor(Math.random() * narrations.length)];
}

/**
 * Helper para obtener una narration aleatoria de tipo context para un Path
 */
export function getRandomPathContextNarration(pathId: string): Narration | null {
  const narrations = mockNarrations.filter(
    (narration) => narration.pathId === pathId && narration.type === 'context'
  );
  if (narrations.length === 0) return null;
  return narrations[Math.floor(Math.random() * narrations.length)];
}

