/**
 * Activity Timeline Component
 * Scope 11: Saved Screen - Timeline de actividad reciente
 * 
 * Principios de diseño:
 * - Timeline ligero (sutil, no denso)
 * - Muestra actividad reciente
 * - Estilo glass sutil
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { TimelineEntry } from '@/contexts/SavedContext';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';

interface ActivityTimelineProps {
  entries: TimelineEntry[];
  limit?: number;
}

function getActionLabel(action: TimelineEntry['action']): string {
  const labels: Record<TimelineEntry['action'], string> = {
    like: 'Me gustó',
    not_my_vibe: 'Not my vibe',
    saved: 'Guardó',
    visited: 'Recorrió',
  };
  return labels[action] || action;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Ahora';
  }
  if (diffMins < 60) {
    return `Hace ${diffMins} min`;
  }
  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }
  if (diffDays < 7) {
    return `Hace ${diffDays} d`;
  }
  return date.toLocaleDateString();
}

function getActionIcon(action: TimelineEntry['action']): 'like' | 'bookmark' | 'play' | 'notMyVibe' {
  switch (action) {
    case 'like':
      return 'like';
    case 'saved':
      return 'bookmark';
    case 'visited':
      return 'play';
    case 'not_my_vibe':
      return 'notMyVibe';
    default:
      return 'bookmark';
  }
}

export function ActivityTimeline({ entries, limit = 20 }: ActivityTimelineProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const displayEntries = entries.slice(0, limit);

  if (displayEntries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[textStyles.body, { color: colors.icon }]}>No hay actividad reciente</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {displayEntries.map((entry) => {
        const iconName = getActionIcon(entry.action);
        const actionLabel = getActionLabel(entry.action);
        const timeAgo = formatTimeAgo(entry.timestamp);

        return (
          <GlassView key={entry.id} style={styles.entry} intensity="light" opacity="medium">
            <View style={styles.iconContainer}>
              <Icon name={iconName} size={20} color={colors.tint} />
            </View>
            <View style={styles.content}>
              <Text style={[textStyles.body, { color: colors.text }]}>
                {actionLabel} {entry.type === 'spot' ? 'un Spot' : 'un Path'}
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                {timeAgo}
              </Text>
            </View>
          </GlassView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});

