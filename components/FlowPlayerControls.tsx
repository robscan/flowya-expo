/**
 * Flow Player Controls Component
 * Componente unificado para controles de reproducción en todas las modalidades
 * 
 * Variantes:
 * - mini: Para FlowMiniPlayer (compacto horizontal)
 * - screen: Para FlowScreen (barra inferior fija)
 * - full: Para FlowFullPlayer (expandido con info)
 * 
 * Funcionalidades:
 * - Sincronización automática Flow/Narration
 * - Mute accesible en todas las modalidades
 * - Feedback visual del estado de narración
 * - Áreas táctiles mínimas de 48px
 */

import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useNarration } from '@/contexts/NarrationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FlowPlayerControlsProps {
  variant: 'mini' | 'full' | 'screen';
  showPrevious?: boolean;
  showNext?: boolean;
  showMute?: boolean;
  compact?: boolean;
  onExpand?: () => void; // Para FlowMiniPlayer
}

export function FlowPlayerControls({
  variant,
  showPrevious = false,
  showNext = true,
  showMute = true,
  compact = false,
  onExpand,
}: FlowPlayerControlsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { flowState, pauseFlow, resumeFlow, previousSpot, nextSpot, nextSpotId } = useFlow();
  const narration = useNarration();

  // Sincronizar pausa Flow con pausa Narration
  const handlePause = useCallback(() => {
    if (flowState.status === 'active') {
      pauseFlow();
      narration.pauseNarration(); // Sincronizar: pausar narración también
    } else if (flowState.status === 'paused') {
      resumeFlow();
      narration.resumeNarration(); // Sincronizar: reanudar narración también
    }
  }, [flowState.status, pauseFlow, resumeFlow, narration]);

  const handlePrevious = useCallback(() => {
    previousSpot();
  }, [previousSpot]);

  const handleNext = useCallback(() => {
    nextSpot();
  }, [nextSpot]);

  const handleMute = useCallback(() => {
    narration.toggleMute();
  }, [narration]);

  // Determinar tamaños según variante
  const iconSize = variant === 'mini' ? 18 : 24;
  const controlGap = compact ? spacing.xs / 2 : (variant === 'mini' ? spacing.xs / 2 : spacing.xl);
  const minTouchArea = 48;

  // Estilos según variante
  const containerStyle = [
    styles.container,
    variant === 'mini' && styles.containerMini,
    variant === 'screen' && [styles.containerScreen, { borderTopColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }],
    variant === 'full' && [styles.containerFull, { borderTopColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }],
  ];

  const controlsStyle = [
    styles.controls,
    { gap: controlGap },
  ];


  // Renderizar info de narración para variante full
  const renderNarrationInfo = () => {
    if (variant !== 'full') return null;

    return (
      <View style={styles.narrationInfo}>
        <Text style={[textStyles.caption, { color: colors.icon }]}>
          {narration.isMuted ? 'Muted' : 'Narration active'}
        </Text>
        {narration.currentNarration && (
          <Text style={[textStyles.caption, { color: colors.icon }]} numberOfLines={1}>
            {narration.currentNarration.text}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={containerStyle}>
      <View style={controlsStyle}>
        {/* Previous */}
        {showPrevious && (
          <TouchableOpacity
            onPress={handlePrevious}
            style={[iconTouchableContainer.base, styles.controlButton, { minWidth: minTouchArea, minHeight: minTouchArea }]}
            activeOpacity={0.7}>
            <Icon name="previous" size={iconSize} color={colors.text} />
          </TouchableOpacity>
        )}

        {/* Play/Pause */}
        <TouchableOpacity
          onPress={handlePause}
          style={[iconTouchableContainer.base, styles.controlButton, styles.controlButtonPrimary, { minWidth: minTouchArea, minHeight: minTouchArea }]}
          activeOpacity={0.7}>
          <Icon
            name={flowState.status === 'paused' ? 'play' : 'pause'}
            size={iconSize}
            color={colors.text}
          />
        </TouchableOpacity>

        {/* Next */}
        {showNext && (
          <TouchableOpacity
            onPress={handleNext}
            style={[iconTouchableContainer.base, styles.controlButton, { minWidth: minTouchArea, minHeight: minTouchArea }]}
            activeOpacity={0.7}
            disabled={!nextSpotId}>
            <Icon
              name="next"
              size={iconSize}
              color={nextSpotId ? colors.text : colors.icon}
            />
          </TouchableOpacity>
        )}

        {/* Mute */}
        {showMute && (
          <TouchableOpacity
            onPress={handleMute}
            style={[iconTouchableContainer.base, styles.controlButton, { minWidth: minTouchArea, minHeight: minTouchArea }]}
            activeOpacity={0.7}>
            <Icon
              name={narration.isMuted ? 'mute' : 'audio'}
              size={iconSize}
              color={narration.isMuted ? colors.icon : colors.tint}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Info de narración para full */}
      {renderNarrationInfo()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerMini: {
    // Compacto para FlowMiniPlayer
  },
  containerScreen: {
    // Barra fija para FlowScreen
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
  },
  containerFull: {
    // Expandido para FlowFullPlayer
    flexDirection: 'column',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    marginTop: spacing.md,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonPrimary: {
    // Contraste visual para Play/Pause (opcional)
  },
  narrationInfo: {
    flex: 1,
    marginTop: spacing.sm,
  },
});

