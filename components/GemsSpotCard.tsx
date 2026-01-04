/**
 * Gems Spot Card Component
 * Scope 9: Gems Screen - Card para Spots en Gems
 * 
 * Variante de SpotCard optimizada para Gems feed
 * Principios:
 * - Estilo glass
 * - Tags/pills con razón de por qué está destacado
 * - Layout optimizado para feed
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

import { Spot } from '@/data/spots';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { useSaved } from '@/contexts/SavedContext';
import { GemSpot } from '@/utils/gemsLogic';

interface GemsSpotCardProps {
  gemSpot: GemSpot;
  onPress?: () => void;
}

function getReasonLabel(reason: GemSpot['reason']): string {
  const labels: Record<GemSpot['reason'], string> = {
    recent: 'Reciente',
    popular: 'Popular',
    suggested: 'Sugerido',
  };
  return labels[reason];
}

export function GemsSpotCard({ gemSpot, onPress }: GemsSpotCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isSpotLiked, isSpotSaved, toggleLikeSpot, toggleSaveSpot } = useSaved();
  const { spot } = gemSpot;

  const isLiked = isSpotLiked(spot.id);
  const isSaved = isSpotSaved(spot.id);
  const reasonLabel = getReasonLabel(gemSpot.reason);

  const handleLike = () => {
    toggleLikeSpot(spot.id);
  };

  const handleSave = () => {
    toggleSaveSpot(spot.id);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <GlassView style={styles.card} intensity="medium" opacity="medium">
        {/* Foto */}
        {spot.photos && spot.photos.length > 0 && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: spot.photos[0] }} style={styles.image} resizeMode="cover" />
            <View style={[styles.overlay, { backgroundColor: colors.background + '40' }]} />
            
            {/* Tag de razón */}
            <View style={[styles.reasonTag, { backgroundColor: colors.tint + 'E6' }]}>
              <Text style={[textStyles.caption, { color: colors.background }]}>
                {reasonLabel}
              </Text>
            </View>

            {/* Acciones rápidas */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                style={[iconTouchableContainer.base, styles.actionButton]}
                activeOpacity={0.7}>
                <Icon
                  name="like"
                  size={20}
                  color={isLiked ? colors.tint : colors.background}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                style={[iconTouchableContainer.base, styles.actionButton]}
                activeOpacity={0.7}>
                <Icon
                  name="bookmark"
                  size={20}
                  color={isSaved ? colors.tint : colors.background}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Contenido */}
        <View style={styles.content}>
          {spot.name && (
            <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.xs }]} numberOfLines={2}>
              {spot.name}
            </Text>
          )}
          {spot.description && (
            <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.xs }]} numberOfLines={2}>
              {spot.description}
            </Text>
          )}
        </View>
      </GlassView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  reasonTag: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  actions: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    padding: spacing.md,
  },
});

