/**
 * Saved Spot List Component
 * Scope 11: Saved Screen - Lista de Spots guardados o con like
 * 
 * Principios de diseño:
 * - Lista vertical con cards glass
 * - Separación por espacio (sin bordes)
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Spot } from '@/data/spots';
import { SpotCard } from '@/components/SpotCard';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SavedSpotListProps {
  spots: Spot[];
  onSpotPress: (spot: Spot) => void;
  emptyMessage?: string;
}

export function SavedSpotList({ spots, onSpotPress, emptyMessage = 'No hay spots guardados' }: SavedSpotListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (spots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[textStyles.body, { color: colors.icon }]}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {spots.map((spot) => (
        <SpotCard key={spot.id} spot={spot} onPress={() => onSpotPress(spot)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});

