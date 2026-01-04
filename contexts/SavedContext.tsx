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

const STORAGE_KEY = '@mini_tours_saved';

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
  notMyVibeSpots: string[]; // Spot IDs
  savedSpots: string[]; // Spot IDs
  savedPaths: string[]; // Path IDs
  visitedPaths: string[]; // Path IDs
  timeline: TimelineEntry[];
}

interface SavedContextType {
  // Spots
  likedSpots: string[];
  notMyVibeSpots: string[];
  savedSpots: string[];
  // Paths
  savedPaths: string[];
  visitedPaths: string[];
  // Timeline
  timeline: TimelineEntry[];
  // Actions
  toggleLikeSpot: (spotId: string) => void;
  toggleNotMyVibeSpot: (spotId: string) => void;
  toggleSaveSpot: (spotId: string) => void;
  toggleSavePath: (pathId: string) => void;
  markPathVisited: (pathId: string) => void;
  isSpotLiked: (spotId: string) => boolean;
  isSpotNotMyVibe: (spotId: string) => boolean;
  isSpotSaved: (spotId: string) => boolean;
  isPathSaved: (pathId: string) => boolean;
  isPathVisited: (pathId: string) => boolean;
  // Loading
  isLoading: boolean;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

const defaultData: SavedData = {
  likedSpots: [],
  notMyVibeSpots: [],
  savedSpots: [],
  savedPaths: [],
  visitedPaths: [],
  timeline: [],
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

  const toggleSavePath = (pathId: string) => {
    setData((prev) => {
      const isSaved = prev.savedPaths.includes(pathId);
      const newSavedPaths = isSaved
        ? prev.savedPaths.filter((id) => id !== pathId)
        : [...prev.savedPaths, pathId];

      addToTimeline('path', 'saved', pathId);

      return {
        ...prev,
        savedPaths: newSavedPaths,
      };
    });
  };

  const markPathVisited = (pathId: string) => {
    setData((prev) => {
      if (!prev.visitedPaths.includes(pathId)) {
        addToTimeline('path', 'visited', pathId);
        return {
          ...prev,
          visitedPaths: [...prev.visitedPaths, pathId],
        };
      }
      return prev;
    });
  };

  const isSpotLiked = (spotId: string) => data.likedSpots.includes(spotId);
  const isSpotNotMyVibe = (spotId: string) => data.notMyVibeSpots.includes(spotId);
  const isSpotSaved = (spotId: string) => data.savedSpots.includes(spotId);
  const isPathSaved = (pathId: string) => data.savedPaths.includes(pathId);
  const isPathVisited = (pathId: string) => data.visitedPaths.includes(pathId);

  const value: SavedContextType = {
    likedSpots: data.likedSpots,
    notMyVibeSpots: data.notMyVibeSpots,
    savedSpots: data.savedSpots,
    savedPaths: data.savedPaths,
    visitedPaths: data.visitedPaths,
    timeline: data.timeline,
    toggleLikeSpot,
    toggleNotMyVibeSpot,
    toggleSaveSpot,
    toggleSavePath,
    markPathVisited,
    isSpotLiked,
    isSpotNotMyVibe,
    isSpotSaved,
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

