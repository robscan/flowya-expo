/**
 * Spot Detail Screen
 * Full screen page for displaying detailed spot information
 * Based on V5 definition: SPOT DETAIL section
 */

import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SimpleMapView } from '@/components/SimpleMapView';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { borderRadius, borderTokens } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { usePath } from '@/contexts/PathContext';
import { useFlow } from '@/contexts/FlowContext';
import { Spot, SpotType } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateDistanceToSpot, formatDistance } from '@/utils/distance';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4; // 40% of screen height

// Helper para obtener nombre legible del tipo
function getSpotTypeLabel(type: SpotType): string {
  const labels: Record<SpotType, string> = {
    beach: 'Beach',
    cafe: 'Café', // Keep original label for consistency
    viewpoint: 'Viewpoint',
    museum: 'Museum',
    restaurant: 'Restaurant',
    park: 'Park',
    monument: 'Monument',
    market: 'Market',
    other: 'Other',
  };
  return labels[type] || 'Other';
}

// Helper para formatear horarios
function formatHours(hours?: Spot['hours']): string | null {
  if (!hours) return null;
  const days = Object.entries(hours)
    .filter(([_, value]) => value)
    .map(([day, value]) => `${day}: ${value}`)
    .join(', ');
  return days || null;
}

// Helper para formatear costo
function formatCost(cost?: Spot['cost']): string | null {
  if (!cost) return null;
  return cost.description || `${cost.amount} ${cost.currency}`;
}

