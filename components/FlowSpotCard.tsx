/**
 * FlowSpotCard Component
 * Card compacta para spots dentro de un Flow (listado)
 * 
 * Design principles:
 * - Layout horizontal compacto
 * - Icono de drag handle (6 puntos) a la izquierda
 * - Número a la izquierda en círculo/badge (dos estados: activo/inactivo)
 * - Sin imagen
 * - Título y descripción
 * - Distancia al lado derecho con icono
 * - Glass style consistente con otras cards
 * - Border radius igual a FlowCard (borderRadius.lg = 16px)
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FlowSpotCardProps {
  spot: Spot;
  index: number; // Número de orden en el flow (0-based)
  onPress?: () => void;
  distance?: number; // En metros (opcional)
  isActive?: boolean; // Estado activo/inactivo del número
}

// Helper para formatear distancia
function formatDistance(distance?: number, useMiles: boolean = false): string | null {
  if (!distance) return null;
  
  if (useMiles) {
    const miles = distance / 1609.34;
    if (miles < 0.1) {
      const feet = (miles * 5280).toFixed(0);
      return `${feet} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  }
  
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)} km`;
}

export function FlowSpotCard({ spot, index, onPress, distance, isActive = false }: FlowSpotCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [useMiles, setUseMiles] = useState(false);

  const distanceText = formatDistance(distance, useMiles);

  const handleDistancePress = (e: any) => {
    e.stopPropagation();
    if (distance) {
      setUseMiles(!useMiles);
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.cardContainer}>
      <GlassView
        style={styles.card}
        intensity="light"
        opacity="medium"
        shadowLevel="subtle"
        enableGlow={true}
        useGrayBackground={true}
      >
        <View style={styles.content}>
          {/* Drag handle (left) */}
          <View style={styles.dragHandle}>
            <Icon name="menu" size={16} color={colors.icon + '60'} />
          </View>

          {/* Number badge */}
          <View
            style={[
              styles.numberBadge,
              {
                backgroundColor: isActive ? colors.tint : colors.icon + '20',
              },
            ]}>
            <Text
              style={[
                styles.numberText,
                {
                  color: isActive ? '#fff' : colors.text,
                },
              ]}>
              {index + 1}
            </Text>
          </View>

          {/* Spot info */}
          <View style={styles.spotInfo}>
            <Text style={[styles.spotTitle, { color: colors.text }]} numberOfLines={1}>
              {spot.name || 'Unnamed spot'}
            </Text>
            {spot.description && (
              <Text style={[styles.spotDescription, { color: colors.icon }]} numberOfLines={1}>
                {spot.description}
              </Text>
            )}
          </View>

          {/* Distance (right) */}
          {distanceText && (
            <TouchableOpacity
              onPress={handleDistancePress}
              activeOpacity={0.7}
              style={styles.distanceContainer}>
              <Icon name="map" size={14} color={colors.icon} />
              <Text style={[styles.distanceText, { color: colors.icon }]}>
                {distanceText}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  dragHandle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  numberText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '600',
  },
  spotInfo: {
    flex: 1,
    gap: spacing.xs / 2,
    minWidth: 0,
  },
  spotTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: '500',
  },
  spotDescription: {
    fontFamily,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '400',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    flexShrink: 0,
  },
  distanceText: {
    fontFamily,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '400',
  },
});

