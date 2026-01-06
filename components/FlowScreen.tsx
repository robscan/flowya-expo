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
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { useSaved } from '@/contexts/SavedContext';
import { useNarration } from '@/contexts/NarrationContext';
import { useNarrationTriggers } from '@/components/NarrationController';
import { geofencingSimulator } from '@/utils/geofencingSimulator';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles, fontFamily, fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { borderRadius } from '@/constants/borders';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { SpotCardCompact } from '@/components/SpotCardCompact';
import { FlowSpotCard } from '@/components/FlowSpotCard';
import { FlowyaMapView } from '@/components/MapView';
import { getFlowSpots, MovementMode } from '@/data/flows';
import * as Location from 'expo-location';
import { calculateDistanceToSpot, calculateDistance } from '@/utils/distance';
import { openNavigationApp, mapMovementModeToNavigationMode } from '@/utils/navigationHelpers';

type FlowViewMode = 'list' | 'map';

export function FlowScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { flowState, currentSpotId, nextSpotId, progress, pauseFlow, resumeFlow, endFlow, minimizeFlow, nextSpot } = useFlow();
  const { getFlowById } = usePath();
  const { spots, getSpotById } = useSpot();
  const { isSpotLikedFromPlayer, toggleLikeSpotFromPlayer, toggleSaveFlow } = useSaved();
  const narration = useNarration();
  const narrationTriggers = useNarrationTriggers();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [viewMode, setViewMode] = useState<FlowViewMode>('list');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

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

  // Reproducir mensaje inicial solo una vez cuando se inicia el flow
  useEffect(() => {
    if (!isVisible || !flow || flowState.status !== 'active') {
      return;
    }

    // Reproducir mensaje inicial solo una vez al iniciar
    const initialNarration = {
      id: `narration-initial-${flow.id}`,
      type: 'context' as const,
      text: 'Iniciamos recorrido',
    };

    // Reproducir el mensaje inicial directamente
    if (narration.status === 'idle') {
      narration.playNarration(initialNarration).catch((error) => {
        console.error('Error playing initial narration:', error);
      });
    }

    // Cleanup: detener narrations cuando el flow se cierra
    return () => {
      narration.stopNarration();
    };
  }, [flow?.id]); // Solo cuando cambia el flow (una vez al iniciar)

  // Integrar geofencing con narration triggers - solo cuando usuario está cerca de spot
  useEffect(() => {
    if (!isVisible || !flow || flowSpots.length === 0) {
      geofencingSimulator.stopMonitoring();
      return;
    }

    // Configurar callbacks de geofencing para disparar narrations solo cuando se llega a un spot
    const removeCallbacks = geofencingSimulator.addCallbacks({
      onArriving: (spotId: string) => {
        // Solo disparar narration cuando el usuario llega a un spot
        narrationTriggers.triggerArriving(spotId);
      },
      // Desactivar approaching y leaving para evitar narrations en loop
      onApproaching: () => {
        // No hacer nada - solo narrations al llegar
      },
      onLeaving: () => {
        // No hacer nada - solo narrations al llegar
      },
    });

    // Iniciar monitoreo con ubicación del usuario si está disponible
    if (userLocation) {
      geofencingSimulator.startMonitoring(userLocation, flowSpots);
    } else if (flowSpots.length > 0) {
      // Fallback: usar primer spot del flow si no hay ubicación del usuario
      const initialLocation = {
        latitude: flowSpots[0].location.latitude,
        longitude: flowSpots[0].location.longitude,
      };
      geofencingSimulator.startMonitoring(initialLocation, flowSpots);
    }

    return () => {
      removeCallbacks();
      geofencingSimulator.stopMonitoring();
    };
  }, [isVisible, flow?.id, flowSpots.length, userLocation, narrationTriggers]);

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
    if (!flow) return;
    
    // Detener narrations antes de cerrar
    narration.stopNarration();
    
    // En web/iOS Safari, usar modal personalizado; en móvil nativo, usar Alert.alert
    if (Platform.OS === 'web') {
      setShowCloseConfirmModal(true);
    } else {
      Alert.alert(
        'Close flow',
        'Do you want to save this flow before closing?',
        [
          {
            text: 'Close without saving',
            style: 'cancel',
            onPress: () => {
              endFlow();
              router.back();
            },
          },
          {
            text: 'Save flow',
            onPress: () => {
              toggleSaveFlow(flow.id);
              endFlow();
              router.back();
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleCloseWithoutSaving = () => {
    setShowCloseConfirmModal(false);
    endFlow();
    router.back();
  };

  const handleCloseAndSave = () => {
    if (!flow) return;
    setShowCloseConfirmModal(false);
    toggleSaveFlow(flow.id);
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
          <Tooltip text="Minimize">
            <TouchableOpacity
              onPress={handleMinimize}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="minimize" size={24} color={colors.text} />
            </TouchableOpacity>
          </Tooltip>
          <Tooltip text="Close">
            <TouchableOpacity
              onPress={handleClose}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </Tooltip>
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

  // Helper para calcular tiempo estimado al siguiente spot
  const calculateTimeToNextSpot = (
    fromLocation: { latitude: number; longitude: number },
    toLocation: { latitude: number; longitude: number },
    mode: MovementMode
  ): number => {
    const distance = calculateDistance(
      fromLocation.latitude,
      fromLocation.longitude,
      toLocation.latitude,
      toLocation.longitude
    );
    // Velocidades promedio en m/min
    const speedPerMinute = {
      walking: 83.33, // 5 km/h = 83.33 m/min
      bike: 250, // 15 km/h = 250 m/min
      car: 833.33, // 50 km/h = 833.33 m/min
    };
    return Math.round(distance / speedPerMinute[mode]);
  };

  const renderProgress = () => {
    const timeToNextSpot = nextSpotData && currentSpot && flow
      ? calculateTimeToNextSpot(currentSpot.location, nextSpotData.location, flow.movementMode)
      : null;

    return (
    <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Text style={[textStyles.caption, { color: colors.icon }]}>
            {progress}%
          </Text>
          {timeToNextSpot !== null && (
            <Text style={[textStyles.caption, { color: colors.icon }]}>
              Next spot in {timeToNextSpot} min
            </Text>
          )}
        </View>
      <View style={[styles.progressBar, { backgroundColor: colors.icon + '20' }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.tint, width: `${progress}%` },
          ]}
        />
      </View>
    </View>
  );
  };

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
            <View style={styles.currentSpotHeader}>
              <Text style={[textStyles.heading3, { color: colors.text }]}>
                CURRENT
              </Text>
              <View style={[styles.liveTag, { backgroundColor: colors.tint }]}>
                <Text style={[textStyles.caption, { color: '#fff' }]}>Live</Text>
              </View>
            </View>
            <GlassView style={styles.currentSpotCard} intensity="light" opacity="medium">
              <View style={styles.currentSpotCardContent}>
                {/* Left: Title and info */}
                <View style={styles.currentSpotCardLeft}>
                  <Text style={[styles.currentSpotTitle, { color: colors.text }]} numberOfLines={1}>
                    {currentSpot.name || 'Unnamed spot'}
                  </Text>
                  {currentSpot.description && (
                    <Text style={[styles.currentSpotDescription, { color: colors.icon }]} numberOfLines={2}>
                      {currentSpot.description}
                    </Text>
                  )}
                  {userLocation && (
                    <View style={styles.currentSpotDistance}>
                      <Icon name="map" size={12} color={colors.icon} />
                      <Text style={[styles.currentSpotDistanceText, { color: colors.icon }]}>
                        {(() => {
                          const dist = calculateDistanceToSpot(userLocation, currentSpot.location);
                          if (!dist) return '';
                          if (dist < 1000) return `${Math.round(dist)}m`;
                          return `${(dist / 1000).toFixed(1)} km`;
                        })()}
                      </Text>
                    </View>
                  )}
                </View>
                {/* Right: Chip (placeholder for Scope 13) */}
                <View style={styles.currentSpotCardRight}>
                  {/* TODO: Scope 13 - Chip "Integra a plan" */}
                </View>
              </View>
            </GlassView>
            </View>
        )}

        {/* Listado de spots futuros con drag and drop */}
        {futureSpots.length > 0 && (
          <View style={styles.spotsListContainer}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md }]}>
              UP NEXT
            </Text>
            {futureSpots.map((spot, relativeIndex) => {
              const absoluteIndex = currentIndex + 1 + relativeIndex;
              const distance = userLocation
                ? calculateDistanceToSpot(userLocation, spot.location)
                : undefined;
              
              // Calcular tiempo estimado desde el spot anterior (o current spot para el primero)
              const previousSpot = relativeIndex === 0 ? currentSpot : futureSpots[relativeIndex - 1];
              const estimatedTime = previousSpot && flow
                ? calculateTimeToNextSpot(previousSpot.location, spot.location, flow.movementMode)
                : undefined;

          return (
                <FlowSpotCard
                  key={spot.id}
                  spot={spot}
                  index={absoluteIndex}
                  distance={distance}
                  estimatedTime={estimatedTime}
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

    // Calcular ruta punto a punto: desde ubicación actual hasta siguiente spot
    const routeFrom = userLocation;
    const routeTo = nextSpotData ? nextSpotData.location : null;

    const handleOpenNavigation = async () => {
      if (!userLocation || !nextSpotData) {
        Alert.alert(
          'Navigation unavailable',
          'Location and next spot are required to open navigation.'
        );
        return;
      }

      if (!flow) {
        Alert.alert('Error', 'Flow information is missing.');
        return;
      }

      try {
        const navigationMode = mapMovementModeToNavigationMode(flow.movementMode);
        const success = await openNavigationApp(
          userLocation,
          nextSpotData.location,
          navigationMode
        );

        if (!success) {
          Alert.alert(
            'Navigation unavailable',
            'Could not open navigation app. Please try again or use Google Maps in your browser.'
          );
        }
      } catch (error) {
        console.error('Error opening navigation:', error);
        Alert.alert(
          'Error',
          'An error occurred while opening navigation. Please try again.'
        );
      }
    };

    return (
      <View style={styles.mapContainer}>
        <FlowyaMapView
          spots={flowSpots}
          onSpotPress={(spot) => {
            // TODO: Navegar al spot seleccionado
            console.log('Spot pressed:', spot.id);
          }}
          showRoute={true}
          flowSpots={flowSpots}
          showUserLocation={!!userLocation}
          userLocation={userLocation}
          routeFrom={routeFrom}
          routeTo={routeTo}
        />
        {/* Botón flotante de navegación */}
        {userLocation && nextSpotData && (
          <View style={styles.navigationButtonContainer}>
            <Tooltip text="Get directions">
              <TouchableOpacity
                style={[styles.navigationButton, { backgroundColor: colors.tint }]}
                onPress={handleOpenNavigation}
                activeOpacity={0.7}>
                <Icon name="directions" size={24} color="#fff" />
              </TouchableOpacity>
            </Tooltip>
          </View>
        )}
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
        {viewMode === 'list' ? (
        <ScrollView
          style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {renderProgress()}
            {renderTimeline()}
        </ScrollView>
        ) : (
          <>
            {renderProgress()}
            {renderMapView()}
          </>
        )}
        {renderControls()}
      </Animated.View>
      
      {/* Modal de confirmación para web/iOS Safari */}
      <Modal
        visible={showCloseConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCloseConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <GlassView style={styles.modalContent} intensity="medium" opacity="strong">
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
              Close flow
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
              Do you want to save this flow before closing?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.icon }]}
                onPress={() => setShowCloseConfirmModal(false)}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleCloseWithoutSaving}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
                  Close without saving
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleCloseAndSave}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>
                  Save flow
                </Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </View>
      </Modal>
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
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
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
  currentSpotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  liveTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
  },
  currentSpotCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  currentSpotCardContent: {
    flexDirection: 'row',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  currentSpotCardLeft: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  currentSpotCardRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  currentSpotTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: '500',
  },
  currentSpotDescription: {
    fontFamily,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '400',
  },
  currentSpotDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginTop: spacing.xs / 2,
  },
  currentSpotDistanceText: {
    fontFamily,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '400',
  },
  spotsListContainer: {
    gap: spacing.sm,
  },
  mapContainer: {
    flex: 1,
    minHeight: 400,
    position: 'relative',
  },
  navigationButtonContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.md,
    zIndex: 1000,
  },
  navigationButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  modalButtons: {
    gap: spacing.sm,
  },
  modalButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  modalButtonCancel: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
  },
});

