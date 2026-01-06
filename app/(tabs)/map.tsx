/**
 * Map Screen
 * Tab independiente en el Tab Bar principal
 * 
 * Exploración libre y planeación.
 * Muestra Spots incluso lejanos.
 * Permite crear y ajustar Spots.
 */

import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

import { FlowyaMapView, FlowyaMapViewRef } from '@/components/MapView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const colors = Colors[colorScheme ?? 'light'];
  const mapViewRef = useRef<FlowyaMapViewRef>(null);

  const { spots, isLoading: spotsLoading } = useSpot();

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permissions denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Header with Profile icon
  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  // Handle Spot selection
  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  };

  // Handle Spot creation from map (long press)
  const handleMapLongPress = (location: { latitude: number; longitude: number }) => {
    router.push(`/create-spot?lat=${location.latitude}&lng=${location.longitude}`);
  };

  // Handle Spot creation from button (+)
  const handleCreateSpotPress = () => {
    // Usar ubicación del usuario si está disponible, sino usar ubicación por defecto
    const location = userLocation || {
      latitude: -12.0464,
      longitude: -77.0428,
    };
    router.push(`/create-spot?lat=${location.latitude}&lng=${location.longitude}`);
  };

  // Handle center on user location
  const handleCenterOnUserLocation = () => {
    if (!userLocation) return;
    
    // Llamar a la función expuesta desde FlowyaMapView usando el ref
    if (mapViewRef.current) {
      mapViewRef.current.centerOnUserLocation();
    }
  };

  if (spotsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header absoluto en la parte superior */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor:
              colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            backgroundColor: colors.background,
          },
        ]}>
        <View style={styles.headerContent}>
          <Text style={[textStyles.heading3, { color: colors.text }]}>Map</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleCreateSpotPress}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="add" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleProfilePress}
              style={[iconTouchableContainer.base, { marginLeft: spacing.sm }]}
              activeOpacity={0.7}>
              <Icon name="profile" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Map - Ocupa todo el espacio disponible */}
      <View style={styles.mapContainer}>
        <FlowyaMapView
          ref={mapViewRef}
          spots={spots}
          onSpotPress={handleSpotPress}
          onLongPress={handleMapLongPress}
          showUserLocation={!!userLocation}
          userLocation={userLocation}
        />
      </View>

      {/* Botón flotante para centrar en ubicación actual (lado izquierdo) */}
      {userLocation && (
        <TouchableOpacity
          style={[styles.locationButton, { backgroundColor: '#fff', shadowColor: '#000' }]}
          onPress={handleCenterOnUserLocation}
          activeOpacity={0.8}>
          <Icon name="map" size={20} color="#4285F4" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  locationButton: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
});

