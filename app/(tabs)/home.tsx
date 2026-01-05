/**
 * Home Screen with Apple Music-like structure
 * Scope 5: Home - Explore Tab
 * 
 * Home · Explore: "What can I do here and now?"
 * - Horizontal sliders of spots: Nearby, For You, Recommended
 * - Path lists with clear titles
 * - Everything organized by location
 * 
 * Home · Map: "I want to understand this place, now or later"
 * - Free map
 * - Visible spots (even distant ones)
 * - Actions: view Spot, save Spot, create Spot, adjust location
 */

import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, FlatList, Dimensions, LayoutAnimation, Platform, UIManager } from 'react-native';
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
import { SimpleMapView } from '@/components/SimpleMapView';
import { CreateSpotModal } from '@/components/CreateSpotModal';
import { FlowCard } from '@/components/FlowCard';
import { useSpot } from '@/contexts/SpotContext';
import { usePath } from '@/contexts/PathContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { Spot } from '@/data/spots';
import { Flow } from '@/data/flows';
import { calculateDistanceToSpot } from '@/utils/distance';
import { getWeatherCondition, getWeatherGradientColor, WeatherCondition } from '@/utils/weather';

type HomeTab = 'explore' | 'map';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400); // 75% of screen width, max 400px for desktop

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { setIsTabBarLabelsVisible } = useOverlay();
  const [activeTab, setActiveTab] = useState<HomeTab>('explore');
  const [createSpotLocation, setCreateSpotLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isCreateSpotModalVisible, setIsCreateSpotModalVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('default');
  const colors = Colors[colorScheme ?? 'light'];
  const lastScrollY = useRef(0);
  const isLabelsVisible = useRef(true);

  const { spots, isLoading: spotsLoading, createSpot } = useSpot();
  const { paths, isLoading: pathsLoading } = usePath();

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

  // Handle Spot creation from map
  const handleMapLongPress = (location: { latitude: number; longitude: number }) => {
    setCreateSpotLocation(location);
    setIsCreateSpotModalVisible(true);
  };

  const handleCreateSpot = (spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>) => {
    createSpot(spotData);
    // Don't close modal immediately - let CreateSpotModal handle it after showing success message
  };

  const handleCloseCreateSpotModal = () => {
    setIsCreateSpotModalVisible(false);
    setCreateSpotLocation(null);
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

  // Organize spots by categories
  const getNearbySpots = (): Spot[] => {
    if (!userLocation) return [];
    
    return spots
      .map((spot) => ({
        spot,
        distance: calculateDistanceToSpot(userLocation, spot.location) || Infinity,
      }))
      .filter((item) => item.distance !== Infinity && item.distance < 5000) // Less than 5km
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
      .map((item) => item.spot);
  };

  const getRecommendedSpots = (): Spot[] => {
    // Recommended spots (basic logic for now, can be improved with recommendation logic later)
    return spots.slice(0, 10);
  };

  const getForYouSpots = (): Spot[] => {
    // Spots for you (basic logic for now, can be improved with personalized logic later)
    return spots.slice(0, 10);
  };

  const getRecentlyViewedSpots = (): Spot[] => {
    // Recently viewed spots (basic logic for now)
    return spots.slice(0, 10);
  };

  const getMaybeYouLikeSpots = (): Spot[] => {
    // Maybe you like (basic logic for now)
    return spots.slice(0, 10);
  };

  // Organize flows by proximity
  const getNearbyPaths = (): Flow[] => {
    if (!userLocation) return paths;
    
    // Sort flows by distance to first spot
    return paths
      .map((path) => {
        const pathSpots = path.spots
          .map((spotId) => spots.find((s) => s.id === spotId))
          .filter((s): s is Spot => s !== undefined);
        
        if (pathSpots.length === 0) return { path, distance: Infinity };
        
        const firstSpotDistance = calculateDistanceToSpot(userLocation, pathSpots[0].location) || Infinity;
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
            const distance = calculateDistanceToSpot(userLocation, spot.location);
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
            const distance = calculateDistanceToSpot(userLocation, spot.location);
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
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.xs / 2 }]}>{title}</Text>
        <Text style={[textStyles.caption, { color: colors.icon, marginTop: 0, marginBottom: spacing.md, paddingHorizontal: spacing.md }]}>
          Curated flows connecting multiple spots
        </Text>
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
                  // TODO: Navigate to flow detail
                  console.log('Flow pressed:', path.id);
                }}
              />
            );
          })}
        </View>
      </View>
    );
  };

  // Render Explore tab
  const renderExplore = () => {
    const isLoading = spotsLoading || pathsLoading;

    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Loading...</Text>
        </View>
      );
    }

    const nearbySpots = getNearbySpots();
    const recommendedSpots = getRecommendedSpots();
    const forYouSpots = getForYouSpots();
    const recentlyViewedSpots = getRecentlyViewedSpots();
    const maybeYouLikeSpots = getMaybeYouLikeSpots();
    const nearbyPaths = getNearbyPaths();

    return (
      <View style={styles.exploreContent}>
        {/* Sliders de spots (card completa) */}
        {nearbySpots.length > 0 && renderSpotSlider('Nearby - Spots', nearbySpots)}
        {forYouSpots.length > 0 && renderSpotSlider('For You - Spots', forYouSpots)}
        {recommendedSpots.length > 0 && renderSpotSlider('Recommended - Spots', recommendedSpots)}

        {/* Sliders de spots compactos (card pequeña - menor jerarquía) */}
        {recentlyViewedSpots.length > 0 && renderSpotSliderCompact('Recently Viewed - Spots', recentlyViewedSpots)}
        {maybeYouLikeSpots.length > 0 && renderSpotSliderCompact('Maybe You Like - Spots', maybeYouLikeSpots)}

        {/* Listados de flows */}
        {nearbyPaths.length > 0 && renderPathsList('Nearby - Flows', nearbyPaths)}
      </View>
    );
  };

  // Render Map tab
  const renderMap = () => {
    if (spotsLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Loading...</Text>
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <SimpleMapView
          spots={spots}
          onSpotPress={handleSpotPress}
          onLongPress={handleMapLongPress}
        />
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
      {/* Tab content */}
      {activeTab === 'explore' ? (
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
          <Text style={[textStyles.heading3, { color: colors.text }]}>FLOWYA - Home</Text>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="profile" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

          {/* Internal tabs inside ScrollView */}
      <View
        style={[
          styles.tabsContainer,
          {
            borderBottomColor:
              colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        ]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'explore' && styles.tabActive,
            activeTab === 'explore' && { borderBottomColor: colors.tint },
          ]}
          onPress={() => setActiveTab('explore')}
          activeOpacity={0.7}>
          <Text
            style={[
              textStyles.bodyMedium,
              { color: activeTab === 'explore' ? colors.tint : colors.icon },
            ]}>
            Explore
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'map' && styles.tabActive,
            activeTab === 'map' && { borderBottomColor: colors.tint },
          ]}
          onPress={() => setActiveTab('map')}
          activeOpacity={0.7}>
          <Text
            style={[
              textStyles.bodyMedium,
              { color: activeTab === 'map' ? colors.tint : colors.icon },
            ]}>
            Map
          </Text>
        </TouchableOpacity>
      </View>

          {/* Explore content */}
          {renderExplore()}
        </ScrollView>
      ) : (
        <View style={styles.mapViewContainer}>
          {/* Fixed header for Map */}
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

          {/* Fixed internal tabs for Map */}
          <View
            style={[
              styles.tabsContainer,
              {
                borderBottomColor:
                  colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'explore' && styles.tabActive,
                activeTab === 'explore' && { borderBottomColor: colors.tint },
              ]}
              onPress={() => setActiveTab('explore')}
              activeOpacity={0.7}>
              <Text
                style={[
                  textStyles.bodyMedium,
                  { color: activeTab === 'explore' ? colors.tint : colors.icon },
                ]}>
                Explore
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'map' && styles.tabActive,
                activeTab === 'map' && { borderBottomColor: colors.tint },
              ]}
              onPress={() => setActiveTab('map')}
              activeOpacity={0.7}>
              <Text
                style={[
                  textStyles.bodyMedium,
                  { color: activeTab === 'map' ? colors.tint : colors.icon },
                ]}>
                Map
              </Text>
            </TouchableOpacity>
          </View>

          {/* Map */}
          {renderMap()}
        </View>
      )}

      {/* Spot Detail Sheet */}

      {/* Create Spot Modal */}
      <CreateSpotModal
        visible={isCreateSpotModalVisible}
        location={createSpotLocation}
        userLocation={userLocation}
        onClose={handleCloseCreateSpotModal}
        onCreate={handleCreateSpot}
      />

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
  mapViewContainer: {
    flex: 1,
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
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: spacing.md,
  },
  tabActive: {
    // Additional styles applied inline
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
  },
  mapContainer: {
    flex: 1,
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
});
