/**
 * FlowCard Component
 * Card to display Flows in horizontal format (Tour List)
 * 
 * Design principles:
 * - Compact horizontal layout
 * - Title (bodyMedium/bold) with movement mode chip below
 * - Right metadata: duration, distance, and spots count
 * - Glass style consistent with SpotCard
 * - Full width (100%)
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';

import { Flow } from '@/data/flows';
import { spacing } from '@/constants/spacing';
import { fontSize, lineHeight, fontFamily, fontFamilyMedium } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { borderRadius } from '@/constants/borders';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { calculatePathDistance } from '@/utils/distance';
import { getFlowSpots } from '@/data/flows';
import { Spot } from '@/data/spots';
import { getMovementModeTextColor, getMovementModeBackgroundColor, getMovementModeLabel } from '@/constants/movementMode';
import { Icon } from '@/components/ui/Icon';

interface FlowCardProps {
  flow: Flow;
  spots: Spot[]; // Array completo de spots para calcular distancia
  onPress?: () => void;
  distance?: number; // Distancia opcional (si ya está calculada)
}

// Helper to format duration
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function FlowCard({ flow, spots, onPress, distance }: FlowCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Calcular distancia si no se proporciona
  const flowSpots = getFlowSpots(flow, spots);
  const calculatedDistance = distance !== undefined ? distance : (flowSpots.length > 0 ? calculatePathDistance(flow, spots) : undefined);

  // Formatear distancia
  const distanceText = calculatedDistance
    ? calculatedDistance < 1000
      ? `${Math.round(calculatedDistance)}m`
      : `${(calculatedDistance / 1000).toFixed(1)} km`
    : null;

  const movementModeLabel = getMovementModeLabel(flow.movementMode);
  const movementModeTextColor = getMovementModeTextColor(flow.movementMode, colorScheme);
  const movementModeBgColor = getMovementModeBackgroundColor(flow.movementMode, colorScheme);

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
          {/* Left: Title and movement mode */}
          <View style={styles.leftContent}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {flow.title}
            </Text>
            <View style={[styles.movementChip, { backgroundColor: movementModeBgColor }]}>
              <Text style={[styles.movementText, { color: movementModeTextColor }]}>
                {movementModeLabel}
              </Text>
            </View>
          </View>

          {/* Right: Metadata */}
          <View style={styles.rightContent}>
            {distanceText && (
              <View style={styles.metadataItem}>
                <Icon name="map" size={14} color={colors.icon} />
                <Text style={[styles.metadataText, { color: colors.icon }]}>
                  {distanceText}
                </Text>
              </View>
            )}
            <View style={styles.metadataItem}>
              <Icon name="clock" size={14} color={colors.icon} />
              <Text style={[styles.metadataText, { color: colors.icon }]}>
                {formatDuration(flow.estimatedDuration)}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Icon name="map" size={14} color={colors.icon} />
              <Text style={[styles.metadataText, { color: colors.icon }]}>
                {flow.spots.length} {flow.spots.length === 1 ? 'spot' : 'spots'}
              </Text>
            </View>
          </View>
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.sm,
    gap: spacing.md,
  },
  leftContent: {
    flex: 1,
    gap: spacing.xs / 2,
    minWidth: 0, // Permite que el texto se trunque correctamente
  },
  title: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: '500',
    flexShrink: 1, // Permite que el texto se trunque cuando sea necesario
  },
  movementChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  movementText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '500',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
    flexWrap: 'wrap', // Permite que los elementos se envuelvan si es necesario
    justifyContent: 'flex-end',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  metadataText: {
    fontFamily,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '400',
  },
});

