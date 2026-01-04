/**
 * Narration Engine - Lógica de triggers y reglas de narración
 * Scope 6: Sistema de Narration - Narration Engine
 * 
 * Funcionalidades:
 * - Lógica de triggers (aproaching, arriving, leaving, between)
 * - Reglas duras (no superposición, no repetición, respeto de pausas)
 * - Sistema de colas y prioridades
 * 
 * Reglas según definición de producto:
 * - Nunca se superponen audios
 * - Nunca se repite la misma narración
 * - Nunca se activa si el usuario va muy rápido
 * - Nunca obliga a escuchar
 * - Siempre se puede silenciar
 */

import { Narration, NarrationType } from '@/contexts/NarrationContext';

export type NarrationTrigger = 'approaching' | 'arriving' | 'leaving' | 'between';

export interface NarrationQueueItem {
  narration: Narration;
  priority: number;
  triggeredAt: Date;
}

export interface NarrationEngineState {
  lastPlayedNarrationId: string | null;
  lastPlayedAt: Date | null;
  playedNarrationIds: Set<string>; // IDs de narrations ya reproducidas en esta sesión
  minTimeBetweenNarrations: number; // Milisegundos mínimos entre narrations (regla de pausa)
  minTimeSinceLastNarration: number; // Tiempo desde la última narration (para detectar velocidad)
  isUserMovingFast: boolean; // Si el usuario se mueve muy rápido
}

class NarrationEngine {
  private state: NarrationEngineState;
  private queue: NarrationQueueItem[] = [];
  private currentNarration: Narration | null = null;

  constructor() {
    this.state = {
      lastPlayedNarrationId: null,
      lastPlayedAt: null,
      playedNarrationIds: new Set(),
      minTimeBetweenNarrations: 3000, // 3 segundos mínimo entre narrations
      minTimeSinceLastNarration: 10000, // 10 segundos para considerar "muy rápido"
      isUserMovingFast: false,
    };
  }

  /**
   * Determinar qué tipo de narration corresponde a un trigger
   */
  private getNarrationTypeForTrigger(trigger: NarrationTrigger): NarrationType | null {
    switch (trigger) {
      case 'approaching':
        return 'anticipation';
      case 'arriving':
        return 'presence';
      case 'leaving':
        return 'transition';
      case 'between':
        return 'context';
      default:
        return null;
    }
  }

  /**
   * Calcular prioridad de una narration
   * Prioridades más altas = más importantes
   */
  private calculatePriority(narration: Narration, trigger: NarrationTrigger): number {
    let priority = 0;

    // Prioridad base por tipo
    switch (narration.type) {
      case 'presence':
        priority = 100; // Más alta - presencia es crítica
        break;
      case 'anticipation':
        priority = 80;
        break;
      case 'transition':
        priority = 60;
        break;
      case 'context':
        priority = 40; // Más baja - contexto es opcional
        break;
    }

    // Ajustar por trigger
    if (trigger === 'arriving') {
      priority += 20; // Llegada es más importante
    }

    return priority;
  }

  /**
   * Verificar si se puede reproducir una narration (reglas duras)
   */
  private canPlayNarration(narration: Narration): { canPlay: boolean; reason?: string } {
    const now = new Date();

    // Regla 1: No superposición (ya hay una narration reproduciéndose)
    if (this.currentNarration !== null) {
      return { canPlay: false, reason: 'Ya hay una narration reproduciéndose' };
    }

    // Regla 2: No repetición (no repetir la misma narration)
    if (this.state.playedNarrationIds.has(narration.id)) {
      return { canPlay: false, reason: 'Esta narration ya fue reproducida' };
    }

    // Regla 3: Respeto de pausas (tiempo mínimo entre narrations)
    if (this.state.lastPlayedAt !== null) {
      const timeSinceLastNarration = now.getTime() - this.state.lastPlayedAt.getTime();
      if (timeSinceLastNarration < this.state.minTimeBetweenNarrations) {
        return { canPlay: false, reason: 'Tiempo mínimo entre narrations no cumplido' };
      }
    }

    // Regla 4: No activar si el usuario va muy rápido
    if (this.state.isUserMovingFast && this.state.lastPlayedAt !== null) {
      const timeSinceLastNarration = now.getTime() - this.state.lastPlayedAt.getTime();
      if (timeSinceLastNarration < this.state.minTimeSinceLastNarration) {
        // Si el usuario se mueve rápido (muy poco tiempo desde la última narration),
        // solo permitir narrations de presencia (las más importantes)
        if (narration.type !== 'presence') {
          return { canPlay: false, reason: 'Usuario moviéndose muy rápido' };
        }
      }
    }

    return { canPlay: true };
  }

