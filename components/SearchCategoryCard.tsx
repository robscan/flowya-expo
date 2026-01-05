/**
 * Search Category Chip Component
 * Scope 10: Search Screen - Chip de categoría de tipo de spot
 * 
 * Principios de diseño:
 * - Formato chip compacto horizontal
 * - Color de fondo distintivo por tipo
 * - Tap para filtrar búsqueda por tipo
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { SpotType } from '@/data/spots';
import { spacing } from '@/constants/spacing';
import { fontSize, lineHeight, fontFamilyMedium } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { borderRadius } from '@/constants/borders';

interface SearchCategoryCardProps {
  type: SpotType;
  onPress: () => void;
}

// Helper to get readable type name
function getSpotTypeLabel(type: SpotType): string {
  const labels: Record<SpotType, string> = {
    beach: 'Beach',
    cafe: 'Café',
    viewpoint: 'Viewpoint',
    museum: 'Museum',
    restaurant: 'Restaurant',
    park: 'Park',
    monument: 'Monument',
    market: 'Market',
    other: 'Other',
  };
  return labels[type] || 'Other';
}

// Helper to get icon name for type (using available MaterialIcons)
function getSpotTypeIcon(type: SpotType): string {
  const icons: Record<SpotType, string> = {
    beach: 'beach-access', // Using beach-access as closest match
    cafe: 'local-cafe',
    viewpoint: 'landscape',
    museum: 'museum',
    restaurant: 'restaurant',
    park: 'park',
    monument: 'account-balance', // Using account-balance for monument
    market: 'store',
    other: 'place',
  };
  return icons[type] || 'place';
}

// Helper to get color for type
function getSpotTypeColor(type: SpotType, colorScheme: 'light' | 'dark'): string {
  const colors: Record<SpotType, { light: string; dark: string }> = {
    beach: { light: '#4FC3F7', dark: '#0288D1' },
    cafe: { light: '#A1887F', dark: '#5D4037' },
    viewpoint: { light: '#FF9800', dark: '#F57C00' },
    museum: { light: '#9C27B0', dark: '#7B1FA2' },
    restaurant: { light: '#F44336', dark: '#C62828' },
    park: { light: '#4CAF50', dark: '#388E3C' },
    monument: { light: '#616161', dark: '#424242' },
    market: { light: '#FFC107', dark: '#F9A825' },
    other: { light: '#9E9E9E', dark: '#757575' },
  };
  return colors[type]?.[colorScheme] || colors.other[colorScheme];
}

export function SearchCategoryCard({ type, onPress }: SearchCategoryCardProps) {
  const colorScheme = useColorScheme();
  const categoryColor = getSpotTypeColor(type, colorScheme ?? 'light');
  const categoryLabel = getSpotTypeLabel(type);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: categoryColor + (colorScheme === 'dark' ? '40' : '30'),
        },
      ]}
      activeOpacity={0.7}>
      <Text style={[styles.chipText, { color: '#fff' }]}>
        {categoryLabel}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm, // 16px
    paddingVertical: spacing.xs / 2, // 4px
    borderRadius: borderRadius.sm, // 8px
    marginRight: spacing.xs, // 8px
    marginBottom: spacing.xs, // 8px
    flexShrink: 0,
  },
  chipText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs, // 12px
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '500',
  },
});

