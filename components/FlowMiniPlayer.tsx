/**
 * Flow Mini Player Component
 * Scope 7: Flow (Estado Activo) - Mini Player
 * 
 * Principios de diseño:
 * - Player minimizado con efecto glass
 * - Background blur y transparencia
 * - Muestra Spot actual, progreso básico
 * - Botón para expandir
 * - Posicionado sobre tab bar (con efecto glass también)
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';

import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { getPathSpots } from '@/data/paths';

interface FlowMiniPlayerProps {
  onExpand?: () => void;
}

export function FlowMiniPlayer({ onExpand }: FlowMiniPlayerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { flowState, currentSpotId, progress } = useFlow();
  const { getPathById } = usePath();
  const { spots, getSpotById } = useSpot();

  const isVisible = flowState.status === 'active' || flowState.status === 'paused';
  const path = flowState.currentPathId ? getPathById(flowState.currentPathId) : null;
  const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;

  if (!isVisible || !path || !currentSpot) {
    return null;
  }

  return (
    <Pressable onPress={onExpand} style={styles.container}>
      <GlassView style={styles.player} intensity="medium" opacity="strong">
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={[textStyles.bodyMedium, { color: colors.text }]} numberOfLines={1}>
              {currentSpot.name || 'Spot actual'}
            </Text>
            <Text style={[textStyles.caption, { color: colors.icon }]}>{progress}% completado</Text>
          </View>
          <TouchableOpacity
            onPress={onExpand}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="next" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Por encima del tab bar (aprox. 56px + padding)
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  player: {
    borderRadius: 16,
    padding: spacing.md,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
  },
});

