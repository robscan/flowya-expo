/**
 * Saved Screen
 * Scope 11: Saved Screen - Memoria personal del usuario
 * 
 * Principios de diseño:
 * - Header scrollable (igual que Home)
 * - Dos tabs internos: "Saved" e "History"
 * - Tab "Saved": Sliders horizontales de spots y paths guardados
 * - Tab "History": Lista vertical de items visitados sin guardar
 * - Cards con estilo glass
 */

import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Dimensions, LayoutAnimation, Platform, UIManager, RefreshControl } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import * as Location from 'expo-location';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles, fontSize, lineHeight, fontFamilyMedium } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { SpotCard } from '@/components/SpotCard';
import { FlowCard } from '@/components/FlowCard';
import { useSpot } from '@/contexts/SpotContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useFlow } from '@/contexts/FlowContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { Spot } from '@/data/spots';
import { Flow } from '@/data/flows';
import { calculateDistanceToSpot } from '@/utils/distance';
import { TimelineEntry } from '@/contexts/SavedContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400); // 75% of screen width, max 400px for desktop

type SavedTab = 'saved' | 'history';

export default function SavedScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { setIsTabBarLabelsVisible } = useOverlay();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<SavedTab>('saved');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const lastScrollY = useRef(0);
  const isLabelsVisible = useRef(true);

  const { spots, isLoading: spotsLoading, refreshSpots } = useSpot();
  const { paths, isLoading: pathsLoading, refreshFlows } = usePath();
  const { savedSpots, savedPaths, timeline, isLoading: savedLoading } = useSaved();
  const { startFlow } = useFlow();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isLoading = spotsLoading || pathsLoading || savedLoading;

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

  // Obtener spots y paths guardados
  const savedSpotsData = spots.filter((spot) => savedSpots.includes(spot.id));
  const savedPathsData = paths.filter((path) => savedPaths.includes(path.id));

  // Filtrar timeline para History: solo visited que no están guardados
  const historyEntries = timeline.filter((entry) => {
    if (entry.action !== 'visited') return false;
    if (entry.type === 'spot') {
      return !savedSpots.includes(entry.itemId);
    } else {
      return !savedPaths.includes(entry.itemId);
    }
  });

  // Header con icono Profile
  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  // Manejar selección de Spot
  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  };

  // Render horizontal slider of spots
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

  // Render horizontal slider of paths
  const renderPathSlider = (title: string, paths: Flow[]) => {
    if (paths.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <FlatList
          data={paths}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sliderContent}
          keyExtractor={(item) => item.id}
          renderItem={({ item: path }) => {
            const distance = calculateDistanceToSpot(
              userLocation,
              spots.find((s) => s.id === path.spots[0])?.location || { latitude: 0, longitude: 0 }
            );
            return (
              <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                <FlowCard
                  flow={path}
                  spots={spots}
                  distance={distance || undefined}
                  onPress={() => startFlow(path.id)}
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

  // Render history list
  const renderHistory = () => {
    return (
      <View style={styles.pathsList}>
        {historyEntries.map((entry) => {
          if (entry.type === 'spot') {
            const spot = spots.find((s) => s.id === entry.itemId);
            if (!spot) return null;
            const distance = calculateDistanceToSpot(userLocation, spot.location);
            return (
              <SpotCard
                key={entry.id}
                spot={spot}
                distance={distance || undefined}
                onPress={() => handleSpotPress(spot)}
                onMapPress={() => handleSpotPress(spot)}
              />
            );
          } else {
            const path = paths.find((p) => p.id === entry.itemId);
            if (!path) return null;
            const distance = calculateDistanceToSpot(
              userLocation,
              spots.find((s) => s.id === path.spots[0])?.location || { latitude: 0, longitude: 0 }
            );
            return (
              <FlowCard
                key={entry.id}
                flow={path}
                spots={spots}
                distance={distance || undefined}
                onPress={() => startFlow(path.id)}
              />
            );
          }
        })}
      </View>
    );
  };

  // Render empty state for Saved tab
  const renderSavedEmptyState = () => {
    if (savedSpotsData.length > 0 || savedPathsData.length > 0) return null;

    return (
      <View style={styles.emptyState}>
        <Icon name="bookmark" size={48} color={colors.icon} />
        <Text style={[textStyles.heading4, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
          Nothing saved yet
        </Text>
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg, textAlign: 'center' }]}>
          Mark places and save flows to visit later
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/home')}
          style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
          activeOpacity={0.8}>
          <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Explore</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === 'saved') {
      const hasContent = savedSpotsData.length > 0 || savedPathsData.length > 0;
      return (
        <View style={styles.savedContent}>
          {hasContent ? (
            <>
              {renderSpotSlider('Saved places', savedSpotsData)}
              {renderPathSlider('Saved flows', savedPathsData)}
            </>
          ) : (
            renderSavedEmptyState()
          )}
        </View>
      );
    }

    if (activeTab === 'history') {
      return (
        <View style={styles.historyContent}>
          {historyEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="clock" size={48} color={colors.icon} />
              <Text style={[textStyles.heading4, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
                No history
              </Text>
              <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg, textAlign: 'center' }]}>
                Start a flow to see places you've visited
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/home')}
                style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
                activeOpacity={0.8}>
                <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Explore</Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderHistory()
          )}
        </View>
      );
    }

    return null;
  };

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
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={async () => {
                setIsRefreshing(true);
                await Promise.all([refreshSpots(), refreshFlows()]);
                setIsRefreshing(false);
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
              <Text style={[textStyles.heading3, { color: colors.text }]}>Saved</Text>
              <TouchableOpacity
                onPress={handleProfilePress}
                style={iconTouchableContainer.base}
                activeOpacity={0.7}>
                <Icon name="profile" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs internos */}
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
                activeTab === 'saved' && styles.tabActive,
                activeTab === 'saved' && { borderBottomColor: colors.tint },
              ]}
              onPress={() => setActiveTab('saved')}
              activeOpacity={0.7}>
              <Text
                style={[
                  textStyles.bodyMedium,
                  { color: activeTab === 'saved' ? colors.tint : colors.icon },
                ]}>
                Saved
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'history' && styles.tabActive,
                activeTab === 'history' && { borderBottomColor: colors.tint },
              ]}
              onPress={() => setActiveTab('history')}
              activeOpacity={0.7}>
              <Text
                style={[
                  textStyles.bodyMedium,
                  { color: activeTab === 'history' ? colors.tint : colors.icon },
                ]}>
                History
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {renderContent()}
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
    marginBottom: spacing.md,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: spacing.md,
  },
  tabActive: {
    // Estilos adicionales aplicados inline
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  savedContent: {
    // No paddingHorizontal - se aplica en sectionTitle, sliderContent y pathsList
  },
  historyContent: {
    // No paddingHorizontal - se aplica en sectionTitle y pathsList
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
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyStateButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
