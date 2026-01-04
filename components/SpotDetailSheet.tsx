/**
 * SpotDetailSheet Component
 * Scope 5.3: Drawer bottom sheet con efecto glass para mostrar detalles de Spot
 * 
 * Principios de diseño:
 * - Drawer bottom sheet con efecto glass (overlay sobre mundo real)
 * - Background blur detrás del drawer
 * - Fotos en header con efecto glass overlay
 * - Contenido organizado: título, tags, descripción, horarios, costos
 * - Secciones: "Why it matters", "Cultural context", "How to visit", "Plan info"
 * - Frases cortas, lenguaje contemplativo, texto acompaña no lidera
 * - Cards internas con estilo glass sutil (sin bordes, separadas por espacio)
 * - Botones: Máximo 1 acción primaria "Start from here" (contenedor ≥ 48px x 48px)
 * - Acciones secundarias: Guardar (icon.bookmark), 👍 (icon.like), Not my vibe (icon.notMyVibe) - todas con contenedores ≥ 48px x 48px
 * - Iconos: Usar sistema semántico de Lucide
 * - Animación: Transición suave al abrir/cerrar (como respirar)
 * - Accesibilidad: Áreas táctiles generosas, sin fricción
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Pressable,
  Platform,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Spot, SpotType } from '@/data/spots';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { useSaved } from '@/contexts/SavedContext';
import { useFlow } from '@/contexts/FlowContext';
// TODO: Importar usePath cuando se implemente la lógica de iniciar Flow desde un Spot
// import { usePath } from '@/contexts/PathContext';

interface SpotDetailSheetProps {
  spot: Spot | null;
  visible: boolean;
  onClose: () => void;
  onStartFlow?: (pathId: string) => void;
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

// Helper para formatear horarios
function formatHours(hours?: Spot['hours']): string | null {
  if (!hours) return null;
  // Implementación simple - puede mejorarse
  const days = Object.entries(hours)
    .filter(([_, value]) => value)
    .map(([day, value]) => `${day}: ${value}`)
    .join(', ');
  return days || null;
}

// Helper para formatear costo
function formatCost(cost?: Spot['cost']): string | null {
  if (!cost) return null;
  return cost.description || `${cost.amount} ${cost.currency}`;
}

export function SpotDetailSheet({
  spot,
  visible,
  onClose,
  onStartFlow,
}: SpotDetailSheetProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isSpotLiked, isSpotSaved, toggleLikeSpot, toggleSaveSpot, toggleNotMyVibeSpot } =
    useSaved();
  const { startFlow } = useFlow();
  // TODO: Usar paths cuando se implemente la lógica de iniciar Flow desde un Spot
  // const { paths } = usePath();

  if (!spot) return null;

  const isLiked = isSpotLiked(spot.id);
  const isSaved = isSpotSaved(spot.id);
  const hoursText = formatHours(spot.hours);
  const costText = formatCost(spot.cost);

  const handleLike = () => {
    toggleLikeSpot(spot.id);
  };

  const handleSave = () => {
    toggleSaveSpot(spot.id);
  };

  const handleNotMyVibe = () => {
    toggleNotMyVibeSpot(spot.id);
  };

  const handleStartFlow = () => {
    // Buscar un path que incluya este spot, o crear uno temporal
    // Por ahora, simplemente cerramos el sheet
    // TODO: Implementar lógica para iniciar Flow desde un Spot
    onStartFlow?.('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      {/* Background con blur */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <GlassView style={StyleSheet.absoluteFill} intensity="medium" opacity="light" />
      </Pressable>

      {/* Sheet */}
      <View style={styles.sheetContainer} pointerEvents="box-none">
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.sheet}>
          <GlassView style={styles.sheetGlass} intensity="strong" opacity="strong">
            {/* Handle bar */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.icon + '40' }]} />
            </View>

            {/* Header con foto */}
            {spot.photos && spot.photos.length > 0 && (
              <View style={styles.imageHeader}>
                <Image source={{ uri: spot.photos[0] }} style={styles.headerImage} resizeMode="cover" />
                <View style={[styles.imageHeaderOverlay, { backgroundColor: colors.background + '80' }]} />
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, iconTouchableContainer.base]}>
                  <Icon name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            )}

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Título y tipo */}
              <View style={styles.titleSection}>
                {spot.name && (
                  <Text style={[textStyles.heading2, { color: colors.text, marginBottom: spacing.xs }]}>
                    {spot.name}
                  </Text>
                )}
                <View style={[styles.typeTag, { backgroundColor: colors.icon + '15' }]}>
                  <Text style={[textStyles.label, { color: colors.text }]}>
                    {getSpotTypeLabel(spot.type)}
                  </Text>
                </View>
              </View>

              {/* Acciones secundarias */}
              <View
                style={[
                  styles.secondaryActions,
                  {
                    borderBottomWidth: 1,
                    borderBottomColor:
                      colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  },
                ]}>
                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.actionButton, iconTouchableContainer.base]}>
                  <Icon
                    name="bookmark"
                    size={24}
                    color={isSaved ? colors.tint : colors.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLike}
                  style={[styles.actionButton, iconTouchableContainer.base]}>
                  <Icon name="like" size={24} color={isLiked ? colors.tint : colors.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNotMyVibe}
                  style={[styles.actionButton, iconTouchableContainer.base]}>
                  <Icon name="notMyVibe" size={24} color={colors.icon} />
                </TouchableOpacity>
              </View>

              {/* Descripción */}
              {spot.description && (
                <View style={styles.section}>
                  <Text style={[textStyles.body, { color: colors.text }]}>{spot.description}</Text>
                </View>
              )}

              {/* Información adicional */}
              {(hoursText || costText) && (
                <View style={styles.infoSection}>
                  {hoursText && (
                    <View style={styles.infoRow}>
                      <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
                        Horarios
                      </Text>
                      <Text style={[textStyles.body, { color: colors.text }]}>{hoursText}</Text>
                    </View>
                  )}
                  {costText && (
                    <View style={styles.infoRow}>
                      <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
                        Costo
                      </Text>
                      <Text style={[textStyles.body, { color: colors.text }]}>{costText}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Espacio para el botón primario */}
              <View style={{ height: spacing['2xl'] }} />
            </ScrollView>

            {/* Acción primaria */}
            <View
              style={[
                styles.primaryActionContainer,
                {
                  borderTopWidth: 1,
                  borderTopColor:
                    colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                },
              ]}>
              <TouchableOpacity
                onPress={handleStartFlow}
                style={[styles.primaryButton, { backgroundColor: colors.tint }]}
                activeOpacity={0.8}>
                <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Start from here</Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: 24, // Múltiplo de 8
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetGlass: {
    flex: 1,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40, // Múltiplo de 8
    height: 4, // Múltiplo de 8 / 2
    borderRadius: 2,
  },
  imageHeader: {
    width: '100%',
    height: 240, // Múltiplo de 8 (30 * 8)
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageHeaderOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  titleSection: {
    marginBottom: spacing.md,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
  },
  actionButton: {
    // Ya tiene iconTouchableContainer.base aplicado
  },
  section: {
    marginBottom: spacing.lg,
  },
  infoSection: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  infoRow: {
    marginBottom: spacing.md,
  },
  primaryActionContainer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  primaryButton: {
    minHeight: spacing['2xl'], // 48px
    borderRadius: 16, // Múltiplo de 8
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
});

