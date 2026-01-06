/**
 * Map View Web Component
 * Scope 7: Google Maps JavaScript API para Web
 * 
 * Componente de mapa usando Google Maps JavaScript API directamente para web.
 * Reemplaza SimpleMapView con mapas reales de Google Maps.
 * 
 * Principios de diseño:
 * - Mapas reales de Google Maps JavaScript API
 * - Marcadores interactivos para spots
 * - Long press (right click) para crear nuevo spot
 * - Compatible con la interfaz de FlowyaMapView
 */

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { Spot } from '@/data/spots';
import { GOOGLE_MAPS_WEB_API_KEY } from '@/utils/mapsConfig';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapViewWebProps {
  spots: Spot[];
  onSpotPress: (spot: Spot) => void;
  onLongPress?: (location: { latitude: number; longitude: number }) => void;
  initialRegion?: Region;
  showRoute?: boolean;
  flowSpots?: Spot[];
  showUserLocation?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
  routeFrom?: { latitude: number; longitude: number } | null;
  routeTo?: { latitude: number; longitude: number } | null;
}

export interface MapViewWebRef {
  centerOnUserLocation: () => void;
}

// Calcular región inicial basada en spots
function calculateInitialRegion(spots: Spot[]): Region {
  if (spots.length === 0) {
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

// Declarar tipos para window.google
declare global {
  interface Window {
    google: typeof google;
  }
}

// Cargar script de Google Maps
function loadGoogleMapsScript(apiKey: string): Promise<typeof google> {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    if (typeof document === 'undefined') {
      reject(new Error('Document not available'));
      return;
    }

    // Verificar si el script ya está en el DOM
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      // Esperar a que se cargue
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          resolve(window.google);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkGoogle);
        reject(new Error('Timeout waiting for Google Maps'));
      }, 10000);
      return;
    }

    // Crear y cargar el script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error('Google Maps failed to load'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'));
    };
    document.head.appendChild(script);
  });
}

