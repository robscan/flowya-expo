/**
 * Componente Glass View - Estilo Apple
 * Efecto blur y transparencia para glassmorphism
 */

import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createGlassStyle } from '@/utils/glassStyles';

export interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  opacity?: 'light' | 'medium' | 'strong';
}

export function GlassView({
  children,
  style,
  intensity = 'medium',
  opacity = 'strong',
}: GlassViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const glassStyle = createGlassStyle(colorScheme, opacity);

  if (Platform.OS === 'web') {
    // Web: usar solo transparencia sin blur
    return (
      <View style={[styles.container, glassStyle, style]}>
        {children}
      </View>
    );
  }

  // iOS/Android: usar BlurView nativo
  const blurIntensityValue =
    intensity === 'light' ? 20 : intensity === 'medium' ? 30 : 40;

  return (
    <BlurView
      intensity={blurIntensityValue}
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      style={[styles.container, glassStyle, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

