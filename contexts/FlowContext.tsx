/**
 * FlowContext - Estado de Flow (idle/active)
 * Scope 3.3: Gestión del estado Flow activo
 * 
 * Funciones:
 * - startFlow
 * - pauseFlow
 * - endFlow
 * - nextSpot
 * - Progreso del Path actual
 * - Spot actual y siguiente
 */

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { usePath } from './PathContext';
import { useSpot } from './SpotContext';

export type FlowStatus = 'idle' | 'active' | 'paused';

export interface FlowState {
  status: FlowStatus;
  currentPathId: string | null;
  currentSpotIndex: number;
  startedAt: Date | null;
  pausedAt: Date | null;
}

interface FlowContextType {
  flowState: FlowState;
  currentSpotId: string | null;
  nextSpotId: string | null;
  progress: number; // 0-100
  startFlow: (pathId: string) => void;
  pauseFlow: () => void;
  resumeFlow: () => void;
  endFlow: () => void;
  nextSpot: () => void;
  previousSpot: () => void;
  goToSpot: (spotIndex: number) => void;
}

const defaultFlowState: FlowState = {
  status: 'idle',
  currentPathId: null,
  currentSpotIndex: 0,
  startedAt: null,
  pausedAt: null,
};

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [flowState, setFlowState] = useState<FlowState>(defaultFlowState);
  const { getPathById } = usePath();
  const { spots } = useSpot();

  // Calcular spot IDs actual y siguiente basado en el estado
  const { currentSpotId, nextSpotId, progress } = useMemo(() => {
    if (!flowState.currentPathId || flowState.status === 'idle') {
      return {
        currentSpotId: null,
        nextSpotId: null,
        progress: 0,
      };
    }

    const path = getPathById(flowState.currentPathId);
    if (!path || path.spots.length === 0) {
      return {
        currentSpotId: null,
        nextSpotId: null,
        progress: 0,
      };
    }

    const currentIndex = flowState.currentSpotIndex;
    const totalSpots = path.spots.length;

    // Calcular currentSpotId
    const currentSpotId = currentIndex < totalSpots ? path.spots[currentIndex] : null;

    // Calcular nextSpotId
    const nextSpotId = currentIndex + 1 < totalSpots ? path.spots[currentIndex + 1] : null;

    // Calcular progreso (0-100)
    const progress = totalSpots > 0 ? Math.round((currentIndex / totalSpots) * 100) : 0;

    return {
      currentSpotId,
      nextSpotId,
      progress,
    };
  }, [flowState.currentPathId, flowState.currentSpotIndex, flowState.status, getPathById]);

  const startFlow = (pathId: string) => {
    setFlowState({
      status: 'active',
      currentPathId: pathId,
      currentSpotIndex: 0,
      startedAt: new Date(),
      pausedAt: null,
    });
  };

  const pauseFlow = () => {
    if (flowState.status === 'active') {
      setFlowState({
        ...flowState,
        status: 'paused',
        pausedAt: new Date(),
      });
    }
  };

  const resumeFlow = () => {
    if (flowState.status === 'paused') {
      setFlowState({
        ...flowState,
        status: 'active',
        pausedAt: null,
      });
    }
  };

  const endFlow = () => {
    setFlowState(defaultFlowState);
  };

  const nextSpot = () => {
    if (flowState.status === 'active' || flowState.status === 'paused') {
      setFlowState({
        ...flowState,
        currentSpotIndex: flowState.currentSpotIndex + 1,
      });
    }
  };

  const previousSpot = () => {
    if ((flowState.status === 'active' || flowState.status === 'paused') && flowState.currentSpotIndex > 0) {
      setFlowState({
        ...flowState,
        currentSpotIndex: flowState.currentSpotIndex - 1,
      });
    }
  };

  const goToSpot = (spotIndex: number) => {
    if (flowState.status === 'active' || flowState.status === 'paused') {
      setFlowState({
        ...flowState,
        currentSpotIndex: spotIndex,
      });
    }
  };

  const value: FlowContextType = {
    flowState,
    currentSpotId,
    nextSpotId,
    progress,
    startFlow,
    pauseFlow,
    resumeFlow,
    endFlow,
    nextSpot,
    previousSpot,
    goToSpot,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
}

