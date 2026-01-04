/**
 * Flow Full Player Component
 * Scope 7: Flow (Estado Activo) - Full Player
 * 
 * Principios de diseño:
 * - Player expandido con efecto glass completo
 * - Background con blur fuerte
 * - Mapa o vista del Spot actual
 * - Lista de Spots del Path con estilo glass
 * - Cards para cada spot con blur sutil
 * - Controles completos con estilo glass
 * - Integración con Narration
 * - Progreso visual con estilo glass
 */

import React, { useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SpotCard } from '@/components/SpotCard';
import { GlassView } from '@/components/ui/GlassView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useNarration } from '@/contexts/NarrationContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { getPathSpots } from '@/data/paths';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface FlowFullPlayerProps {
  visible: boolean;
  onClose: () => void;
}

export function FlowFullPlayer({ visible, onClose }: FlowFullPlayerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { flowState, currentSpotId, progress } = useFlow();
  const { getPathById } = usePath();
  const { spots, getSpotById } = useSpot();
  const narration = useNarration();
  const [fadeAnim] = useState(new Animated.Value(0));

  const path = flowState.currentPathId ? getPathById(flowState.currentPathId) : null;
  const pathSpots = path ? getPathSpots(path, spots) : [];
  const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible || !path) {
    return null;
  }

  const handleToggleMute = () => {
    narration.toggleMute();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.background + 'E6', opacity: fadeAnim },
        ]}>
        <GlassView style={styles.player} intensity="strong" opacity="strong">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={[textStyles.heading3, { color: colors.text }]}>
                {path.title}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={iconTouchableContainer.base}
                activeOpacity={0.7}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {path.description && (
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
                {path.description}
              </Text>
            )}
          </View>

          {/* Progreso */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.icon + '20' }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: colors.tint, width: `${progress}%` },
                ]}
              />
            </View>
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
              {progress}% completado
            </Text>
          </View>

          {/* Spot actual destacado */}
          {currentSpot && (
            <View style={styles.currentSpotContainer}>
              <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.sm }]}>
                Spot actual
              </Text>
              <SpotCard spot={currentSpot} />
            </View>
          )}

          {/* Lista de Spots del Path */}
          <ScrollView style={styles.spotsList} contentContainerStyle={styles.spotsListContent}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md }]}>
              Ruta completa
            </Text>
            {pathSpots.map((spot, index) => {
              const isCurrent = spot.id === currentSpotId;

              return (
                <View
                  key={spot.id}
                  style={[
                    styles.spotItem,
                    isCurrent && { backgroundColor: colors.tint + '15' },
                  ]}>
                  <View style={styles.spotIndex}>
                    <Text style={[textStyles.caption, { color: colors.icon }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.spotContent}>
                    <SpotCard spot={spot} />
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Controles */}
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={handleToggleMute}
              style={[iconTouchableContainer.base, styles.controlButton]}
              activeOpacity={0.7}>
              <Icon
                name={narration.isMuted ? 'mute' : 'audio'}
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <View style={styles.controlInfo}>
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                {narration.isMuted ? 'Silenciado' : 'Narración activa'}
              </Text>
              {narration.currentNarration && (
                <Text style={[textStyles.caption, { color: colors.icon }]} numberOfLines={1}>
                  {narration.currentNarration.text}
                </Text>
              )}
            </View>
          </View>
        </GlassView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  player: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 24,
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  currentSpotContainer: {
    marginBottom: spacing.md,
  },
  spotsList: {
    flex: 1,
    maxHeight: 400,
  },
  spotsListContent: {
    paddingBottom: spacing.md,
  },
  spotItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    padding: spacing.xs,
    borderRadius: 8,
  },
  spotIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  spotContent: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: spacing.md,
  },
  controlButton: {
    marginRight: spacing.md,
  },
  controlInfo: {
    flex: 1,
  },
});

