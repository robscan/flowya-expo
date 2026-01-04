/**
 * Simple Map View Component
 * Scope 8: Home - Map Tab - Map View (implementación simple inicial)
 * 
 * Esta es una implementación simple que muestra spots como marcadores.
 * En el futuro, se puede reemplazar con react-native-maps o expo-maps.
 * 
 * Principios de diseño:
 * - Vista simple que muestra spots posicionados
 * - Marcadores interactivos
 * - Long press para crear nuevo spot (usando Pressable)
 * - Preparado para integrar mapa real después
 */

import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Dimensions,
} from 'react-native';

import { Spot } from '@/data/spots';
import { MapSpotMarker } from '@/components/MapSpotMarker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SimpleMapViewProps {
  spots: Spot[];
  onSpotPress: (spot: Spot) => void;
  onLongPress?: (location: { latitude: number; longitude: number }) => void;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

// Calcular región inicial basada en spots
function calculateInitialRegion(spots: Spot[]): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  if (spots.length === 0) {
    // Región por defecto (Lima, Perú)
    return {
      latitude: -12.0464,
      longitude: -77.0428,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }

  const latitudes = spots.map((spot) => spot.location.latitude);
  const longitudes = spots.map((spot) => spot.location.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;
  const latDelta = Math.max(maxLat - minLat, 0.01) * 1.5;
  const lonDelta = Math.max(maxLon - minLon, 0.01) * 1.5;

  return {
    latitude: centerLat,
    longitude: centerLon,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
}

// Convertir coordenadas a posición en pantalla (simplificado)
function coordinateToPosition(
  coord: { latitude: number; longitude: number },
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number },
  screenWidth: number,
  screenHeight: number
): { x: number; y: number } | null {
  // Calcular posición relativa
  const relX = (coord.longitude - region.longitude + region.longitudeDelta / 2) / region.longitudeDelta;
  const relY = (region.latitude - coord.latitude + region.latitudeDelta / 2) / region.latitudeDelta;
  
  // Verificar que esté dentro de los límites
  if (relX < 0 || relX > 1 || relY < 0 || relY > 1) {
    return null; // Fuera del área visible
  }
  
  const x = relX * screenWidth;
  const y = relY * screenHeight;
  return { x, y };
}

// Convertir posición en pantalla a coordenadas (simplificado)
function positionToCoordinate(
  position: { x: number; y: number },
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number },
  screenWidth: number,
  screenHeight: number
): { latitude: number; longitude: number } {
  const relX = position.x / screenWidth;
  const relY = position.y / screenHeight;
  
  const longitude = region.longitude - region.longitudeDelta / 2 + relX * region.longitudeDelta;
  const latitude = region.latitude + region.latitudeDelta / 2 - relY * region.latitudeDelta;
  
  return { latitude, longitude };
}

export function SimpleMapView({
  spots,
  onSpotPress,
  onLongPress,
  initialRegion,
}: SimpleMapViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const screenDimensions = Dimensions.get('window');
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height - 200; // Ajustar según header/tabs

  const region = initialRegion || calculateInitialRegion(spots);
  const [currentRegion] = useState(region);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLongPress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    const location = positionToCoordinate(
      { x: pageX, y: pageY },
      currentRegion,
      screenWidth,
      screenHeight
    );
    onLongPress?.(location);
  };

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.icon + '10' }]}
      onLongPress={handleLongPress}
      delayLongPress={500}>
      {/* Grid de fondo para simular mapa */}
      <View style={styles.grid}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLineVertical,
              {
                left: (screenWidth / 5) * i,
                backgroundColor: colors.icon + '08',
              },
            ]}
          />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLineHorizontal,
              {
                top: (screenHeight / 5) * i,
                backgroundColor: colors.icon + '08',
              },
            ]}
          />
        ))}
      </View>

      {/* Marcadores de spots */}
      {spots.map((spot) => {
        const position = coordinateToPosition(spot.location, currentRegion, screenWidth, screenHeight);
        if (!position) return null;
        
        return (
          <View
            key={spot.id}
            style={[
              styles.markerWrapper,
              {
                left: position.x,
                top: position.y,
              },
            ]}>
            <MapSpotMarker spot={spot} onPress={() => onSpotPress(spot)} />
          </View>
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
  markerWrapper: {
    position: 'absolute',
    transform: [{ translateX: -16 }, { translateY: -16 }], // Centrar marcador
  },
});
