/**
 * PathContext - Gestión de estado de Paths
 * Scope 3.2: Estado de Paths y funciones de gestión
 * 
 * Funciones:
 * - crearPath
 * - obtenerPaths
 * - guardarPath
 * - Generación sugerida de Paths
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Path, MovementMode, calculateEstimatedDuration } from '@/data/paths';
import { mockPaths } from '@/data/paths';

const STORAGE_KEY = '@mini_tours_paths';

interface PathContextType {
  paths: Path[];
  isLoading: boolean;
  getPathById: (id: string) => Path | undefined;
  createPath: (
    spotIds: string[],
    movementMode: MovementMode,
    title?: string,
    description?: string
  ) => Path;
  updatePath: (id: string, updates: Partial<Path>) => void;
  deletePath: (id: string) => void;
  suggestPathFromSpots: (spotIds: string[]) => Path | null;
}

const PathContext = createContext<PathContextType | undefined>(undefined);

export function PathProvider({ children }: { children: ReactNode }) {
  const [paths, setPaths] = useState<Path[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar paths desde AsyncStorage
  useEffect(() => {
    loadPaths();
  }, []);

  // Guardar paths en AsyncStorage cuando cambien
  useEffect(() => {
    if (!isLoading) {
      savePaths(paths);
    }
  }, [paths, isLoading]);

  const loadPaths = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir fechas
        const pathsWithDates = parsed.map((path: any) => ({
          ...path,
          createdAt: new Date(path.createdAt),
          updatedAt: new Date(path.updatedAt),
          metadata: path.metadata
            ? {
                ...path.metadata,
                suggestedAt: path.metadata.suggestedAt ? new Date(path.metadata.suggestedAt) : undefined,
                acceptedAt: path.metadata.acceptedAt ? new Date(path.metadata.acceptedAt) : undefined,
                editedAt: path.metadata.editedAt ? new Date(path.metadata.editedAt) : undefined,
              }
            : undefined,
        }));
        setPaths(pathsWithDates);
      } else {
        // Usar mock data si no hay datos guardados
        setPaths(mockPaths);
      }
    } catch (error) {
      console.error('Error loading paths:', error);
      // Fallback a mock data
      setPaths(mockPaths);
    } finally {
      setIsLoading(false);
    }
  };

  const savePaths = async (pathsToSave: Path[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pathsToSave));
    } catch (error) {
      console.error('Error saving paths:', error);
    }
  };

  const getPathById = (id: string): Path | undefined => {
    return paths.find((path) => path.id === id);
  };

  const createPath = (
    spotIds: string[],
    movementMode: MovementMode,
    title?: string,
    description?: string
  ): Path => {
    const now = new Date();
    const estimatedDuration = calculateEstimatedDuration(spotIds.length, movementMode);

    const newPath: Path = {
      id: `path-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title || `Path with ${spotIds.length} spots`,
      description,
      estimatedDuration,
      movementMode,
      spots: spotIds,
      createdAt: now,
      updatedAt: now,
    };

    setPaths((prev) => [...prev, newPath]);
    return newPath;
  };

  const updatePath = (id: string, updates: Partial<Path>) => {
    setPaths((prev) =>
      prev.map((path) =>
        path.id === id
          ? { ...path, ...updates, updatedAt: new Date() }
          : path
      )
    );
  };

  const deletePath = (id: string) => {
    setPaths((prev) => prev.filter((path) => path.id !== id));
  };

  // Generar Path sugerido desde array de Spot IDs
  const suggestPathFromSpots = (spotIds: string[]): Path | null => {
    if (spotIds.length < 2) {
      return null; // Necesitamos al menos 2 spots para un path
    }

    const now = new Date();
    const estimatedDuration = calculateEstimatedDuration(spotIds.length, 'walking');

    const suggestedPath: Path = {
      id: `path-suggested-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `Suggested path with ${spotIds.length} spots`,
      description: `A path connecting ${spotIds.length} spots`,
      estimatedDuration,
      movementMode: 'walking',
      spots: spotIds,
      metadata: {
        inferredFrom: spotIds,
        suggestedAt: now,
      },
      createdAt: now,
      updatedAt: now,
    };

    return suggestedPath;
  };

  const value: PathContextType = {
    paths,
    isLoading,
    getPathById,
    createPath,
    updatePath,
    deletePath,
    suggestPathFromSpots,
  };

  return <PathContext.Provider value={value}>{children}</PathContext.Provider>;
}

export function usePath() {
  const context = useContext(PathContext);
  if (context === undefined) {
    throw new Error('usePath must be used within a PathProvider');
  }
  return context;
}

