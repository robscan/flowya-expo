/**
 * SkeletonLoader Component
 * Simple skeleton loader for loading states
 */

import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { spacing } from '@/constants/spacing';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonLoaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.icon + '20',
          opacity,
        },
        style,
      ]}
    />
  );
}

// Skeleton for Spot Card
export function SpotCardSkeleton() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.background }]}>
      <SkeletonLoader width="100%" height={200} borderRadius={16} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="60%" height={20} style={{ marginTop: spacing.md }} />
        <SkeletonLoader width="40%" height={16} style={{ marginTop: spacing.xs }} />
        <SkeletonLoader width="30%" height={16} style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  cardContent: {
    padding: spacing.md,
  },
});

