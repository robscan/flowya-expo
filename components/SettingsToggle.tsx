/**
 * Settings Toggle Component
 * Scope 11: Profile Screen - Toggle con estilo glass/nativo
 */

import React from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Platform } from 'react-native';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SettingsToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}

export function SettingsToggle({ label, value, onValueChange, description }: SettingsToggleProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={[textStyles.bodyMedium, { color: colors.text }]}>{label}</Text>
        {description && (
          <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.icon + '40', true: colors.tint + '80' }}
        thumbColor={Platform.OS === 'ios' ? colors.background : value ? colors.tint : colors.icon}
        ios_backgroundColor={colors.icon + '40'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    marginRight: spacing.md,
  },
});