export default function SpotDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getSpotById } = useSpot();
  const { isSpotSaved, toggleSaveSpot } = useSaved();
  const { createPath } = usePath();
  const { startFlow } = useFlow();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [useMiles, setUseMiles] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Get spot from context
  const spot = id ? getSpotById(id) : null;

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
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

  if (!spot) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <Text style={[textStyles.body, { color: colors.text }]}>Spot not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[textStyles.bodyMedium, { color: colors.tint }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isSaved = isSpotSaved(spot.id);
  const hoursText = formatHours(spot.hours);
  const costText = formatCost(spot.cost);
  const distance = userLocation ? calculateDistanceToSpot(userLocation, spot.location) : null;
  const distanceText = formatDistance(distance || undefined, useMiles);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  const handleSave = () => {
    toggleSaveSpot(spot.id);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const handleMenuPress = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  const handleSuggestEdit = () => {
    setIsMenuVisible(false);
    // TODO: Implement suggest edit functionality
  };

  const handleReport = () => {
    setIsMenuVisible(false);
    // TODO: Implement report functionality
  };

  const handlePlaceNoLongerExists = () => {
    setIsMenuVisible(false);
    // TODO: Implement functionality to indicate that the place no longer exists
  };

  const handleDistancePress = () => {
    setUseMiles(!useMiles);
  };

  const handleStartFlow = () => {
    if (!spot) return;
    
    // Create a temporary path with just this spot
    // The path will grow as the user moves and discovers more spots
    const tempPath = createPath(
      [spot.id],
      'walking',
      spot.name ? `Flow from ${spot.name}` : 'New Flow',
      'We\'ll build the path as you move.'
    );
    
    // Start the flow with this temporary path
    startFlow(tempPath.id);
    
    // Navigate back to allow FlowScreen to show
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Sticky header controls */}
      <View style={styles.stickyHeader}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.headerButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)' }]}>
          <Icon name="back" size={24} color={colorScheme === 'dark' ? '#fff' : colors.text} />
        </TouchableOpacity>
        <View style={styles.headerButtonsRight}>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)' }]}>
            <Icon name="bookmark" size={24} color={isSaved ? colors.tint : (colorScheme === 'dark' ? '#fff' : colors.text)} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.headerButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)' }]}>
            <Icon name="share" size={24} color={colorScheme === 'dark' ? '#fff' : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMenuPress}
            style={[styles.headerButton, { backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)' }]}>
            <Icon name="menu" size={24} color={colorScheme === 'dark' ? '#fff' : colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Header with large image - now scrolls with content */}
        {spot.photos && spot.photos.length > 0 && (
          <View style={styles.imageHeader}>
            <Image source={{ uri: spot.photos[0] }} style={styles.headerImage} resizeMode="cover" />
            <View style={styles.imageOverlay} />
          </View>
        )}

        <View style={[styles.contentSection, { backgroundColor: colors.background }]}>

          {/* Title */}
          {spot.name && (
            <Text style={[textStyles.heading, { color: colors.text, marginTop: spacing.md }]}>
              {spot.name}
            </Text>
          )}

          {/* Metadata Row: Chip | Distance | Rating */}
          <View style={styles.metadataRow}>
            {/* Chip de taxonomía */}
            <View style={[styles.typeTag, { backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }]}>
              <Text style={[styles.chipText, { color: colorScheme === 'dark' ? '#fff' : colors.text }]}>
                {getSpotTypeLabel(spot.type).toUpperCase()}
              </Text>
            </View>
            
            {/* Separador vertical */}
            {distanceText && (
              <>
                <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
                
                {/* Distancia con icono */}
                <TouchableOpacity onPress={handleDistancePress} activeOpacity={0.7} style={styles.metadataItem}>
                  <Icon name="map" size={14} color={colors.icon} />
                  <Text style={[styles.metadataText, { color: colors.icon, marginLeft: spacing.xs / 2 }]}>
                    {distanceText}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            {/* Separador vertical */}
            <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]} />
            
            {/* Calificación */}
            <View style={styles.metadataItem}>
              <Icon name="star" size={14} color="#FFD700" />
              <Text style={[styles.metadataText, { color: colors.text, marginLeft: spacing.xs / 2 }]}>
                4.8 (128)
              </Text>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            onPress={handleStartFlow}
            style={[styles.primaryButton, { backgroundColor: colors.tint }]}
            activeOpacity={0.8}>
            <Icon name="play" size={20} color="#fff" />
            <Text style={[textStyles.bodyMedium, { color: '#fff', marginLeft: spacing.xs }]}>
              Start from here
            </Text>
          </TouchableOpacity>
          <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs, marginBottom: spacing.md }]}>
            We&apos;ll build the path as you move.
          </Text>

          {/* Why it matters section */}
          {spot.description && (
            <View style={styles.section}>
              <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm }]}>
                Why it matters
              </Text>
              <Text style={[textStyles.body, { color: colors.text }]}>{spot.description}</Text>
            </View>
          )}

          {/* Cultural context section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[textStyles.heading3, { color: colors.text }]}>Cultural context</Text>
              <Icon name="chevron-down" size={20} color={colors.icon} />
            </View>
            <Text style={[textStyles.body, { color: colors.text, marginTop: spacing.sm }]}>
              This place reflects the architectural evolution from Gothic to Renaissance styles.
            </Text>
          </View>

          {/* Location on map section */}
          <View style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm }]}>
              Location
            </Text>
            <View style={styles.mapContainer}>
              <SimpleMapView
                spots={[spot]}
                onSpotPress={() => {}}
                initialRegion={{
                  latitude: spot.location.latitude,
                  longitude: spot.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              />
            </View>
          </View>

          {/* How to visit section */}
          <View style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm }]}>
              How to visit
            </Text>
            <View style={[styles.howToVisitCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
              <Icon name="sun" size={24} color={colors.tint} />
              <Text style={[textStyles.body, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
                Visit early morning (8–10 AM) for soft light and fewer crowds.
              </Text>
            </View>
            <View style={[styles.howToVisitCard, { marginTop: spacing.sm, backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
              <Icon name="camera" size={24} color={colors.tint} />
              <Text style={[textStyles.body, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
                Allowed everywhere, but tripods require a special permit.
              </Text>
            </View>
          </View>

          {/* Plan info section */}
          <View style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm }]}>
              Plan info
            </Text>
            <View style={styles.planInfoGrid}>
              {hoursText && (
                <View style={[styles.planInfoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                  <Icon name="clock" size={24} color={colors.icon} />
                  <View style={styles.infoCardContent}>
                    <Text style={[textStyles.label, { color: colors.text }]}>HOURS</Text>
                    <Text style={[textStyles.body, { color: colors.text }]}>{hoursText}</Text>
                    <Text style={[textStyles.caption, { color: colors.tint, marginTop: spacing.xs / 2 }]}>
                      Open now
                    </Text>
                  </View>
                </View>
              )}
              {costText && (
                <View style={[styles.planInfoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                  <Icon name="money" size={24} color={colors.icon} />
                  <View style={styles.infoCardContent}>
                    <Text style={[textStyles.label, { color: colors.text }]}>COST</Text>
                    <Text style={[textStyles.body, { color: colors.text }]}>{costText}</Text>
                  </View>
                </View>
              )}
              <View style={[styles.planInfoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <Icon name="paw" size={24} color={colors.icon} />
                <View style={styles.infoCardContent}>
                  <Text style={[textStyles.label, { color: colors.text }]}>RESTRICTIONS</Text>
                  <Text style={[textStyles.body, { color: colors.text }]}>No pets</Text>
                </View>
              </View>
              <View style={[styles.planInfoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <Icon name="accessibility" size={24} color={colors.icon} />
                <View style={styles.infoCardContent}>
                  <Text style={[textStyles.label, { color: colors.text }]}>ACCESSIBILITY</Text>
                  <Text style={[textStyles.body, { color: colors.text }]}>Unknown</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom padding */}
          <View style={{ height: spacing['2xl'] }} />
        </View>
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={handleMenuClose}>
        <Pressable style={styles.menuOverlay} onPress={handleMenuClose}>
          <GlassView
            style={styles.menuContainer}
            shadowLevel="medium"
            enableGlow={true}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSuggestEdit}
              activeOpacity={0.7}>
              <Icon name="edit" size={20} color={colors.text} />
              <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.sm }]}>
                Suggest an edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleReport}
              activeOpacity={0.7}>
              <Icon name="report" size={20} color={colors.text} />
              <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.sm }]}>
                Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePlaceNoLongerExists}
              activeOpacity={0.7}>
              <Icon name="delete" size={20} color={colors.text} />
              <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.sm }]}>
                This place no longer exists
              </Text>
            </TouchableOpacity>
          </GlassView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  backButton: {
    marginTop: spacing.md,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20, // 50% para círculo perfecto
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonsRight: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  imageHeader: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentSection: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 16,
    marginHorizontal: spacing.sm,
  },
  typeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  chipText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '500',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Múltiplo de 8px, convención
    paddingVertical: spacing.md,
    borderRadius: borderTokens.card,
    marginTop: spacing.md,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  howToVisitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderTokens.card,
    width: '100%',
  },
  planInfoCard: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderTokens.card,
    width: '48%',
    marginBottom: spacing.sm,
  },
  infoCardContent: {
    flex: 1,
    marginTop: spacing.sm,
    alignItems: 'center',
    width: '100%',
  },
  planInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mapContainer: {
    height: 200, // Múltiplo de 8px (25 * 8)
    borderRadius: borderTokens.card,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50, // Espacio para el header (40px button + 10px padding)
    paddingRight: spacing.md,
  },
  menuContainer: {
    borderRadius: borderTokens.card,
    paddingVertical: spacing.xs,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});

