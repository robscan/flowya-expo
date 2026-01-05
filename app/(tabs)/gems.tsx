/**
 * Gems Screen
 * Scope 9: Gems Screen - Lo que está brillando ahora
 * 
 * Principios:
 * - Header scrollable (igual que Home)
 * - Sliders horizontales de Spots: Featured, Recent, Suggested
 * - Lista vertical de Paths sugeridos (menor jerarquía)
 * - El foco siempre está en Spots, no en recorrer Paths completos
 */

import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import * as Location from 'expo-location';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { GlassView } from '@/components/ui/GlassView';
import { useSpot } from '@/contexts/SpotContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useFlow } from '@/contexts/FlowContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { getAllGems, getSuggestedPaths } from '@/utils/gemsLogic';
import { getFlowSpots } from '@/data/flows';
import { SpotCard } from '@/components/SpotCard';
import { FlowCard } from '@/components/FlowCard';
import { Spot } from '@/data/spots';
import { Flow } from '@/data/flows';
import { calculateDistanceToSpot } from '@/utils/distance';
import { fontSize, lineHeight, fontFamilyMedium } from '@/constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400); // 75% of screen width, max 400px for desktop

export default function GemsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { setIsTabBarLabelsVisible } = useOverlay();
  const colors = Colors[colorScheme ?? 'light'];
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const lastScrollY = useRef(0);
  const isLabelsVisible = useRef(true);

  const { spots, isLoading: spotsLoading } = useSpot();
  const { paths, isLoading: pathsLoading } = usePath();
  const { likedSpots, savedSpots } = useSaved();
  const { startFlow } = useFlow();

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Handle scroll to show/hide tab bar labels
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDifference = 10; // Threshold for scroll detection

    if (currentScrollY > lastScrollY.current + scrollDifference && isLabelsVisible.current) {
      // Scrolling down - hide labels
      isLabelsVisible.current = false;
      LayoutAnimation.configureNext({
        duration: 300,
        create: { type: 'easeInEaseOut', property: 'opacity' },
        update: { type: 'easeInEaseOut', property: 'opacity' },
        delete: { type: 'easeInEaseOut', property: 'opacity' },
      });
      setIsTabBarLabelsVisible(false);
      navigation.setOptions({
        tabBarShowLabel: false,
      });
    } else if (currentScrollY < lastScrollY.current - scrollDifference && !isLabelsVisible.current) {
      // Scrolling up - show labels
      isLabelsVisible.current = true;
      LayoutAnimation.configureNext({
        duration: 300,
        create: { type: 'easeInEaseOut', property: 'opacity' },
        update: { type: 'easeInEaseOut', property: 'opacity' },
        delete: { type: 'easeInEaseOut', property: 'opacity' },
      });
      setIsTabBarLabelsVisible(true);
      navigation.setOptions({
        tabBarShowLabel: true,
      });
    }

    lastScrollY.current = currentScrollY;
  };

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

  // Calcular Gems
  const gems = getAllGems(spots, likedSpots, savedSpots, {
    featuredLimit: 5,
    recentLimit: 5,
    suggestedLimit: 5,
  });
  
  const suggestedPaths = getSuggestedPaths(paths, savedSpots, spots, 3);
  const isLoading = spotsLoading || pathsLoading;

  // Header con icono Profile
  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  // Manejar selección de Spot
  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  };

  // Render horizontal slider of spots
  const renderSpotSlider = (title: string, gemSpots: typeof gems.featured) => {
    if (gemSpots.length === 0) return null;

    const spots = gemSpots.map((gem) => gem.spot);

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <FlatList
          data={spots}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sliderContent}
          keyExtractor={(item) => item.id}
          renderItem={({ item: spot }) => {
            const distance = calculateDistanceToSpot(userLocation, spot.location);
            return (
              <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                <SpotCard
                  spot={spot}
                  distance={distance || undefined}
                  onPress={() => handleSpotPress(spot)}
                  onMapPress={() => handleSpotPress(spot)}
                  inSlider={true}
                />
              </View>
            );
          }}
          snapToInterval={CARD_WIDTH + spacing.sm}
          decelerationRate="fast"
          pagingEnabled={false}
        />
      </View>
    );
  };

  // Render paths list (vertical)
  const renderPathsList = (title: string, paths: Flow[]) => {
    if (paths.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <View style={styles.pathsList}>
          {paths.map((path) => {
            const distance = calculateDistanceToSpot(
              userLocation,
              spots.find((s) => s.id === path.spots[0])?.location || { latitude: 0, longitude: 0 }
            );
            return (
              <FlowCard
                key={path.id}
                flow={path}
                spots={spots}
                distance={distance || undefined}
                onPress={() => {
                  startFlow(path.id);
                }}
              />
            );
          })}
        </View>
      </View>
    );
  };

  // Get paths from suggestedPaths
  const suggestedPathsList = suggestedPaths.map((gem) => gem.path);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.loadingState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Loading...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {/* Header inside ScrollView (scrolls) */}
          <View
            style={[
              styles.header,
              {
                borderBottomColor:
                  colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
            ]}>
            <View style={styles.headerContent}>
              <Text style={[textStyles.heading3, { color: colors.text }]}>Gems</Text>
              <TouchableOpacity
                onPress={handleProfilePress}
                style={iconTouchableContainer.base}
                activeOpacity={0.7}>
                <Icon name="profile" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <View style={styles.gemsContent}>
            {/* Sliders de spots */}
            {renderSpotSlider('Featured - Spots', gems.featured)}
            {renderSpotSlider('Recent - Spots', gems.recent)}
            {renderSpotSlider('Suggested - Spots', gems.suggested)}

            {/* Lista vertical de paths sugeridos */}
            {renderPathsList('Suggested - Paths', suggestedPathsList)}
          </View>
        </ScrollView>
      )}

      {/* Spot Detail Sheet */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  gemsContent: {
    // No paddingHorizontal - se aplica en sectionTitle, sliderContent y pathsList
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sliderContent: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.lg,
  },
  sliderCard: {
    marginRight: spacing.sm, // 16px
  },
  pathsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm, // 16px
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