  /**
   * Agregar narration a la cola
   */
  queueNarration(narration: Narration, trigger: NarrationTrigger): boolean {
    // Verificar si el tipo de narration corresponde al trigger
    const expectedType = this.getNarrationTypeForTrigger(trigger);
    if (expectedType && narration.type !== expectedType) {
      console.warn(
        `Narration type mismatch: expected ${expectedType} for trigger ${trigger}, got ${narration.type}`
      );
      // No bloquear, pero advertir
    }

    // Verificar reglas duras
    const { canPlay, reason } = this.canPlayNarration(narration);
    if (!canPlay) {
      console.debug(`Narration ${narration.id} cannot play: ${reason}`);
      return false;
    }

    // Calcular prioridad
    const priority = this.calculatePriority(narration, trigger);

    // Agregar a la cola ordenada por prioridad (más alta primero)
    const queueItem: NarrationQueueItem = {
      narration,
      priority,
      triggeredAt: new Date(),
    };

    this.queue.push(queueItem);
    this.queue.sort((a, b) => b.priority - a.priority); // Ordenar por prioridad descendente

    return true;
  }

  /**
   * Obtener siguiente narration de la cola
   */
  getNextNarration(): Narration | null {
    if (this.queue.length === 0) {
      return null;
    }

    const nextItem = this.queue.shift();
    if (!nextItem) {
      return null;
    }

    // Verificar reglas nuevamente antes de entregar
    const { canPlay } = this.canPlayNarration(nextItem.narration);
    if (!canPlay) {
      // Si no se puede reproducir, intentar con la siguiente
      return this.getNextNarration();
    }

    return nextItem.narration;
  }

  /**
   * Marcar narration como reproducida
   */
  markNarrationAsPlayed(narration: Narration): void {
    this.currentNarration = narration;
    this.state.lastPlayedNarrationId = narration.id;
    this.state.lastPlayedAt = new Date();
    this.state.playedNarrationIds.add(narration.id);
  }

  /**
   * Marcar narration como completada
   */
  markNarrationAsCompleted(): void {
    this.currentNarration = null;
  }

  /**
   * Marcar narration como cancelada (no se completó)
   */
  markNarrationAsCancelled(): void {
    // No agregar a playedNarrationIds si fue cancelada, para permitir reintento
    this.currentNarration = null;
  }

  /**
   * Actualizar estado de velocidad del usuario
   */
  updateUserSpeed(isMovingFast: boolean): void {
    this.state.isUserMovingFast = isMovingFast;
  }

  /**
   * Limpiar estado (reset para nueva sesión)
   */
  reset(): void {
    this.queue = [];
    this.currentNarration = null;
    this.state.lastPlayedNarrationId = null;
    this.state.lastPlayedAt = null;
    this.state.playedNarrationIds.clear();
    this.state.isUserMovingFast = false;
  }

  /**
   * Limpiar cola
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Obtener estado actual
   */
  getState(): Readonly<NarrationEngineState> {
    return { ...this.state };
  }

  /**
   * Obtener tamaño de la cola
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Obtener narration actual
   */
  getCurrentNarration(): Narration | null {
    return this.currentNarration;
  }
}

// Singleton instance
export const narrationEngine = new NarrationEngine();

