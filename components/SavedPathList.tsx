/**
 * Saved Path List Component
 * Scope 11: Saved Screen - Lista de Paths guardados o visitados
 * 
 * Principios de diseño:
 * - Cards con estilo glass
 * - Botones de acción (Start con icon.play, Edit con icon.edit)
 * - Separación por espacio (sin bordes)
 */

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import { Flow, getFlowSpots } from '@/data/flows';
import { Spot } from '@/data/spots';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';

interface SavedPathListProps {
  paths: Flow[];
  allSpots: Spot[];
  onPathPress: (path: Flow) => void;
  onStartPath?: (path: Flow) => void;
  emptyMessage?: string;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}


export function SavedPathList({
  paths,
  allSpots,
  onPathPress,
  onStartPath,
  emptyMessage = 'No hay paths guardados',
}: SavedPathListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (paths.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[textStyles.body, { color: colors.icon }]}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {paths.map((path) => {
        const pathSpots = getFlowSpots(path, allSpots);
        
        return (
          <GlassView key={path.id} style={styles.card} intensity="medium" opacity="medium">
            <TouchableOpacity onPress={() => onPathPress(path)} activeOpacity={0.7}>
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={[textStyles.heading4, { color: colors.text, flex: 1 }]} numberOfLines={2}>
                    {path.title}
                  </Text>
                </View>
                
                {path.description && (
                  <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.xs }]} numberOfLines={2}>
                    {path.description}
                  </Text>
                )}
                
                <View style={styles.metadata}>
                  <View style={styles.metadataItem}>
                    <Icon name="map" size={16} color={colors.icon} />
                    <Text style={[textStyles.caption, { color: colors.icon, marginLeft: spacing.xs / 2 }]}>
                      {pathSpots.length} spots
                    </Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={[textStyles.caption, { color: colors.icon }]}>
                      {formatDuration(path.estimatedDuration)}
                    </Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={[textStyles.caption, { color: colors.icon }]}>
                      {getMovementModeLabel(path.movementMode)}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            
            {onStartPath && (
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: colors.tint }]}
                onPress={() => onStartPath(path)}
                activeOpacity={0.7}>
                <Icon name="play" size={20} color={colors.background} />
                <Text style={[textStyles.bodyMedium, { color: colors.background, marginLeft: spacing.xs }]}>
                  Start
                </Text>
              </TouchableOpacity>
            )}
          </GlassView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    borderRadius: 16,
    padding: spacing.md,
  },
  content: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    minHeight: 48,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});

