/**
 * Sistema de Afinidad - SavedContext
 * Scope 1.3: Sistema de afinidad expandido
 * 
 * Incluye:
 * - 👍 (like) - Spots que me gustaron
 * - Not my vibe (nuevo) - Spots que no son de mi interés
 * - Spots guardados
 * - Paths guardados
 * - Historial ligero (timeline)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@flowya_saved';

export type AffinityAction = 'like' | 'not_my_vibe' | 'saved' | 'visited';

export interface TimelineEntry {
  id: string;
  type: 'spot' | 'path';
  action: AffinityAction;
  itemId: string; // Spot ID o Path ID
  timestamp: Date;
}

interface SavedData {
  likedSpots: string[]; // Spot IDs
  likedSpotsFromPlayer: string[]; // Spot IDs - likes hechos desde el player durante navegación
  notMyVibeSpots: string[]; // Spot IDs
  savedSpots: string[]; // Spot IDs
  savedFlows: string[]; // Flow IDs (anteriormente savedPaths)
  visitedFlows: string[]; // Flow IDs (anteriormente visitedPaths)
  timeline: TimelineEntry[];
  // Aliases para compatibilidad temporal
  savedPaths: string[];
  visitedPaths: string[];
}

interface SavedContextType {
  // Spots
  likedSpots: string[];
  likedSpotsFromPlayer: string[]; // Likes hechos desde el player durante navegación
  notMyVibeSpots: string[];
  savedSpots: string[];
  // Flows (anteriormente Paths)
  savedFlows: string[];
  visitedFlows: string[];
  // Aliases para compatibilidad temporal
  savedPaths: string[];
  visitedPaths: string[];
  // Timeline
  timeline: TimelineEntry[];
  // Actions
  toggleLikeSpot: (spotId: string) => void;
  toggleLikeSpotFromPlayer: (spotId: string) => void; // Like desde el player
  toggleNotMyVibeSpot: (spotId: string) => void;
  toggleSaveSpot: (spotId: string) => void;
  toggleSaveFlow: (flowId: string) => void;
  markFlowVisited: (flowId: string) => void;
  // Aliases para compatibilidad temporal
  toggleSavePath: (pathId: string) => void;
  markPathVisited: (pathId: string) => void;
  isSpotLiked: (spotId: string) => boolean;
  isSpotLikedFromPlayer: (spotId: string) => boolean; // Verificar si está liked desde player
  isSpotNotMyVibe: (spotId: string) => boolean;
  isSpotSaved: (spotId: string) => boolean;
  isFlowSaved: (flowId: string) => boolean;
  isFlowVisited: (flowId: string) => boolean;
  // Aliases para compatibilidad temporal
  isPathSaved: (pathId: string) => boolean;
  isPathVisited: (pathId: string) => boolean;
  // Loading
  isLoading: boolean;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

const defaultData: SavedData = {
  likedSpots: [],
  likedSpotsFromPlayer: [],
  notMyVibeSpots: [],
  savedSpots: [],
  savedFlows: [],
  visitedFlows: [],
  timeline: [],
  // Aliases para compatibilidad
  savedPaths: [],
  visitedPaths: [],
};

export function SavedProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SavedData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos desde AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  // Guardar datos en AsyncStorage cuando cambien
  useEffect(() => {
    if (!isLoading) {
      saveData(data);
    }
  }, [data, isLoading]);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir timestamps a Date objects
        parsed.timeline = parsed.timeline.map((entry: TimelineEntry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
        // Migración: si tiene savedPaths/visitedPaths pero no savedFlows/visitedFlows, copiar
        if (parsed.savedPaths && !parsed.savedFlows) {
          parsed.savedFlows = parsed.savedPaths;
        }
        if (parsed.visitedPaths && !parsed.visitedFlows) {
          parsed.visitedFlows = parsed.visitedPaths;
        }
        // Asegurar que los aliases estén sincronizados
        if (parsed.savedFlows) {
          parsed.savedPaths = parsed.savedFlows;
        }
        if (parsed.visitedFlows) {
          parsed.visitedPaths = parsed.visitedFlows;
        }
        setData(parsed);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (dataToSave: SavedData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addToTimeline = (
    type: 'spot' | 'path',
    action: AffinityAction,
    itemId: string
  ) => {
    const entry: TimelineEntry = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      action,
      itemId,
      timestamp: new Date(),
    };

    setData((prev) => ({
      ...prev,
      timeline: [entry, ...prev.timeline].slice(0, 100), // Mantener último 100
    }));
  };

  const toggleLikeSpot = (spotId: string) => {
    setData((prev) => {
      const isLiked = prev.likedSpots.includes(spotId);
      const newLikedSpots = isLiked
        ? prev.likedSpots.filter((id) => id !== spotId)
        : [...prev.likedSpots, spotId];

      // Si se quita el like, también quitar de notMyVibe si está
      const newNotMyVibeSpots = isLiked
        ? prev.notMyVibeSpots
        : prev.notMyVibeSpots.filter((id) => id !== spotId);

      addToTimeline('spot', isLiked ? 'like' : 'like', spotId);

      return {
        ...prev,
        likedSpots: newLikedSpots,
        notMyVibeSpots: newNotMyVibeSpots,
      };
    });
  };

  const toggleLikeSpotFromPlayer = (spotId: string) => {
    setData((prev) => {
      const isLiked = prev.likedSpotsFromPlayer.includes(spotId);
      const newLikedSpotsFromPlayer = isLiked
        ? prev.likedSpotsFromPlayer.filter((id) => id !== spotId)
        : [...prev.likedSpotsFromPlayer, spotId];

      // También agregar/quitar del timeline
      addToTimeline('spot', 'like', spotId);

      return {
        ...prev,
        likedSpotsFromPlayer: newLikedSpotsFromPlayer,
      };
    });
  };

  const toggleNotMyVibeSpot = (spotId: string) => {
    setData((prev) => {
      const isNotMyVibe = prev.notMyVibeSpots.includes(spotId);
      const newNotMyVibeSpots = isNotMyVibe
        ? prev.notMyVibeSpots.filter((id) => id !== spotId)
        : [...prev.notMyVibeSpots, spotId];

      // Si se marca como not my vibe, quitar de likes si está
      const newLikedSpots = isNotMyVibe
        ? prev.likedSpots
        : prev.likedSpots.filter((id) => id !== spotId);

      addToTimeline('spot', 'not_my_vibe', spotId);

      return {
        ...prev,
        notMyVibeSpots: newNotMyVibeSpots,
        likedSpots: newLikedSpots,
      };
    });
  };

  const toggleSaveSpot = (spotId: string) => {
    setData((prev) => {
      const isSaved = prev.savedSpots.includes(spotId);
      const newSavedSpots = isSaved
        ? prev.savedSpots.filter((id) => id !== spotId)
        : [...prev.savedSpots, spotId];

      addToTimeline('spot', 'saved', spotId);

      return {
        ...prev,
        savedSpots: newSavedSpots,
      };
    });
  };

  const toggleSaveFlow = (flowId: string) => {
    setData((prev) => {
      const isSaved = prev.savedFlows.includes(flowId);
      const newSavedFlows = isSaved
        ? prev.savedFlows.filter((id) => id !== flowId)
        : [...prev.savedFlows, flowId];

      addToTimeline('path', 'saved', flowId);

      return {
        ...prev,
        savedFlows: newSavedFlows,
        savedPaths: newSavedFlows, // Sincronizar con alias
      };
    });
  };

  const markFlowVisited = (flowId: string) => {
    setData((prev) => {
      if (!prev.visitedFlows.includes(flowId)) {
        addToTimeline('path', 'visited', flowId);
        const newVisitedFlows = [...prev.visitedFlows, flowId];
        return {
          ...prev,
          visitedFlows: newVisitedFlows,
          visitedPaths: newVisitedFlows, // Sincronizar con alias
        };
      }
      return prev;
    });
  };

  // Aliases para compatibilidad temporal
  const toggleSavePath = toggleSaveFlow;
  const markPathVisited = markFlowVisited;

  const isSpotLiked = (spotId: string) => data.likedSpots.includes(spotId);
  const isSpotLikedFromPlayer = (spotId: string) => data.likedSpotsFromPlayer.includes(spotId);
  const isSpotNotMyVibe = (spotId: string) => data.notMyVibeSpots.includes(spotId);
  const isSpotSaved = (spotId: string) => data.savedSpots.includes(spotId);
  const isFlowSaved = (flowId: string) => data.savedFlows.includes(flowId);
  const isFlowVisited = (flowId: string) => data.visitedFlows.includes(flowId);
  // Aliases para compatibilidad
  const isPathSaved = isFlowSaved;
  const isPathVisited = isFlowVisited;

  const value: SavedContextType = {
    likedSpots: data.likedSpots,
    likedSpotsFromPlayer: data.likedSpotsFromPlayer,
    notMyVibeSpots: data.notMyVibeSpots,
    savedSpots: data.savedSpots,
    savedFlows: data.savedFlows,
    visitedFlows: data.visitedFlows,
    timeline: data.timeline,
    // Aliases para compatibilidad
    savedPaths: data.savedFlows,
    visitedPaths: data.visitedFlows,
    toggleLikeSpot,
    toggleLikeSpotFromPlayer,
    toggleNotMyVibeSpot,
    toggleSaveSpot,
    toggleSaveFlow,
    markFlowVisited,
    // Aliases para compatibilidad
    toggleSavePath,
    markPathVisited,
    isSpotLiked,
    isSpotLikedFromPlayer,
    isSpotNotMyVibe,
    isSpotSaved,
    isFlowSaved,
    isFlowVisited,
    // Aliases para compatibilidad
    isPathSaved,
    isPathVisited,
    isLoading,
  };

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (context === undefined) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
}

