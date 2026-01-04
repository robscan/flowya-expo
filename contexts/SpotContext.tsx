/**
 * SpotContext - Gestión de estado de Spots
 * Scope 3.1: Estado de Spots y funciones de gestión
 * 
 * Funciones:
 * - crearSpot
 * - actualizarSpot
 * - obtenerSpots
 * - Manejo de Spots incompletos (por diseño, los spots pueden ser incompletos)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Spot } from '@/data/spots';
import { mockSpots } from '@/data/spots';

const STORAGE_KEY = '@mini_tours_spots';

interface SpotContextType {
  spots: Spot[];
  isLoading: boolean;
  getSpotById: (id: string) => Spot | undefined;
  getSpotsByType: (type: Spot['type']) => Spot[];
  createSpot: (spot: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>) => Spot;
  updateSpot: (id: string, updates: Partial<Spot>) => void;
  deleteSpot: (id: string) => void;
}

const SpotContext = createContext<SpotContextType | undefined>(undefined);

export function SpotProvider({ children }: { children: ReactNode }) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar spots desde AsyncStorage
  useEffect(() => {
    loadSpots();
  }, []);

  // Guardar spots en AsyncStorage cuando cambien
  useEffect(() => {
    if (!isLoading) {
      saveSpots(spots);
    }
  }, [spots, isLoading]);

  const loadSpots = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir fechas
        const spotsWithDates = parsed.map((spot: any) => ({
          ...spot,
          createdAt: new Date(spot.createdAt),
          updatedAt: new Date(spot.updatedAt),
        }));
        setSpots(spotsWithDates);
      } else {
        // Usar mock data si no hay datos guardados
        setSpots(mockSpots);
      }
    } catch (error) {
      console.error('Error loading spots:', error);
      // Fallback a mock data
      setSpots(mockSpots);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSpots = async (spotsToSave: Spot[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(spotsToSave));
    } catch (error) {
      console.error('Error saving spots:', error);
    }
  };

  const getSpotById = (id: string): Spot | undefined => {
    return spots.find((spot) => spot.id === id);
  };

  const getSpotsByType = (type: Spot['type']): Spot[] => {
    return spots.filter((spot) => spot.type === type);
  };

  const createSpot = (spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>): Spot => {
    const now = new Date();
    const newSpot: Spot = {
      ...spotData,
      id: `spot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    setSpots((prev) => [...prev, newSpot]);
    return newSpot;
  };

  const updateSpot = (id: string, updates: Partial<Spot>) => {
    setSpots((prev) =>
      prev.map((spot) =>
        spot.id === id
          ? { ...spot, ...updates, updatedAt: new Date() }
          : spot
      )
    );
  };

  const deleteSpot = (id: string) => {
    setSpots((prev) => prev.filter((spot) => spot.id !== id));
  };

  const value: SpotContextType = {
    spots,
    isLoading,
    getSpotById,
    getSpotsByType,
    createSpot,
    updateSpot,
    deleteSpot,
  };

  return <SpotContext.Provider value={value}>{children}</SpotContext.Provider>;
}

export function useSpot() {
  const context = useContext(SpotContext);
  if (context === undefined) {
    throw new Error('useSpot must be used within a SpotProvider');
  }
  return context;
}

