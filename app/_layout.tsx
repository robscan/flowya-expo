import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SavedProvider } from '@/contexts/SavedContext';
import { SpotProvider } from '@/contexts/SpotContext';
import { PathProvider } from '@/contexts/PathContext';
import { FlowProvider } from '@/contexts/FlowContext';
import { NarrationProvider } from '@/contexts/NarrationContext';
import { OverlayProvider } from '@/contexts/OverlayContext';
import { NarrationController } from '@/components/NarrationController';
import { FlowScreen } from '@/components/FlowScreen';
import { FlowMiniPlayer } from '@/components/FlowMiniPlayer';

// Mantener la splash screen visible mientras cargan las fuentes
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Cargar fuentes Inter
  // CRÍTICO: Inter como ÚNICA tipografía del proyecto
  // Descargar desde: https://github.com/rsms/inter/releases
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter_18pt-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Ocultar la splash screen cuando las fuentes estén cargadas
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Mostrar nada mientras cargan las fuentes (splash screen se encarga)
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SpotProvider>
        <PathProvider>
          <FlowProvider>
            <NarrationProvider>
              <SavedProvider>
                <OverlayProvider>
                  <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <View style={styles.container}>
                      <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                        <Stack.Screen name="liked-spots" options={{ presentation: 'modal', title: 'Liked Spots', headerShown: false }} />
                        <Stack.Screen name="spot-detail" options={{ presentation: 'card', headerShown: false }} />
                        <Stack.Screen name="flow-full-player" options={{ presentation: 'card', headerShown: false }} />
                      </Stack>
                      <StatusBar style="auto" />
                      <NarrationController />
                      <FlowScreen />
                      <FlowMiniPlayer />
                    </View>
                  </ThemeProvider>
                </OverlayProvider>
              </SavedProvider>
            </NarrationProvider>
          </FlowProvider>
        </PathProvider>
      </SpotProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
