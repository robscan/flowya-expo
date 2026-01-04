/**
 * Gems Path Card Component
 * Scope 9: Gems Screen - Card para Paths sugeridos
 * 
 * Principios:
 * - Estilo glass
 * - Muestra como contexto secundario (no foco)
 * - Layout compacto
 * - El foco siempre está en Spots, no en recorrer Paths completos
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { Path } from '@/data/paths';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { GemPath } from '@/utils/gemsLogic';

interface GemsPathCardProps {
  gemPath: GemPath;
  onPress?: () => void;
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

function getMovementModeLabel(mode: Path['movementMode']): string {
  const labels: Record<Path['movementMode'], string> = {
    walking: 'Caminando',
    bike: 'En bici',
    car: 'En auto',
  };
  return labels[mode];
}

export function GemsPathCard({ gemPath, onPress }: GemsPathCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { path } = gemPath;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      <GlassView style={styles.card} intensity="light" opacity="medium">
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[textStyles.bodyMedium, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {path.title}
            </Text>
            <View style={[styles.suggestedTag, { backgroundColor: colors.tint + '20' }]}>
              <Text style={[textStyles.caption, { color: colors.tint }]}>Sugerido</Text>
            </View>
          </View>
          
          {path.description && (
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]} numberOfLines={2}>
              {path.description}
            </Text>
          )}
          
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Icon name="map" size={16} color={colors.icon} />
              <Text style={[textStyles.caption, { color: colors.icon, marginLeft: spacing.xs / 2 }]}>
                {path.spots.length} spots
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
      </GlassView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: 12,
    padding: spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  suggestedTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
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
});

