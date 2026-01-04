/**
 * Search Suggestion Component
 * Scope 10: Search Screen - Sugerencia individual
 * 
 * Principios de diseño:
 * - Estilo glass sutil
 * - Layout horizontal con icono
 * - Tap para seleccionar
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/ui/Icon';

interface SearchSuggestionProps {
  name: string;
  type: 'spot' | 'path';
  onPress: () => void;
}

export function SearchSuggestion({ name, type, onPress }: SearchSuggestionProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const iconName = type === 'spot' ? 'map' : 'explore';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor: colors.background + '80' }]}
      activeOpacity={0.7}>
      <Icon name={iconName} size={20} color={colors.icon} style={styles.icon} />
      <Text style={[textStyles.body, { color: colors.text, flex: 1 }]} numberOfLines={1}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  icon: {
    marginRight: spacing.sm,
  },
});

