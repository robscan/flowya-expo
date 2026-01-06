/**
 * Map View Component
 * Scope 1: Integración de Google Maps
 * 
 * Componente de mapa real usando react-native-maps y Google Maps.
 * Reemplaza SimpleMapView con funcionalidad de mapas reales.
 * 
 * Principios de diseño:
 * - Mapas reales de Google Maps
 * - Marcadores interactivos para spots
 * - Long press para crear nuevo spot
 * - Compatible con la interfaz de SimpleMapView
 */

import React, { useState, useRef, useMemo, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  StyleSheet,
  View,
  Platform,
} from 'react-native';

import { Spot } from '@/data/spots';
import { MapSpotMarker } from '@/components/MapSpotMarker';
import { areMapsApiKeysConfigured, USE_GOOGLE_MAPS } from '@/utils/mapsConfig';
import { SimpleMapView } from './SimpleMapView';
import { MapViewWeb, MapViewWebRef } from './MapViewWeb';

// Importar react-native-maps solo para móvil (lazy loading)
let MapView: any;
let Marker: any;
let PROVIDER_GOOGLE: any;
let Polyline: any;

// Función para cargar react-native-maps solo cuando se necesite
function loadReactNativeMaps() {
  if (Platform.OS === 'web') {
    return null;
  }
  
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
    Polyline = Maps.Polyline;
    return Maps;
  } catch (error) {
    console.warn('react-native-maps no está disponible:', error);
    return null;
  }
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface LatLng {
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  spots: Spot[];
  onSpotPress: (spot: Spot) => void;
  onLongPress?: (location: { latitude: number; longitude: number }) => void;
  initialRegion?: Region;
  // Props adicionales para FlowScreen
  showRoute?: boolean; // Mostrar ruta entre spots (Polyline) - solo móvil
  flowSpots?: Spot[]; // Spots del flow para mostrar ruta - solo móvil
  showUserLocation?: boolean; // Mostrar ubicación del usuario - solo móvil
  userLocation?: { latitude: number; longitude: number } | null;
  routeFrom?: { latitude: number; longitude: number } | null;
  routeTo?: { latitude: number; longitude: number } | null;
}

export interface FlowyaMapViewRef {
  centerOnUserLocation: () => void;
}

