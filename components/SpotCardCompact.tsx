/**
 * SpotCardCompact Component
 * Compact card for spots of lower hierarchy in Home
 * - Square image of 160px
 * - Title below image (no wrapper)
 * - Distance + "View on map" below title
 * - No description
 * - Used for: "Recently Viewed", "Maybe You Like", etc.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Pressable } from 'react-native';

import { Spot } from '@/data/spots';
import { spacing } from '@/constants/spacing';
import { fontSize, lineHeight, fontFamily, fontFamilyMedium } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { borderRadius } from '@/constants/borders';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/ui/Icon';
import { hasValidImage } from '@/utils/imageHelpers';

interface SpotCardCompactProps {
  spot: Spot;
  onPress?: () => void;
  onMapPress?: () => void;
  distance?: number; // En metros (opcional)
}

// Helper para formatear distancia
function formatDistanceHelper(distance?: number, useMiles: boolean = false): string | null {
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

export function SpotCardCompact({ spot, onPress, onMapPress, distance }: SpotCardCompactProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [useMiles, setUseMiles] = useState(false);

  const hasImage = hasValidImage(spot.photos);
  const distanceText = formatDistanceHelper(distance || undefined, useMiles);

  const handleDistancePress = (e: any) => {
    e.stopPropagation();
    if (distance) {
      setUseMiles(!useMiles);
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {/* Imagen cuadrada de 160px */}
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image 
            source={{ uri: spot.photos[0] }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.icon + '20' }]}>
            <Icon name="upload" size={32} color={colors.icon} />
          </View>
        )}
      </View>

      {/* Title below image (no wrapper) */}
      <Text 
        style={[styles.title, { color: colors.text }]} 
        numberOfLines={2}
      >
        {spot.name}
      </Text>

      {/* Distancia + View on map */}
      {distanceText && (
        <View style={styles.metadataRow}>
          <TouchableOpacity 
            onPress={handleDistancePress}
            activeOpacity={0.7}
            style={styles.distanceContainer}
          >
            <Icon name="map" size={12} color={colors.icon} />
            <Text style={[styles.distanceText, { color: colors.icon }]}>
              {distanceText}
            </Text>
          </TouchableOpacity>
          
          {onMapPress && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.icon + '30' }]} />
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  onMapPress();
                }}
                activeOpacity={0.7}
                style={styles.mapButton}
              >
                <Text style={[styles.mapButtonText, { color: colors.tint }]}>
                  View on map
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
  },
  imageContainer: {
    width: 160,
    height: 160,
    marginBottom: spacing.xs,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md, // 12px
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm, // 14px
    lineHeight: lineHeight.sm, // 20px
    fontWeight: '500',
    marginBottom: spacing.xs / 2, // 4px
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2, // 4px
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  distanceText: {
    fontFamily,
    fontSize: fontSize.xs, // 12px
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '400',
  },
  divider: {
    width: 1,
    height: 12,
  },
  mapButton: {
    // Sin estilos adicionales, solo el texto
  },
  mapButtonText: {
    fontFamily,
    fontSize: fontSize.xs, // 12px
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '400',
  },
});

