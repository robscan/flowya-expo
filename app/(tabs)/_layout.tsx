import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { glassOpacity } from '@/utils/glassStyles';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Tab bar background con efecto glass (BlurView en iOS/Android, transparencia en web)
  // Principio: sutil, casi invisible, blur suave con transparencia
  const tabBarBackground = () => {
    if (Platform.OS === 'web') {
      // Web: solo transparencia sin blur
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                colorScheme === 'dark'
                  ? `rgba(28, 28, 30, ${glassOpacity.strong})`
                  : `rgba(255, 255, 255, ${glassOpacity.strong})`,
            },
          ]}
        />
      );
    }
    // iOS/Android: BlurView para efecto glass real
    return (
      <BlurView
        intensity={30}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
    );
  };

  // Estilos glass para el tab bar
  const glassTabBarStyle = {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor:
      colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    elevation: 0, // Android: remover sombra
    shadowOpacity: 0, // iOS: remover sombra
  };

  return (
      <View style={styles.container}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
          tabBarBackground: tabBarBackground,
          tabBarStyle: glassTabBarStyle,
          tabBarShowLabel: false, // Ocultar labels de opciones de menú
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
            tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="gems"
            options={{
            title: 'Gems',
            tabBarIcon: ({ color }) => <Icon name="gems" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="saved"
            options={{
              title: 'Saved',
            tabBarIcon: ({ color }) => <Icon name="saved" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <Icon name="search" size={24} color={color} />,
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
