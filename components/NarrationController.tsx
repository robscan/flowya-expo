/**
 * NarrationController Component
 * Scope 6: Sistema de Narration - Componente orquestador
 * 
 * Funcionalidades:
 * - Orquesta la narration basándose en eventos de Flow
 * - Integra narration engine + audio manager mediante hook
 * - Toggle de silenciar narration
 * 
 * Este componente escucha eventos del FlowContext y maneja
 * las narrations automáticamente.
 */

import { useEffect } from 'react';
import { useNarration } from '@/contexts/NarrationContext';
import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import {
  getRandomNarrationBySpotAndType,
  getRandomPathContextNarration,
} from '@/data/narrations';

/**
 * Componente invisible que orquesta las narrations
 * Se integra en el root layout para funcionar globalmente
 */
export function NarrationController() {
  const narration = useNarration();

  const { flowState, currentSpotId, nextSpotId } = useFlow();
  const { getPathById } = usePath();

  // Escuchar cambios en el estado de Flow y disparar narrations
  useEffect(() => {
    if (flowState.status !== 'active') {
      // Si el Flow no está activo, detener cualquier narration
      narration.stopNarration();
      return;
    }

    // Cuando el Flow está activo, las narrations se disparan manualmente
    // desde eventos específicos (approaching, arriving, leaving, between)
    // Por ahora, este componente solo prepara el sistema
    // La implementación completa de triggers será en el Scope 7 (Flow Screen)
  }, [flowState.status, narration]);

  // El componente es invisible - no renderiza nada
  // Solo maneja la lógica de orquestación
  return null;
}

/**
 * Helper para disparar narrations basándose en triggers
 * Estas funciones pueden ser llamadas desde el Flow Screen (Scope 7)
 */
export function useNarrationTriggers() {
  const narration = useNarration();
  const { flowState, currentSpotId, nextSpotId } = useFlow();
  const { getPathById } = usePath();

  /**
   * Disparar narration de tipo "approaching" (anticipation)
   */
  const triggerApproaching = (spotId: string) => {
    const narrationData = getRandomNarrationBySpotAndType(spotId, 'anticipation');
    if (narrationData) {
      narration.triggerNarration('approaching', narrationData);
    }
  };

  /**
   * Disparar narration de tipo "arriving" (presence)
   */
  const triggerArriving = (spotId: string) => {
    const narrationData = getRandomNarrationBySpotAndType(spotId, 'presence');
    if (narrationData) {
      narration.triggerNarration('arriving', narrationData);
    }
  };

  /**
   * Disparar narration de tipo "leaving" (transition)
   */
  const triggerLeaving = (spotId: string) => {
    const narrationData = getRandomNarrationBySpotAndType(spotId, 'transition');
    if (narrationData) {
      narration.triggerNarration('leaving', narrationData);
    }
  };

  /**
   * Disparar narration de tipo "between" (context)
   */
  const triggerBetween = (pathId: string) => {
    const narrationData = getRandomPathContextNarration(pathId);
    if (narrationData) {
      narration.triggerNarration('between', narrationData);
    }
  };

  return {
    triggerApproaching,
    triggerArriving,
    triggerLeaving,
    triggerBetween,
    toggleMute: () => narration.toggleMute(),
    isMuted: narration.isMuted,
    status: narration.status,
    currentNarration: narration.currentNarration,
  };
}

