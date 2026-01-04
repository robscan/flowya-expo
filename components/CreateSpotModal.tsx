/**
 * Create Spot Modal Component
 * Scope 8: Home - Map Tab - Crear Spot desde Mapa
 * 
 * Principios de diseño:
 * - Modal contextual con estilo glass
 * - Campos opcionales (nombre, descripción, tipo)
 * - Ajuste de ubicación del pin
 * - Foto opcional
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';

import { Spot, SpotType } from '@/data/spots';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';

interface CreateSpotModalProps {
  visible: boolean;
  location: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onCreate: (spot: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const SPOT_TYPES: SpotType[] = [
  'beach',
  'cafe',
  'viewpoint',
  'museum',
  'restaurant',
  'park',
  'monument',
  'market',
  'other',
];

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

export function CreateSpotModal({ visible, location, onClose, onCreate }: CreateSpotModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpotType>('other');

  const handleCreate = () => {
    if (!location) {
      Alert.alert('Error', 'Ubicación no disponible');
      return;
    }

    const newSpot: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name || undefined,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        adjustable: true,
      },
      photos: [],
      description: description || undefined,
      type,
    };

    onCreate(newSpot);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setType('other');
    onClose();
  };

  if (!location) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <GlassView style={styles.modal} intensity="strong" opacity="strong">
          <View style={styles.header}>
            <Text style={[textStyles.heading3, { color: colors.text }]}>Crear Spot</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {/* Ubicación */}
            <View style={styles.section}>
              <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
                Ubicación
              </Text>
              <Text style={[textStyles.caption, { color: colors.text }]}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>

            {/* Nombre */}
            <View style={styles.section}>
              <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
                Nombre (opcional)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon + '30' }]}
                value={name}
                onChangeText={setName}
                placeholder="Nombre del lugar"
                placeholderTextColor={colors.icon}
              />
            </View>

            {/* Descripción */}
            <View style={styles.section}>
              <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
                Descripción (opcional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon + '30' },
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descripción breve"
                placeholderTextColor={colors.icon}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Tipo */}
            <View style={styles.section}>
              <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
                Tipo
              </Text>
              <View style={styles.typeContainer}>
                {SPOT_TYPES.map((spotType) => (
                  <TouchableOpacity
                    key={spotType}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: type === spotType ? colors.tint + '20' : colors.icon + '10',
                        borderColor: type === spotType ? colors.tint : 'transparent',
                      },
                    ]}
                    onPress={() => setType(spotType)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        textStyles.caption,
                        { color: type === spotType ? colors.tint : colors.text },
                      ]}>
                      {getSpotTypeLabel(spotType)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Acciones */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
              onPress={handleClose}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.tint }]}
              onPress={handleCreate}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: colors.background }]}>Crear</Text>
            </TouchableOpacity>
          </View>
        </GlassView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 24,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  typeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  createButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});

