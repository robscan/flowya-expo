import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View, useEffect } from 'react-native';
import { useOverlay } from '@/contexts/OverlayContext';

import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/theme';
import { fontFamily, fontSize } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { glassColors, glowColors, shadows } from '@/utils/glassStyles';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { tabBarHeight: contextTabBarHeight, isTabBarLabelsVisible } = useOverlay();

  // Tab bar background con efecto glass (BlurView en iOS/Android, transparencia en web)
  // Fondo gris sutil con blur
  const colors = glassColors[colorScheme ?? 'light'];
  const shadow = shadows.strong; // Sombra fuerte para TabBar (como modales) - efecto envolvente
  
  const tabBarBackground = () => {
    if (Platform.OS === 'web') {
      // Web: fondo gris sutil sin blur
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: colors.backgroundGray, // Fondo gris sutil
            },
          ]}
        />
      );
    }
    // iOS/Android: BlurView con fondo gris sutil
    return (
      <BlurView
        intensity={35}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.backgroundGray, // Fondo gris sutil
          },
        ]}
      />
    );
  };

  // Estilos glass para el tab bar: se actualiza dinámicamente desde el contexto
  const glassTabBarStyle = {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: glowColors[colorScheme ?? 'light'].contour, // Glow en borde superior (usando tokens)
    paddingBottom: contextTabBarHeight === 88 ? 20 : 10, // Padding dinámico según altura
    paddingTop: 8, // Padding superior sutil
    height: contextTabBarHeight, // Altura dinámica desde contexto (88 o 58)
    borderTopLeftRadius: 20, // Bordes redondeados superiores para efecto flotante
    borderTopRightRadius: 20,
    ...shadow, // Sombra media para elevación
  };

  return (
      <View style={styles.container}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].icon,
            headerShown: false,
          tabBarBackground: tabBarBackground,
          tabBarStyle: glassTabBarStyle,
            tabBarShowLabel: isTabBarLabelsVisible, // Mostrar/ocultar labels según contexto
            tabBarLabelStyle: {
              fontFamily,
              fontSize: fontSize.xs, // 12px - tamaño pequeño pero legible
              fontWeight: '400',
              marginTop: 4, // Más espacio entre icono y label (cambió de -4 a 4)
            },
            tabBarItemStyle: {
              gap: 4, // Espacio adicional entre icono y label
            },
            tabBarIndicatorStyle: {
              backgroundColor: Colors[colorScheme ?? 'light'].tint, // Color del indicador (mismo que tab activo)
              height: 3, // Altura de la línea indicadora
              top: 0, // Posición en la parte superior
              borderRadius: 1.5, // Bordes ligeramente redondeados
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
            href: null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Icon name="home" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="gems"
            options={{
            title: 'Gems',
            tabBarIcon: ({ color }) => <Icon name="gems" size={28} color={color} />,
            }}
          />
          <Tabs.Screen
            name="saved"
            options={{
              title: 'Saved',
            tabBarIcon: ({ color }) => <Icon name="saved" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <Icon name="search" size={28} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
            href: null, // Ocultar Profile del tab bar
              headerShown: false,
            }}
          />
        </Tabs>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
