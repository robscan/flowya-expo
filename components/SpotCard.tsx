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
 * - Acciones rápidas (guardar, like) - áreas táctiles ≥ 48px
 * - Indicador si está guardado/liked
 * - NO bordes visibles, separación por espacio
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Pressable } from 'react-native';

import { Spot, SpotType } from '@/data/spots';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { useSaved } from '@/contexts/SavedContext';

interface SpotCardProps {
  spot: Spot;
  onPress?: () => void;
  onLike?: () => void;
  onSave?: () => void;
  distance?: number; // En metros o kilómetros (opcional)
}

// Helper para obtener nombre legible del tipo
function getSpotTypeLabel(type: SpotType): string {
  const labels: Record<SpotType, string> = {
    beach: 'Playa',
    cafe: 'Café',
    viewpoint: 'Mirador',
    museum: 'Museo',
    restaurant: 'Restaurante',
    park: 'Parque',
    monument: 'Monumento',
    market: 'Mercado',
    other: 'Otro',
  };
  return labels[type] || 'Otro';
}

// Helper para formatear distancia
function formatDistance(distance?: number): string | null {
  if (!distance) return null;
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
}

export function SpotCard({ spot, onPress, onLike, onSave, distance }: SpotCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isSpotLiked, isSpotSaved, toggleLikeSpot, toggleSaveSpot } = useSaved();

  const isLiked = isSpotLiked(spot.id);
  const isSaved = isSpotSaved(spot.id);
  const distanceText = formatDistance(distance);

  const handleLike = () => {
    toggleLikeSpot(spot.id);
    onLike?.();
  };

  const handleSave = () => {
    toggleSaveSpot(spot.id);
    onSave?.();
  };

  const handlePress = () => {
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} style={styles.cardContainer}>
      <GlassView style={styles.card} intensity="light" opacity="medium">
        {/* Foto principal */}
        {spot.photos && spot.photos.length > 0 ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: spot.photos[0] }} style={styles.image} resizeMode="cover" />
            {/* Overlay glass sutil sobre la imagen */}
            <View style={[styles.imageOverlay, { backgroundColor: colors.background + '40' }]} />
          </View>
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.icon + '20' }]}>
            <Icon name="map" size={32} color={colors.icon} />
          </View>
        )}

        {/* Contenido */}
        <View style={styles.content}>
          {/* Header con título y acciones */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {spot.name ? (
                <Text style={[textStyles.heading3, { color: colors.text }]} numberOfLines={1}>
                  {spot.name}
                </Text>
              ) : (
                <Text style={[textStyles.body, { color: colors.icon }]}>Sin nombre</Text>
              )}
            </View>

            {/* Acciones rápidas */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleSave}
                style={iconTouchableContainer.base}
                activeOpacity={0.7}>
                <Icon
                  name="bookmark"
                  size={24}
                  color={isSaved ? colors.tint : colors.icon}
                  style={isSaved ? styles.actionActive : undefined}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLike}
                style={iconTouchableContainer.base}
                activeOpacity={0.7}>
                <Icon
                  name="like"
                  size={24}
                  color={isLiked ? colors.tint : colors.icon}
                  style={isLiked ? styles.actionActive : undefined}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags/Pills - contexto, no navegación */}
          <View style={styles.tags}>
            {distanceText && (
              <View style={[styles.tag, { backgroundColor: colors.icon + '15' }]}>
                <Text style={[textStyles.caption, { color: colors.text }]}>{distanceText}</Text>
              </View>
            )}
            <View style={[styles.tag, { backgroundColor: colors.icon + '15' }]}>
              <Text style={[textStyles.caption, { color: colors.text }]}>
                {getSpotTypeLabel(spot.type)}
              </Text>
            </View>
          </View>

          {/* Descripción (opcional) */}
          {spot.description && (
            <Text style={[textStyles.body, { color: colors.text, marginTop: spacing.xs }]} numberOfLines={2}>
              {spot.description}
            </Text>
          )}
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: 16, // Múltiplo de 8
    overflow: 'hidden',
    // NO bordes visibles, separación por espacio
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
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    // Overlay sutil para legibilidad
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionActive: {
    opacity: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2, // 4px, múltiplo de 8
    borderRadius: 8,
  },
});