// Calcular región inicial basada en spots
function calculateInitialRegion(spots: Spot[]): Region {
  if (spots.length === 0) {
    // Región por defecto (Riviera Maya, México - para el demo)
    return {
      latitude: 20.6170,
      longitude: -87.0798,
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

export const FlowyaMapView = forwardRef<FlowyaMapViewRef, MapViewProps>(({
  spots,
  onSpotPress,
  onLongPress,
  initialRegion,
  showRoute = false,
  flowSpots = [],
  showUserLocation = false,
  userLocation = null,
  routeFrom = null,
  routeTo = null,
}, ref) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(
    initialRegion || calculateInitialRegion(spots)
  );

  // Verificar si las API keys están configuradas (solo en desarrollo)
  useMemo(() => {
    if (Platform.OS !== 'web' && USE_GOOGLE_MAPS) {
      areMapsApiKeysConfigured();
    }
  }, []);

  // Ref para los componentes hijos
  const mapViewWebRef = useRef<MapViewWebRef>(null);
  const simpleMapViewRef = useRef<View>(null);

  // Exponer función centerOnUserLocation usando useImperativeHandle
  useImperativeHandle(ref, () => ({
    centerOnUserLocation: () => {
      // Para react-native-maps (móvil con Google Maps)
      if (mapRef.current && userLocation) {
        mapRef.current.animateToRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
        return;
      }
      
      // Intentar desde MapViewWeb (web)
      if (mapViewWebRef.current) {
        mapViewWebRef.current.centerOnUserLocation();
        return;
      }
      
      // Intentar desde SimpleMapView (fallback)
      if (simpleMapViewRef.current) {
        const domElement = (simpleMapViewRef.current as any)._nativeNode || simpleMapViewRef.current;
        if ((domElement as any).centerOnUserLocation) {
          (domElement as any).centerOnUserLocation();
          return;
        }
      }
    },
  }), [userLocation]);

  // En web, usar MapViewWeb (Google Maps JavaScript API)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <MapViewWeb
          ref={mapViewWebRef}
          spots={spots}
          onSpotPress={onSpotPress}
          onLongPress={onLongPress}
          initialRegion={initialRegion || calculateInitialRegion(spots)}
          showRoute={showRoute}
          flowSpots={flowSpots}
          showUserLocation={showUserLocation}
          userLocation={userLocation}
          routeFrom={routeFrom}
          routeTo={routeTo}
        />
      </View>
    );
  }

  // Si Google Maps está desactivado en móvil, usar SimpleMapView (fallback)
  if (!USE_GOOGLE_MAPS) {
    return (
      <View style={styles.container}>
        <View ref={simpleMapViewRef} style={StyleSheet.absoluteFillObject}>
          <SimpleMapView
            spots={spots}
            onSpotPress={onSpotPress}
            onLongPress={onLongPress}
            initialRegion={initialRegion || calculateInitialRegion(spots)}
            userLocation={userLocation}
          />
        </View>
      </View>
    );
  }

  // En móvil con Google Maps activado, usar react-native-maps
  // NOTA: Este código se mantiene comentado/desactivado temporalmente
  // Para reactivarlo, cambiar USE_GOOGLE_MAPS a true en utils/mapsConfig.ts
  
  // Cargar react-native-maps solo cuando se necesite (lazy loading)
  const [mapsLoaded, setMapsLoaded] = useState(false);
  
  useEffect(() => {
    if (Platform.OS !== 'web' && USE_GOOGLE_MAPS) {
      const maps = loadReactNativeMaps();
      if (maps) {
        setMapsLoaded(true);
      } else {
        // Si no se puede cargar, usar SimpleMapView como fallback
        setMapsLoaded(false);
      }
    } else {
      setMapsLoaded(false);
    }
  }, []);
  
  // Si react-native-maps no está disponible o no se cargó, usar SimpleMapView como fallback
  if (Platform.OS !== 'web' && USE_GOOGLE_MAPS && (!MapView || !mapsLoaded)) {
    return (
      <View style={styles.container}>
        <View ref={simpleMapViewRef} style={StyleSheet.absoluteFillObject}>
          <SimpleMapView
            spots={spots}
            onSpotPress={onSpotPress}
            onLongPress={onLongPress}
            initialRegion={initialRegion || calculateInitialRegion(spots)}
            userLocation={userLocation}
          />
        </View>
      </View>
    );
  }
  
  // Calcular coordenadas para Polyline (ruta)
  const routeCoordinates: LatLng[] = useMemo(() => {
    if (!showRoute) {
      return [];
    }

    // Prioridad: usar routeFrom y routeTo si están disponibles (ruta punto a punto)
    if (routeFrom && routeTo) {
      return [
        { latitude: routeFrom.latitude, longitude: routeFrom.longitude },
        { latitude: routeTo.latitude, longitude: routeTo.longitude },
      ];
    }

    // Fallback: usar flowSpots si están disponibles (ruta completa del flow)
    if (flowSpots && flowSpots.length >= 2) {
      return flowSpots.map((spot) => ({
        latitude: spot.location.latitude,
        longitude: spot.location.longitude,
      }));
    }

    return [];
  }, [showRoute, flowSpots, routeFrom, routeTo]);

  const handleLongPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    onLongPress?.({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined} // iOS usa Apple Maps por defecto, Android usa Google
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        onLongPress={handleLongPress}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        showsCompass={true}
        showsScale={false}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        toolbarEnabled={false}
      >
        {/* Marcadores de spots */}
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.location.latitude,
              longitude: spot.location.longitude,
            }}
            onPress={() => onSpotPress(spot)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.markerWrapper}>
              <MapSpotMarker spot={spot} onPress={() => onSpotPress(spot)} />
            </View>
          </Marker>
        ))}

        {/* Ruta entre spots (Polyline) */}
        {showRoute && routeCoordinates.length > 1 && Polyline && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#FF6B35" // Color tint de la app
            strokeWidth={3}
            lineDashPattern={[1]}
          />
        )}
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200, // Ensure minimum height for web fallback
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

