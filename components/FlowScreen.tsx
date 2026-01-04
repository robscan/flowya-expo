/**
 * Flow Screen Component
 * Scope 7: Flow (Estado Activo) - Core
 * 
 * Principios de diseño:
 * - UI baja protagonismo, controles mínimos, pantalla limpia (audio protagonista)
 * - Pantalla full-screen cuando Flow está activo
 * - Header con efecto glass: "NOW MOVING" con blur background (sutil, casi invisible)
 * - Segmented control: "List" y "Map" (áreas táctiles ≥ 48px)
 * - Layout: Columna única, scroll natural
 * - Muestra Spot actual y siguiente (jerarquía clara, mucho aire)
 * - Progreso del Path (visual suave, no agresivo)
 * - Timeline vertical con línea y checkmarks para spots pasados
 * - Cards con estilo glass para spots actuales (sin bordes, profundidad por blur)
 * - Controles: Pausar (icon.pause), Salir (icon.close), Siguiente (icon.next) - mínimos, bien separados, contenedores ≥ 48px x 48px
 * - Animación: Transición suave al entrar/salir (funcional, emocional, como respirar)
 * - Accesibilidad: Debe poder usarse caminando (controles grandes, calma, indulgente, sin fricción)
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { useNarrationTriggers } from '@/components/NarrationController';
import { geofencingSimulator } from '@/utils/geofencingSimulator';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { SpotCard } from '@/components/SpotCard';
import { FlowFullPlayer } from '@/components/FlowFullPlayer';
import { getPathSpots } from '@/data/paths';

type FlowViewMode = 'list' | 'map';

export function FlowScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { flowState, currentSpotId, nextSpotId, progress, pauseFlow, resumeFlow, endFlow, nextSpot } = useFlow();
  const { getPathById } = usePath();
  const { spots, getSpotById } = useSpot();
  const narrationTriggers = useNarrationTriggers();
  
  const [viewMode, setViewMode] = useState<FlowViewMode>('list');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isFullPlayerVisible, setIsFullPlayerVisible] = useState(false);

  const isVisible = flowState.status === 'active' || flowState.status === 'paused';
  const path = flowState.currentPathId ? getPathById(flowState.currentPathId) : null;
  const pathSpots = path ? getPathSpots(path, spots) : [];
  const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;
  const nextSpotData = nextSpotId ? getSpotById(nextSpotId) : null;

  // Animación de entrada/salida
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, fadeAnim]);

  // Integrar geofencing con narration triggers
  useEffect(() => {
    if (!isVisible || !path || pathSpots.length === 0) {
      geofencingSimulator.stopMonitoring();
      return;
    }

    // Configurar callbacks de geofencing para disparar narrations
    const removeCallbacks = geofencingSimulator.addCallbacks({
      onApproaching: (spotId: string) => {
        narrationTriggers.triggerApproaching(spotId);
      },
      onArriving: (spotId: string) => {
        narrationTriggers.triggerArriving(spotId);
      },
      onLeaving: (spotId: string) => {
        narrationTriggers.triggerLeaving(spotId);
      },
    });

    // Iniciar monitoreo con ubicación inicial (simulada - usar primer spot del path)
    // En producción, esto vendría de expo-location
    if (pathSpots.length > 0) {
      const initialLocation = {
        latitude: pathSpots[0].location.latitude,
        longitude: pathSpots[0].location.longitude,
      };
      geofencingSimulator.startMonitoring(initialLocation, pathSpots);
    }

    // Disparar narration "between" cuando se mueve entre spots
    // Esto se activará automáticamente cuando el geofencing detecte movimiento
    if (currentSpotId && nextSpotId && path) {
      narrationTriggers.triggerBetween(path.id);
    }

    return () => {
      removeCallbacks();
      geofencingSimulator.stopMonitoring();
    };
  }, [isVisible, path?.id, pathSpots.length, currentSpotId, nextSpotId, narrationTriggers]);

  if (!isVisible || !path) {
    return null;
  }

  const handlePause = () => {
    if (flowState.status === 'active') {
      pauseFlow();
    } else if (flowState.status === 'paused') {
      resumeFlow();
    }
  };

  const handleEnd = () => {
    endFlow();
    router.back();
  };

  const handleNext = () => {
    nextSpot();
  };

  const renderHeader = () => (
    <GlassView style={styles.header} intensity="light" opacity="medium">
      <View style={styles.headerContent}>
        <Text style={[textStyles.caption, { color: colors.text }]}>NOW MOVING</Text>
        <TouchableOpacity
          onPress={handleEnd}
          style={iconTouchableContainer.base}
          activeOpacity={0.7}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </GlassView>
  );

  const renderSegmentedControl = () => (
    <View style={styles.segmentedControl}>
      <TouchableOpacity
        style={[
          styles.segment,
          viewMode === 'list' && { backgroundColor: colors.tint + '20' },
        ]}
        onPress={() => setViewMode('list')}
        activeOpacity={0.7}>
        <Text
          style={[
            textStyles.bodyMedium,
            { color: viewMode === 'list' ? colors.tint : colors.icon },
          ]}>
          List
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.segment,
          viewMode === 'map' && { backgroundColor: colors.tint + '20' },
        ]}
        onPress={() => setViewMode('map')}
        activeOpacity={0.7}>
        <Text
          style={[
            textStyles.bodyMedium,
            { color: viewMode === 'map' ? colors.tint : colors.icon },
          ]}>
          Map
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProgress = () => (
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
        {progress}%
      </Text>
    </View>
  );

  const renderTimeline = () => {
    if (viewMode !== 'list') return null;

    return (
      <View style={styles.timelineContainer}>
        {pathSpots.map((spot, index) => {
          const isPast = index < flowState.currentSpotIndex;
          const isCurrent = index === flowState.currentSpotIndex;

          return (
            <View key={spot.id} style={styles.timelineItem}>
              <View style={styles.timelineLineContainer}>
                {index < pathSpots.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor: isPast ? colors.tint : colors.icon + '20',
                      },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: isPast
                        ? colors.tint
                        : isCurrent
                          ? colors.tint
                          : colors.icon + '40',
                      borderWidth: isPast ? 0 : 2,
                      borderColor: colors.icon + '40',
                    },
                  ]}
                />
              </View>
              <View style={styles.timelineSpot}>
                <SpotCard spot={spot} />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderMapView = () => {
    if (viewMode !== 'map') return null;

    return (
      <View style={styles.mapPlaceholder}>
        <Text style={[textStyles.body, { color: colors.text, marginBottom: spacing.sm }]}>
          Vista de mapa
        </Text>
        <Text style={[textStyles.caption, { color: colors.icon }]}>
          El mapa aparecerá aquí (Scope 8)
        </Text>
      </View>
    );
  };

  const renderControls = () => (
    <View style={styles.controls}>
      <TouchableOpacity
        onPress={handlePause}
        style={[iconTouchableContainer.base, styles.controlButton]}
        activeOpacity={0.7}>
        <Icon
          name={flowState.status === 'paused' ? 'play' : 'pause'}
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsFullPlayerVisible(true)}
        style={[iconTouchableContainer.base, styles.controlButton]}
        activeOpacity={0.7}>
        <Icon name="more" size={24} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleNext}
        style={[iconTouchableContainer.base, styles.controlButton]}
        activeOpacity={0.7}
        disabled={!nextSpotData}>
        <Icon
          name="next"
          size={24}
          color={nextSpotData ? colors.text : colors.icon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleEnd}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: colors.background, opacity: fadeAnim },
        ]}>
        {renderHeader()}
        {renderSegmentedControl()}
        {renderProgress()}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          {viewMode === 'list' ? renderTimeline() : renderMapView()}
        </ScrollView>
        {renderControls()}
      </Animated.View>
      <FlowFullPlayer visible={isFullPlayerVisible} onClose={() => setIsFullPlayerVisible(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  timelineContainer: {
    gap: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineLineContainer: {
    alignItems: 'center',
    width: 24,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginBottom: spacing.xs,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineSpot: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  controlButton: {
    minWidth: 48,
    minHeight: 48,
  },
});

