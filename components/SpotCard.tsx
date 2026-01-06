/**
 * SpotCard Component
 * Scope 5.2: Card para mostrar Spots con estilo glass
 * 
 * Principios de diseño:
 * - Layout vertical glass layout
 * - Estilo glass: Background con blur y transparencia (Apple style)
 * - Foto con overlay glass si aplica
 * - Tags/pills con estilo glass (distancia, tipo, etc.) - para contexto, no navegación
 * - Tipografía: Título → Subtítulo → Microcopy (pocos tamaños, mucho aire)
 * - Acción rápida: Save (guardar) - área táctil ≥ 48px
 * - Like solo en el player del path (después de experimentar el spot)
 * - Indicador si está guardado
 * - NO bordes visibles, separación por espacio
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Pressable } from 'react-native';

import { Spot, SpotType } from '@/data/spots';
import { spacing } from '@/constants/spacing';
import { textStyles, fontSize, lineHeight, fontFamily, fontFamilyMedium } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { borderRadius } from '@/constants/borders';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { useSaved } from '@/contexts/SavedContext';
import { hasValidImage } from '@/utils/imageHelpers';

interface SpotCardProps {
  spot: Spot;
  onPress?: () => void;
  onMapPress?: () => void; // Acción específica para "Ver en mapa"
  onSave?: () => void;
  distance?: number; // En metros (opcional)
  inSlider?: boolean; // When true, removes marginBottom and adjusts width for slider use
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

export function SpotCard({ spot, onPress, onMapPress, onSave, distance, inSlider = false }: SpotCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isSpotSaved, toggleSaveSpot } = useSaved();
  const [useMiles, setUseMiles] = useState(false);

  const isSaved = isSpotSaved(spot.id);
  const distanceText = formatDistance(distance, useMiles);

  const handleSave = () => {
    toggleSaveSpot(spot.id);
    onSave?.();
  };

  const handlePress = () => {
    onPress?.();
  };

  const handleDistancePress = (e: any) => {
    e.stopPropagation();
    if (distance) {
      setUseMiles(!useMiles);
    }
  };

  const hasImage = hasValidImage(spot.photos);

  const handleSavePress = (e: any) => {
    e.stopPropagation();
    handleSave();
  };

  return (
    <Pressable onPress={handlePress} style={[styles.cardContainer, inSlider && styles.cardContainerSlider]}>
      <GlassView 
        style={styles.card} 
        intensity="light" 
        opacity="medium"
        shadowLevel="subtle"
        enableGlow={true}
        useGrayBackground={!hasImage} // Fondo gris cuando no hay imagen
      >
        {/* Foto principal con overlay de acciones */}
        {hasImage && spot.photos && spot.photos.length > 0 ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: spot.photos[0] }} style={styles.image} resizeMode="cover" />
            {/* Tag del tipo en esquina superior izquierda */}
            <View style={[styles.imageTag, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
              <Text style={[styles.chipText, { color: colorScheme === 'dark' ? '#fff' : colors.text }]}>
                {getSpotTypeLabel(spot.type).toUpperCase()}
              </Text>
            </View>
            {/* Bookmark en esquina superior derecha */}
            <TouchableOpacity
              onPress={handleSavePress}
              style={[styles.imageBookmark, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}
              activeOpacity={0.7}>
              <Icon
                name="bookmark"
                size={18}
                color={isSaved ? colors.tint : (colorScheme === 'dark' ? '#fff' : colors.text)}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.icon + '20' }]}>
            <Icon name="upload" size={32} color={colors.icon} />
            {/* Tag del tipo en esquina superior izquierda */}
            <View style={[styles.imageTag, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
              <Text style={[styles.chipText, { color: colorScheme === 'dark' ? '#fff' : colors.text }]}>
                {getSpotTypeLabel(spot.type).toUpperCase()}
              </Text>
            </View>
            {/* Bookmark en esquina superior derecha */}
            <TouchableOpacity
              onPress={handleSavePress}
              style={[styles.imageBookmark, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}
              activeOpacity={0.7}>
              <Icon
                name="bookmark"
                size={18}
                color={isSaved ? colors.tint : (colorScheme === 'dark' ? '#fff' : colors.text)}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Contenido */}
        <View style={styles.content}>
          {/* Title */}
              {spot.name ? (
            <Text style={[styles.titleText, { color: colors.text }]} numberOfLines={1}>
                  {spot.name}
                </Text>
              ) : (
            <Text style={[styles.descriptionText, { color: colors.icon }]}>Unnamed</Text>
            )}

          {/* Description (optional) */}
          {spot.description && (
            <Text style={[styles.descriptionText, { color: colors.text }]} numberOfLines={2}>
              {spot.description}
            </Text>
          )}

          {/* Línea divisoria sutil */}
          {(distanceText || (onPress || onMapPress)) && (
            <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
          )}

          {/* Footer: Distancia y acción */}
          {(distanceText || (onPress || onMapPress)) && (
            <View style={styles.footer}>
              {distanceText ? (
                <TouchableOpacity onPress={handleDistancePress} activeOpacity={0.7} style={styles.distanceContainer}>
                  <Icon name="map" size={14} color={colors.icon} />
                  <Text style={[styles.footerText, { color: colors.icon, marginLeft: spacing.xs / 2 }]}>
                    {distanceText}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}
              {(onPress || onMapPress) && (
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    if (onMapPress) {
                      onMapPress();
                    } else if (onPress) {
                      handlePress();
                    }
                  }} 
                  activeOpacity={0.7}>
                  <Text style={[styles.footerText, { color: colors.tint }]}>
                    View on map →
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.md,
    alignSelf: 'center',
    width: '90%', // Cards menos anchas - 90% del contenedor
    maxWidth: 400, // Ancho máximo para tablets/pantallas grandes
  },
  cardContainerSlider: {
    marginBottom: 0, // Remove margin when in slider
    width: '100%', // Full width in slider
    alignSelf: 'stretch', // Stretch to fill container
    paddingVertical: spacing.xs, // 8px - Allow shadow to show
    paddingHorizontal: spacing.xs, // 8px - Small horizontal padding for shadows
  },
  card: {
    borderRadius: 16, // Múltiplo de 8
    overflow: 'hidden',
    // NO bordes visibles, separación por espacio
    // Note: overflow: 'hidden' is needed for border radius clipping of image content
    // Shadow will be visible due to padding on cardContainerSlider
  },
  imageContainer: {
    width: '100%',
    height: 200, // Múltiplo de 8 (25 * 8)
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imageTag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    // backgroundColor se aplica dinámicamente según colorScheme
  },
  imageBookmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: spacing.lg, // 32px - múltiplo de 8
    height: spacing.lg, // 32px - múltiplo de 8
    borderRadius: spacing.lg / 2, // Círculo perfecto
    // backgroundColor se aplica dinámicamente según colorScheme
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.sm, // 16px - reducido de 24px
  },
  chipText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs, // 12px - reducido de 14px (85%)
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '500',
  },
  titleText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xl, // 20px - reducido de 24px (83%)
    lineHeight: lineHeight.xl, // 32px
    fontWeight: '500',
    marginBottom: spacing.xs / 2, // 4px - reducido de 8px
  },
  descriptionText: {
    fontFamily,
    fontSize: fontSize.sm, // 14px - reducido de 16px (87%)
    lineHeight: lineHeight.sm, // 20px
    fontWeight: '400',
    marginBottom: spacing.xs, // 8px - reducido de 16px
  },
  divider: {
    height: 1,
    marginTop: spacing.xs, // 8px - reducido de 16px
    marginBottom: spacing.xs, // 8px - reducido de 16px
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 0,
  },
  footerText: {
    fontFamily,
    fontSize: fontSize.xs, // 12px - reducido de 14px (85%)
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '400',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

