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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { useSaved } from '@/contexts/SavedContext';
import { useNarrationTriggers } from '@/components/NarrationController';
import { geofencingSimulator } from '@/utils/geofencingSimulator';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { SpotCardCompact } from '@/components/SpotCardCompact';
import { FlowSpotCard } from '@/components/FlowSpotCard';
import { getFlowSpots } from '@/data/flows';
import * as Location from 'expo-location';
import { calculateDistanceToSpot } from '@/utils/distance';

type FlowViewMode = 'list' | 'map';

export function FlowScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { flowState, currentSpotId, nextSpotId, progress, pauseFlow, resumeFlow, endFlow, minimizeFlow, nextSpot } = useFlow();
  const { getFlowById } = usePath();
  const { spots, getSpotById } = useSpot();
  const { isSpotLikedFromPlayer, toggleLikeSpotFromPlayer, toggleSaveFlow } = useSaved();
  const narrationTriggers = useNarrationTriggers();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [viewMode, setViewMode] = useState<FlowViewMode>('list');
  const [fadeAnim] = useState(new Animated.Value(0));

  const isVisible = (flowState.status === 'active' || flowState.status === 'paused') && !flowState.isMinimized;
  const flow = flowState.currentPathId ? getFlowById(flowState.currentPathId) : null;
  const flowSpots = flow ? getFlowSpots(flow, spots) : [];
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

  // Obtener ubicación del usuario
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Integrar geofencing con narration triggers
  useEffect(() => {
    if (!isVisible || !flow || flowSpots.length === 0) {
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

    // Iniciar monitoreo con ubicación inicial (simulada - usar primer spot del flow)
    // En producción, esto vendría de expo-location
    if (flowSpots.length > 0) {
      const initialLocation = {
        latitude: flowSpots[0].location.latitude,
        longitude: flowSpots[0].location.longitude,
      };
      geofencingSimulator.startMonitoring(initialLocation, flowSpots);
    }

    // Disparar narration "between" cuando se mueve entre spots
    // Esto se activará automáticamente cuando el geofencing detecte movimiento
    if (currentSpotId && nextSpotId && flow) {
      narrationTriggers.triggerBetween(flow.id);
    }

    return () => {
      removeCallbacks();
      geofencingSimulator.stopMonitoring();
    };
  }, [isVisible, flow?.id, flowSpots.length, currentSpotId, nextSpotId, narrationTriggers]);

  if (!isVisible || !flow) {
    return null;
  }

  const handlePause = () => {
    if (flowState.status === 'active') {
      pauseFlow();
    } else if (flowState.status === 'paused') {
      resumeFlow();
    }
  };

  const handleMinimize = () => {
    minimizeFlow();
  };

  const handleClose = () => {
    endFlow();
    router.back();
  };

  const handleNext = () => {
    nextSpot();
  };

  const handleLike = () => {
    if (currentSpotId) {
      toggleLikeSpotFromPlayer(currentSpotId);
    }
  };

  const renderHeader = () => (
    <GlassView style={styles.header} intensity="light" opacity="medium">
      <View style={styles.headerContent}>
        <Text style={[textStyles.caption, { color: colors.text }]}>NOW MOVING</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity
            onPress={handleMinimize}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="minimize" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClose}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
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

    // Spot actual destacado
    const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;
    const currentIndex = flowState.currentSpotIndex;
    
    // Spots futuros (debajo del actual)
    const futureSpots = flowSpots.slice(currentIndex + 1);

    return (
      <View style={styles.timelineContainer}>
        {/* Spot actual destacado */}
        {currentSpot && (
          <View style={styles.currentSpotContainer}>
            <Text style={[textStyles.bodyMedium, { color: colors.text, marginBottom: spacing.sm }]}>
              Current Spot
            </Text>
            <SpotCardCompact 
              spot={currentSpot} 
              distance={userLocation ? calculateDistanceToSpot(userLocation, currentSpot.location) : undefined}
              onMapPress={() => {
                setViewMode('map');
              }}
            />
          </View>
        )}

        {/* Listado de spots futuros con drag and drop */}
        {futureSpots.length > 0 && (
          <View style={styles.spotsListContainer}>
            <Text style={[textStyles.bodyMedium, { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md }]}>
              Upcoming Spots
            </Text>
            {futureSpots.map((spot, relativeIndex) => {
              const absoluteIndex = currentIndex + 1 + relativeIndex;
              const distance = userLocation
                ? calculateDistanceToSpot(userLocation, spot.location)
                : undefined;
              
              return (
                <FlowSpotCard
                  key={spot.id}
                  spot={spot}
                  index={absoluteIndex}
                  distance={distance}
                  isActive={absoluteIndex === currentIndex}
                  onPress={() => {
                    // TODO: Implementar navegación al spot
                  }}
                />
              );
            })}
          </View>
        )}
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
        onPress={() => router.push('/flow-full-player')}
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
      onRequestClose={handleClose}>
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
  headerControls: {
    flexDirection: 'row',
    gap: spacing.xs,
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
  currentSpotContainer: {
    marginBottom: spacing.md,
  },
  spotsListContainer: {
    gap: spacing.sm,
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

