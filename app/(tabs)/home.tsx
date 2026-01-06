/**
 * Home Screen with Apple Music-like structure
 * Scope 5: Home - Explore Tab
 * 
 * Home · Explore: "What can I do here and now?"
 * - Horizontal sliders of spots: Nearby, For You, Recommended
 * - Horizontal sliders of compact spots: Recently Viewed, Maybe You Like (Global), New (Global)
 * - Path lists with clear titles
 * - Everything organized by location
 */

import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, Dimensions, LayoutAnimation, Platform, UIManager, RefreshControl } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles, fontSize, lineHeight, fontFamilyMedium } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { SpotCard } from '@/components/SpotCard';
import { SpotCardCompact } from '@/components/SpotCardCompact';
import { FlowCard } from '@/components/FlowCard';
import { SpotCardSkeleton, SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { LocationWeatherHeader } from '@/components/LocationWeatherHeader';
import { useSpot } from '@/contexts/SpotContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { Spot } from '@/data/spots';
import { Flow } from '@/data/flows';
import { calculateDistanceToSpot } from '@/utils/distance';
import { getWeatherCondition, getWeatherGradientColor, WeatherCondition } from '@/utils/weather';
import { getFeaturedSpots, getRecentSpots } from '@/utils/gemsLogic';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400); // 75% of screen width, max 400px for desktop

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { setIsTabBarLabelsVisible } = useOverlay();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('default');
  const colors = Colors[colorScheme ?? 'light'];
  const lastScrollY = useRef(0);
  const isLabelsVisible = useRef(true);

  const { spots, isLoading: spotsLoading, refreshSpots } = useSpot();
  const { paths, isLoading: pathsLoading, refreshFlows } = usePath();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { likedSpots, savedSpots, timeline } = useSaved();
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Get user location and weather
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permissions denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(locationData);

        // Obtener condición climática
        try {
          const condition = await getWeatherCondition(locationData.latitude, locationData.longitude);
          setWeatherCondition(condition);
        } catch (error) {
          console.error('Error getting weather:', error);
          // Fallback a condición por defecto si falla
          setWeatherCondition('default');
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Header with Profile icon
  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  // Navigate to testing components
  const handleTestingPress = () => {
    router.push('/testing-components');
  };

  // Handle Spot selection (normal detail)
  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  };

  // Handle "View on map" (opens detail in map view)
  const handleMapPress = (spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  };

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

  // Location to use for filtering (selected or user location)
  const currentLocation = selectedLocation || userLocation;

  // Organize spots by categories with priority system to avoid duplicates
  const getFilteredSpotsByPriority = () => {
    const usedSpotIds = new Set<string>();
    const location = currentLocation;

    // 1. Nearby spots (highest priority)
    const getNearbySpots = (): Spot[] => {
      if (!location) return [];
      
      const nearby = spots
        .map((spot) => ({
          spot,
          distance: calculateDistanceToSpot(location, spot.location) || Infinity,
        }))
        .filter((item) => item.distance !== Infinity && item.distance < 5000) // Less than 5km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10)
        .map((item) => item.spot)
        .filter((spot) => !usedSpotIds.has(spot.id));
      
      nearby.forEach((spot) => usedSpotIds.add(spot.id));
      return nearby;
    };

    // 2. For You spots (based on user interactions)
    const getForYouSpots = (): Spot[] => {
      // Get spots similar to liked/saved spots (by type)
      const userLikedTypes = new Set(
        spots
          .filter((spot) => likedSpots.includes(spot.id) || savedSpots.includes(spot.id))
          .map((spot) => spot.type)
      );

      const forYou = spots
        .filter((spot) => !usedSpotIds.has(spot.id))
        .filter((spot) => userLikedTypes.has(spot.type) || likedSpots.includes(spot.id) || savedSpots.includes(spot.id))
        .slice(0, 10);
      
      forYou.forEach((spot) => usedSpotIds.add(spot.id));
      return forYou;
    };

    // 3. Recommended spots (popular spots not in previous sections)
    const getRecommendedSpots = (): Spot[] => {
      // Calculate popularity score based on likes and saves
      const scored = spots
        .filter((spot) => !usedSpotIds.has(spot.id))
        .map((spot) => {
          let score = 0;
          if (likedSpots.includes(spot.id)) score += 3;
          if (savedSpots.includes(spot.id)) score += 2;
          if (spot.name) score += 1;
          if (spot.photos && spot.photos.length > 0) score += 1;
          return { spot, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item) => item.spot);
      
      scored.forEach((spot) => usedSpotIds.add(spot.id));
      return scored;
    };

    // 4. Recently viewed spots (from timeline)
    const getRecentlyViewedSpots = (): Spot[] => {
      const viewedSpotIds = timeline
        .filter((entry) => entry.type === 'spot' && entry.action === 'visited')
        .map((entry) => entry.itemId)
        .slice(0, 20); // Get last 20 viewed spots

      const recentlyViewed = spots
        .filter((spot) => !usedSpotIds.has(spot.id) && viewedSpotIds.includes(spot.id))
        .sort((a, b) => {
          const aIndex = viewedSpotIds.indexOf(a.id);
          const bIndex = viewedSpotIds.indexOf(b.id);
          return aIndex - bIndex; // Most recent first
        })
        .slice(0, 10);
      
      recentlyViewed.forEach((spot) => usedSpotIds.add(spot.id));
      return recentlyViewed;
    };

    // 5. Maybe You Like (global featured spots)
    const getMaybeYouLikeSpots = (): Spot[] => {
      const featuredGems = getFeaturedSpots(
        spots.filter((spot) => !usedSpotIds.has(spot.id)),
        likedSpots,
        savedSpots,
        10
      );
      const maybeYouLike = featuredGems.map((gem) => gem.spot);
      
      maybeYouLike.forEach((spot) => usedSpotIds.add(spot.id));
      return maybeYouLike;
    };

    // 6. New spots (global recent spots)
    const getNewSpots = (): Spot[] => {
      const recentGems = getRecentSpots(
        spots.filter((spot) => !usedSpotIds.has(spot.id)),
        10
      );
      const newSpots = recentGems.map((gem) => gem.spot);
      
      newSpots.forEach((spot) => usedSpotIds.add(spot.id));
      return newSpots;
    };

    return {
      nearby: getNearbySpots(),
      forYou: getForYouSpots(),
      recommended: getRecommendedSpots(),
      recentlyViewed: getRecentlyViewedSpots(),
      maybeYouLike: getMaybeYouLikeSpots(),
      new: getNewSpots(),
    };
  };

  // Organize flows by proximity
  const getNearbyPaths = (): Flow[] => {
    const location = currentLocation;
    if (!location) return paths;
    
    // Sort flows by distance to first spot
    return paths
      .map((path) => {
        const pathSpots = path.spots
          .map((spotId) => spots.find((s) => s.id === spotId))
          .filter((s): s is Spot => s !== undefined);
        
        if (pathSpots.length === 0) return { path, distance: Infinity };
        
        const firstSpotDistance = calculateDistanceToSpot(location, pathSpots[0].location) || Infinity;
        return { path, distance: firstSpotDistance };
      })
      .sort((a, b) => a.distance - b.distance)
      .map((item) => item.path);
  };

  // Render horizontal slider of spots (full card)
  const renderSpotSlider = (title: string, spots: Spot[]) => {
    if (spots.length === 0) return null;

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
            const distance = calculateDistanceToSpot(currentLocation, spot.location);
            return (
              <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                <SpotCard
                  spot={spot}
                  distance={distance || undefined}
                  onPress={() => handleSpotPress(spot)}
                  onMapPress={() => handleMapPress(spot)}
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

  // Render horizontal slider of compact spots (small card)
  const renderSpotSliderCompact = (title: string, spots: Spot[]) => {
    if (spots.length === 0) return null;

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
            const distance = calculateDistanceToSpot(currentLocation, spot.location);
            return (
              <View style={styles.sliderCardCompact}>
                <SpotCardCompact
                  spot={spot}
                  distance={distance || undefined}
                  onPress={() => handleSpotPress(spot)}
                  onMapPress={() => handleMapPress(spot)}
                />
              </View>
            );
          }}
          snapToInterval={160 + spacing.sm}
          decelerationRate="fast"
          pagingEnabled={false}
        />
      </View>
    );
  };

  // Render flows list
  const renderPathsList = (title: string, paths: Flow[]) => {
    if (paths.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.xs }]}>{title}</Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginTop: 0, marginBottom: spacing.md, paddingHorizontal: spacing.md }]}>
          Curated flows connecting multiple spots
        </Text>
        <View style={styles.pathsList}>
          {paths.map((path) => {
            const distance = calculateDistanceToSpot(
              currentLocation,
              spots.find((s) => s.id === path.spots[0])?.location || { latitude: 0, longitude: 0 }
            );
            return (
              <FlowCard
                key={path.id}
                flow={path}
                spots={spots}
                distance={distance || undefined}
                onPress={() => {
                  router.push(`/flow-detail?id=${path.id}`);
                }}
              />
            );
          })}
        </View>
      </View>
    );
  };

  // Render Explore content
  const renderExplore = () => {
    const isLoading = spotsLoading || pathsLoading;

    if (isLoading) {
      return (
        <View style={styles.exploreContent}>
          <View style={styles.section}>
            <SkeletonLoader width="40%" height={24} style={{ marginBottom: spacing.md, marginHorizontal: spacing.md }} />
            <FlatList
              data={[1, 2, 3]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContent}
              keyExtractor={(item) => item.toString()}
              renderItem={() => (
                <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                  <SpotCardSkeleton />
                </View>
              )}
            />
          </View>
          <View style={styles.section}>
            <SkeletonLoader width="50%" height={24} style={{ marginBottom: spacing.md, marginHorizontal: spacing.md }} />
            <FlatList
              data={[1, 2, 3]}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderContent}
              keyExtractor={(item) => item.toString()}
              renderItem={() => (
                <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                  <SpotCardSkeleton />
                </View>
              )}
            />
          </View>
        </View>
      );
    }

    const filteredSpots = getFilteredSpotsByPriority();
    const nearbySpots = filteredSpots.nearby;
    const forYouSpots = filteredSpots.forYou;
    const recommendedSpots = filteredSpots.recommended;
    const recentlyViewedSpots = filteredSpots.recentlyViewed;
    const maybeYouLikeSpots = filteredSpots.maybeYouLike;
    const newSpots = filteredSpots.new;
    const nearbyPaths = getNearbyPaths();

    // Verificar si hay contenido para mostrar
    const hasContent =
      nearbySpots.length > 0 ||
      recommendedSpots.length > 0 ||
      forYouSpots.length > 0 ||
      recentlyViewedSpots.length > 0 ||
      maybeYouLikeSpots.length > 0 ||
      newSpots.length > 0 ||
      nearbyPaths.length > 0;

    if (!hasContent) {
      return (
        <View style={styles.emptyState}>
          <Icon name="map" size={48} color={colors.icon + '60'} />
          <Text style={[textStyles.heading4, { color: colors.text, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xs }]}>
            Nothing nearby
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, textAlign: 'center', marginBottom: spacing.lg }]}>
            Explore the map or mark a place
          </Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/(tabs)/map')}
            activeOpacity={0.8}>
            <Icon name="map" size={20} color="#fff" />
            <Text style={[textStyles.bodyMedium, { color: '#fff', marginLeft: spacing.xs }]}>
              Explore map
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.exploreContent}>
        {/* Sliders de spots (card completa) */}
        {nearbySpots.length > 0 && renderSpotSlider('Nearby - Spots', nearbySpots)}
        {forYouSpots.length > 0 && renderSpotSlider('For You - Spots', forYouSpots)}
        {recommendedSpots.length > 0 && renderSpotSlider('Recommended - Spots', recommendedSpots)}

        {/* Sliders de spots compactos (card pequeña - menor jerarquía) */}
        {recentlyViewedSpots.length > 0 && renderSpotSliderCompact('Recently Viewed - Spots', recentlyViewedSpots)}
        {maybeYouLikeSpots.length > 0 && renderSpotSliderCompact('Maybe You Like - Spots', maybeYouLikeSpots)}
        {newSpots.length > 0 && renderSpotSliderCompact('New - Spots', newSpots)}

        {/* Listados de flows */}
        {nearbyPaths.length > 0 && renderPathsList('Nearby - Flows', nearbyPaths)}
      </View>
    );
  };

  const gradientColor = getWeatherGradientColor(weatherCondition, colorScheme);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Degradado de clima sutil en la parte superior */}
      {gradientColor !== 'transparent' && (
        <LinearGradient
          colors={[gradientColor, 'transparent']}
          locations={[0, 0.5]}
          style={styles.weatherGradient}
          pointerEvents="none"
        />
      )}
      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={async () => {
              setIsRefreshing(true);
              try {
                await Promise.all([refreshSpots(), refreshFlows()]);
              } catch (error) {
                console.error('Error refreshing:', error);
              } finally {
                setIsRefreshing(false);
              }
            }}
            tintColor={colors.tint}
          />
        }>
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
            <Text style={[textStyles.heading3, { color: colors.text }]}>FLOWYA - Home</Text>
            <TouchableOpacity
              onPress={handleProfilePress}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="profile" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location and Weather Header */}
        <LocationWeatherHeader
          userLocation={userLocation}
          selectedLocation={selectedLocation}
          onLocationChange={(location) => setSelectedLocation(location)}
          onResetLocation={() => setSelectedLocation(null)}
        />

        {/* Explore content */}
        {renderExplore()}
      </ScrollView>

      {/* Testing Components button - Hidden by default, show only when needed for component/token work */}
      {false && (
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleTestingPress}
        activeOpacity={0.8}>
        <View
          style={[
            styles.floatingButtonContent,
            { backgroundColor: colors.background, borderColor: colors.icon + '20' },
          ]}>
          <Text style={[textStyles.label, { color: colors.text }]}>Testing Components</Text>
        </View>
      </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  weatherGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300, // Degradado en los primeros 300px
    zIndex: 0,
    pointerEvents: 'none',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    paddingBottom: spacing['2xl'],
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exploreContent: {
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sliderContent: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.lg,
    paddingVertical: spacing.xs, // 8px - Allow shadows to show on cards
  },
  sliderCard: {
    marginRight: spacing.sm, // 16px
  },
  sliderCardCompact: {
    width: 160, // Fixed width for compact cards
    marginRight: spacing.sm, // 16px
  },
  pathsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm, // 16px
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  floatingButton: {
    position: 'absolute',
    top: spacing.lg, // Movido más arriba (de bottom a top)
    right: spacing.md,
    zIndex: 1000,
  },
  floatingButtonContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    borderWidth: 1,
  },
  scrollIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,
    pointerEvents: 'none',
  },
  scrollIndicatorLeft: {
    left: 0,
  },
  scrollIndicatorRight: {
    right: 0,
  },
});
