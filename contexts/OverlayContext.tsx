/**
 * OverlayContext
 * 
 * Gestiona la coordinación de overlays (player, drawers, tab bar)
 * - Altura del tab bar (88px con labels, 58px sin labels)
 * - Posicionamiento del FlowMiniPlayer
 * - Coordinación de z-index
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface OverlayContextType {
  tabBarHeight: number; // Altura actual del tab bar (88 o 58)
  setTabBarHeight: (height: number) => void;
  isTabBarLabelsVisible: boolean;
  setIsTabBarLabelsVisible: (visible: boolean) => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [tabBarHeight, setTabBarHeight] = useState(88); // Altura inicial con labels
  const [isTabBarLabelsVisible, setIsTabBarLabelsVisible] = useState(true);

  // Función para actualizar altura del tab bar
  const handleSetTabBarHeight = useCallback((height: number) => {
    setTabBarHeight(height);
  }, []);

  // Función para actualizar visibilidad de labels
  const handleSetTabBarLabelsVisible = useCallback((visible: boolean) => {
    setIsTabBarLabelsVisible(visible);
    // Actualizar altura automáticamente
    setTabBarHeight(visible ? 88 : 58);
  }, []);

  return (
    <OverlayContext.Provider
      value={{
        tabBarHeight,
        setTabBarHeight: handleSetTabBarHeight,
        isTabBarLabelsVisible,
        setIsTabBarLabelsVisible: handleSetTabBarLabelsVisible,
      }}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
}