export const MapViewWeb = forwardRef<MapViewWebRef, MapViewWebProps>(({
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
  const containerRef = useRef<any>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const userLocationMarkerRef = useRef<google.maps.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const region = initialRegion || calculateInitialRegion(spots);

  // Cargar Google Maps y crear instancia
  useEffect(() => {
    if (!GOOGLE_MAPS_WEB_API_KEY) {
      setError('Google Maps API key not configured. Please set EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY in .env');
      return;
    }

    let mounted = true;

    loadGoogleMapsScript(GOOGLE_MAPS_WEB_API_KEY)
      .then((google) => {
        if (!mounted) return;

        // Obtener el elemento DOM del contenedor
        // En React Native Web, el View se renderiza como un div
        const containerElement = containerRef.current;
        if (!containerElement) {
          setError('Map container not found');
          return;
        }

        // Acceder al elemento DOM nativo
        // @ts-ignore - React Native Web expone _nativeNode
        const domElement = containerElement._nativeNode || containerElement;
        if (!domElement) {
          setError('DOM element not available');
          return;
        }

        // Función para inicializar el mapa
        const initializeMap = () => {
          if (!mounted) return;
          
          // Verificar dimensiones del contenedor
          if (domElement.offsetWidth === 0 || domElement.offsetHeight === 0) {
            // Esperar un frame más y reintentar
            requestAnimationFrame(() => {
              if (!mounted) return;
              if (domElement.offsetWidth === 0 || domElement.offsetHeight === 0) {
                console.warn('Map container has no dimensions, retrying...');
                // Reintentar después de un pequeño delay
                setTimeout(initializeMap, 100);
                return;
              }
              initializeMap();
            });
            return;
          }

          // Detectar si es móvil para ajustar gestureHandling
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
          
          const map = new google.maps.Map(domElement, {
            center: {
              lat: region.latitude,
              lng: region.longitude,
            },
            zoom: Math.round(Math.log2(360 / region.latitudeDelta)),
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true,
            // 'greedy' permite scroll/zoom normal en móvil, 'cooperative' requiere Ctrl en desktop
            gestureHandling: isMobile ? 'greedy' : 'cooperative',
            // Asegurar que el mapa sea interactivo
            draggable: true,
            scrollwheel: true,
            // Control nativo de ubicación
            mapTypeControlOptions: {
              style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              position: google.maps.ControlPosition.TOP_RIGHT,
            },
          });

          // Agregar estilos CSS personalizados para el letrero "For development purposes only"
          // Esto hace que el letrero ocupe todo el espacio disponible
          if (typeof document !== 'undefined') {
            const style = document.createElement('style');
            style.textContent = `
              .gm-style-cc {
                width: 100% !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
              }
              .gm-style-cc > div {
                width: 100% !important;
                text-align: center !important;
              }
              .gm-style > div:first-child {
                width: 100% !important;
                height: 100% !important;
              }
            `;
            document.head.appendChild(style);
          }

          mapInstanceRef.current = map;

          // Manejar right click para long press
          if (onLongPress) {
            map.addListener('rightclick', (e: google.maps.MapMouseEvent) => {
              if (e.latLng) {
                onLongPress({
                  latitude: e.latLng.lat(),
                  longitude: e.latLng.lng(),
                });
              }
            });
          }

          setIsLoaded(true);
        };

        // Inicializar el mapa
        initializeMap();
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps');
      });

    return () => {
      mounted = false;
      // Limpiar marcadores y polyline al desmontar
      if (markersRef.current.length > 0) {
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
      }
      if (infoWindowsRef.current.length > 0) {
        infoWindowsRef.current.forEach((iw) => iw.close());
        infoWindowsRef.current = [];
      }
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setMap(null);
        userLocationMarkerRef.current = null;
      }
    };
  }, [GOOGLE_MAPS_WEB_API_KEY, region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta, onLongPress]);

  // Actualizar marcadores cuando cambian los spots
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) {
      return;
    }

    // Verificar que google.maps esté disponible
    if (typeof window === 'undefined' || !window.google || !window.google.maps) {
      console.log('MapViewWeb: Google Maps API not available');
      return;
    }

    const map = mapInstanceRef.current;
    const google = window.google;

    // Limpiar marcadores e info windows anteriores
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
    infoWindowsRef.current = [];

    // Verificar que hay spots
    if (spots.length === 0) {
      console.log('MapViewWeb: No spots to display');
      return;
    }

    console.log(`MapViewWeb: Creating ${spots.length} markers`);

    // Crear nuevos marcadores - usar icono por defecto primero para debug
    spots.forEach((spot, index) => {
      try {
        // Crear marcador con icono por defecto primero (más confiable)
        // Si funciona, podemos cambiar a icono personalizado después
        const marker = new google.maps.Marker({
          position: {
            lat: spot.location.latitude,
            lng: spot.location.longitude,
          },
          map,
          title: spot.name || 'Unnamed spot',
          // Usar icono por defecto de Google Maps (más confiable)
          // Si esto funciona, podemos cambiar a icono personalizado
          // icon: undefined, // Usar icono por defecto
          // O usar icono personalizado más visible
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12, // Tamaño más grande para mejor visibilidad
            fillColor: '#FF6B35', // Color tint de la app
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3, // Borde más grueso para mejor contraste
          },
          // Asegurar que el marcador sea visible
          visible: true,
          optimized: false, // Desactivar optimización para mejor compatibilidad
        });

        // Verificar que el marcador se creó correctamente
        if (!marker) {
          console.error(`MapViewWeb: Failed to create marker for spot ${spot.id}`);
          return;
        }

      // Crear InfoWindow para mostrar el nombre del spot (tooltip)
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px 16px; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; font-weight: 600; color: #1a1a1a; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${spot.name || 'Unnamed spot'}</div>`,
        disableAutoPan: true,
      });

      // Mostrar InfoWindow al hacer hover
      marker.addListener('mouseover', () => {
        // Cerrar otros info windows
        infoWindowsRef.current.forEach((iw) => iw.close());
        infoWindow.open(map, marker);
      });

      // Cerrar InfoWindow al quitar el mouse
      marker.addListener('mouseout', () => {
        // Pequeño delay para evitar parpadeo
        setTimeout(() => {
          infoWindow.close();
        }, 100);
      });

      // Al hacer click, navegar al spot detail
      marker.addListener('click', () => {
        infoWindow.close();
        onSpotPress(spot);
      });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
        
        // Log para debug
        if (index === 0) {
          console.log('MapViewWeb: First marker created', {
            position: marker.getPosition()?.toJSON(),
            visible: marker.getVisible(),
            map: marker.getMap() !== null,
          });
        }
      } catch (error) {
        console.error(`MapViewWeb: Error creating marker for spot ${spot.id}:`, error);
      }
    });

    console.log(`MapViewWeb: Created ${markersRef.current.length} markers`);

    // Ajustar vista para mostrar todos los marcadores
    // Si hay spots, ajustar la vista para mostrarlos todos
    if (spots.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      spots.forEach((spot) => {
        bounds.extend({
          lat: spot.location.latitude,
          lng: spot.location.longitude,
        });
      });
      // Si hay ubicación del usuario, incluirla en los bounds
      if (userLocation) {
        bounds.extend({
          lat: userLocation.latitude,
          lng: userLocation.longitude,
        });
      }
      map.fitBounds(bounds);
    } else if (userLocation) {
      // Si no hay spots pero hay ubicación del usuario, centrar en ella
      map.setCenter({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      map.setZoom(15);
    }
  }, [isLoaded, spots, onSpotPress, userLocation]);

  // Actualizar ruta (Polyline) si showRoute es true
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !showRoute) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    const map = mapInstanceRef.current;
    let path: { lat: number; lng: number }[] = [];

    // Prioridad: usar routeFrom y routeTo si están disponibles (ruta punto a punto)
    if (routeFrom && routeTo) {
      path = [
        { lat: routeFrom.latitude, lng: routeFrom.longitude },
        { lat: routeTo.latitude, lng: routeTo.longitude },
      ];
    } 
    // Fallback: usar flowSpots si están disponibles (ruta completa del flow)
    else if (flowSpots && flowSpots.length >= 2) {
      path = flowSpots.map((spot) => ({
        lat: spot.location.latitude,
        lng: spot.location.longitude,
      }));
    } 
    // Si no hay datos suficientes, no mostrar ruta
    else {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    // Remover polyline anterior
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    // Crear nuevo polyline
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#FF6B35',
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });

    polyline.setMap(map);
    polylineRef.current = polyline;
  }, [isLoaded, showRoute, flowSpots, routeFrom, routeTo]);

  // Actualizar ubicación del usuario
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !showUserLocation || !userLocation) {
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setMap(null);
        userLocationMarkerRef.current = null;
      }
      return;
    }

    const map = mapInstanceRef.current;

    // Remover marcador anterior
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setMap(null);
    }

    // Crear nuevo marcador para ubicación del usuario
    const marker = new google.maps.Marker({
      position: {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      },
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      },
      title: 'Your location',
    });

    userLocationMarkerRef.current = marker;
  }, [isLoaded, showUserLocation, userLocation]);

  // Exponer función centerOnUserLocation usando useImperativeHandle
  useImperativeHandle(ref, () => ({
    centerOnUserLocation: () => {
      if (!mapInstanceRef.current || !userLocation) return;
      
      mapInstanceRef.current.setCenter({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
      mapInstanceRef.current.setZoom(15);
    },
  }), [userLocation]);

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View ref={containerRef} style={styles.container} />
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    minHeight: 200,
    backgroundColor: 'transparent',
    // Asegurar que el contenedor tenga dimensiones válidas
    position: 'relative',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});
