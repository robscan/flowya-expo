import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Toast } from '@/components/ui/Toast';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';
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
  const isOnline = useNetworkStatus();

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
      <AuthProvider>
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
                          <Stack.Screen name="create-spot" options={{ presentation: 'card', headerShown: false }} />
                          <Stack.Screen name="flow-detail" options={{ presentation: 'card', headerShown: false }} />
                        <Stack.Screen name="flow-full-player" options={{ presentation: 'card', headerShown: false }} />
                      </Stack>
                      <StatusBar style="auto" />
                      <NarrationController />
                      <FlowScreen />
                      <FlowMiniPlayer />
                      {/* Offline indicator */}
                      {!isOnline && (
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#FF6B6B', padding: 8, zIndex: 9999 }}>
                          <Text style={{ color: '#fff', textAlign: 'center', fontSize: 12 }}>
                            Offline
                          </Text>
                        </View>
                      )}
                    </View>
                  </ThemeProvider>
                </OverlayProvider>
              </SavedProvider>
            </NarrationProvider>
          </FlowProvider>
        </PathProvider>
      </SpotProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
