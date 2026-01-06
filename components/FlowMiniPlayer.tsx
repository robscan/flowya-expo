/**
 * Flow Mini Player Component
 * Scope 7: Flow (Estado Activo) - Mini Player
 * 
 * Principios de diseño:
 * - Player minimizado con efecto glass
 * - Background blur y transparencia
 * - Imagen del spot, nombre y distancia
 * - Botón de navegación para expandir
 * - Posicionado sobre tab bar (con efecto glass también)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { GlassView } from '@/components/ui/GlassView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles, fontSize, lineHeight, fontFamily, fontFamilyMedium } from '@/constants/typography';
import { borderRadius } from '@/constants/borders';
import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateDistanceToSpot } from '@/utils/distance';
import { hasValidImage, getValidImage } from '@/utils/imageHelpers';

interface FlowMiniPlayerProps {
  onExpand?: () => void;
}

// Helper para formatear distancia
function formatDistance(distance?: number, useMiles: boolean = false): string | null {
  if (!distance) return null;
  
  if (useMiles) {
    // Convertir metros a millas (1 milla = 1609.34 metros)
    const miles = distance / 1609.34;
    if (miles < 0.1) {
      // Si es menos de 0.1 millas, mostrar en pies (1 milla = 5280 pies)
      const feet = (miles * 5280).toFixed(0);
      return `${feet} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  }
  
  // Sistema métrico
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)} km`;
}

export function FlowMiniPlayer({ onExpand }: FlowMiniPlayerProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { flowState, currentSpotId, expandFlow, pauseFlow, resumeFlow, previousSpot, nextSpot } = useFlow();
  const { getFlowById } = usePath();
  const { getSpotById } = useSpot();
  const { tabBarHeight } = useOverlay(); // Obtener altura dinámica del tab bar
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [useMiles, setUseMiles] = useState(false);
  const bottomAnim = useRef(new Animated.Value(tabBarHeight)).current; // Animación para bottom

  const isVisible = flowState.status === 'active' || flowState.status === 'paused';
  const flow = flowState.currentPathId ? getFlowById(flowState.currentPathId) : null;
  const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;

  // Obtener ubicación del usuario
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
      }
    })();
  }, []);

  // Animar el bottom cuando cambia la altura del tab bar
  useEffect(() => {
    Animated.timing(bottomAnim, {
      toValue: tabBarHeight,
      duration: 400, // Misma duración que LayoutAnimation
      useNativeDriver: false, // No se puede usar native driver para position
    }).start();
  }, [tabBarHeight, bottomAnim]);

  if (!isVisible || !flow || !currentSpot) {
    return null;
  }

  // Calcular distancia al spot
  const distance = calculateDistanceToSpot(userLocation, currentSpot.location);
  const distanceText = formatDistance(distance || undefined, useMiles);

  const hasImage = hasValidImage(currentSpot.photos);
  const imageUrl = getValidImage(currentSpot.photos);

  const handleDistancePress = (e: any) => {
    e.stopPropagation();
    if (distance) {
      setUseMiles(!useMiles);
    }
  };

  const handlePlayPause = (e: any) => {
    e.stopPropagation();
    if (flowState.status === 'active') {
      pauseFlow();
    } else if (flowState.status === 'paused') {
      resumeFlow();
    }
  };

  const handlePrevious = (e: any) => {
    e.stopPropagation();
    previousSpot();
  };

  const handleNext = (e: any) => {
    e.stopPropagation();
    nextSpot();
  };

  const handleExpand = () => {
    // Expandir FlowScreen desde minimizado
    expandFlow();
    onExpand?.();
  };

  return (
    <Animated.View
      style={[
        staticStyles.container,
        {
          bottom: bottomAnim, // Usar valor animado
        },
      ]}>
      <Pressable onPress={handleExpand} style={staticStyles.pressable}>
      <GlassView 
        style={staticStyles.player} 
        intensity="medium" 
        opacity="strong"
        shadowLevel="strong"
        enableGlow={true}
        useGrayBackground={true}
      >
        <View style={staticStyles.content}>
          {/* Imagen del spot */}
          {hasImage && imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={staticStyles.spotImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[staticStyles.spotImagePlaceholder, { backgroundColor: colors.icon + '20' }]}>
              <Icon name="upload" size={16} color={colors.icon} />
            </View>
          )}

          {/* Información: Nombre y distancia */}
          <View style={staticStyles.info}>
            <Text style={[staticStyles.spotName, { color: colors.text }]} numberOfLines={1}>
              {currentSpot.name || 'Current spot'}
            </Text>
            {distanceText && (
              <TouchableOpacity 
                onPress={handleDistancePress}
                activeOpacity={0.7}
                style={staticStyles.distanceContainer}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Icon name="map" size={10} color={colors.icon} />
                <Text style={[staticStyles.distanceText, { color: colors.icon }]}>
                  {distanceText}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Controles: Atrás, Play/Pause, Adelante */}
          <View style={staticStyles.controls}>
            <TouchableOpacity
              onPress={handlePrevious}
              style={staticStyles.controlButton}
              activeOpacity={0.7}>
              <Icon name="previous" size={18} color={colors.icon} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handlePlayPause}
              style={staticStyles.controlButton}
              activeOpacity={0.7}>
              <Icon 
                name={flowState.status === 'paused' ? 'play' : 'pause'} 
                size={20} 
                color={colors.tint} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleNext}
              style={staticStyles.controlButton}
              activeOpacity={0.7}>
              <Icon name="next" size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </GlassView>
    </Pressable>
    </Animated.View>
  );
}

// Estilos estáticos
const staticStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  pressable: {
    width: '100%',
  },
  player: {
    borderRadius: 0, // Sin bordes redondeados - se fusiona con viewport
    paddingVertical: spacing.xs / 2, // 4px padding vertical mínimo
    paddingHorizontal: spacing.xs, // 8px padding horizontal mínimo
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 8px entre elementos (mínimo)
  },
  spotImage: {
    width: 32, // 32px
    height: 32, // 32px
    borderRadius: borderRadius.sm, // 8px
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  spotImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm, // 8px
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2, // 2px entre nombre y distancia (mínimo)
  },
  spotName: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs, // 12px - tamaño más pequeño
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2, // 2px entre icono y texto (mínimo)
  },
  distanceText: {
    fontFamily,
    fontSize: fontSize.xs, // 12px - mismo tamaño que nombre
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '400',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2, // 2px entre controles (más juntos)
  },
  controlButton: {
    minWidth: 40, // Zona activa de 40px
    minHeight: 40, // Zona activa de 40px
    alignItems: 'center',
    justifyContent: 'center',
  },
});
