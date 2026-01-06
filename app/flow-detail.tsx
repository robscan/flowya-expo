/**
 * Flow Detail Screen
 * Scope 13: Flow Detail (Path Detail) - Pantalla completa
 * 
 * Based on Product Definition FLOWYA V1.0
 * Muestra información detallada de un Flow (Path) con opción de iniciar Flow
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Dimensions,
} from 'react-native';
import * as Location from 'expo-location';

import { FlowSpotCard } from '@/components/FlowSpotCard';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles, fontSize, lineHeight, fontFamilyMedium } from '@/constants/typography';
import { borderRadius } from '@/constants/borders';
import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { useSaved } from '@/contexts/SavedContext';
import { getFlowSpots, Flow, calculateEstimatedDuration } from '@/data/flows';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateDistanceToSpot, calculatePathDistance } from '@/utils/distance';
import { getMovementModeLabel, getMovementModeBackgroundColor, getMovementModeTextColor } from '@/constants/movementMode';

export default function FlowDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getFlowById } = usePath();
  const { spots } = useSpot();
  const { startFlow } = useFlow();
  const { isFlowSaved, toggleSaveFlow } = useSaved();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get flow from context
  const flow = id ? getFlowById(id) : null;

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

  // If no flow, redirect back
  useEffect(() => {
    if (!flow) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [flow, router]);

  if (!flow) {
    return null;
  }

  const flowSpots = getFlowSpots(flow, spots);
  const isSaved = isFlowSaved(flow.id);
  const estimatedDuration = calculateEstimatedDuration(flowSpots.length, flow.movementMode);
  const totalDistance = calculatePathDistance(flow, spots);

  // Obtener todas las fotos de los spots del flow
  const getAllFlowPhotos = React.useMemo((): string[] => {
    const allPhotos: string[] = [];
    flowSpots.forEach((spot) => {
      if (spot.photos && spot.photos.length > 0) {
        allPhotos.push(...spot.photos);
      }
    });
    return allPhotos;
  }, [flowSpots]);

  // Seleccionar una foto aleatoria para la portada
  const [coverImageIndex, setCoverImageIndex] = React.useState(() => {
    if (getAllFlowPhotos.length === 0) return -1;
    return Math.floor(Math.random() * getAllFlowPhotos.length);
  });

  // Rotación automática de imágenes (cada 5 segundos)
  React.useEffect(() => {
    if (getAllFlowPhotos.length <= 1) return;
    
    const interval = setInterval(() => {
      setCoverImageIndex((prev) => (prev + 1) % getAllFlowPhotos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [getAllFlowPhotos.length]);

  // Calculate distance to first spot
  const distanceToStart = userLocation && flowSpots.length > 0
    ? calculateDistanceToSpot(userLocation, flowSpots[0].location)
    : null;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleLike = () => {
    // TODO: Implement like functionality for flows if needed
    console.log('Like flow:', flow.id);
  };

  const handleSave = () => {
    toggleSaveFlow(flow.id);
  };

  const handleShare = async () => {
    try {
      const shareUrl = `flowya.app/flow-detail?id=${flow.id}`;
      const shareMessage = `Check out "${flow.title}" on FLOWYA! ${shareUrl}`;
      
      await Share.share({
        message: shareMessage,
        title: flow.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Couldn\'t share. Try again.');
    }
  };

  const handleStartFlow = () => {
    // Validar ubicación antes de iniciar flow
    if (!userLocation) {
      Alert.alert(
        'Location needed',
        'Enable location for guided navigation. Flow works without it.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue without location', 
            onPress: () => {
              startFlow(flow.id);
              router.back();
            }
          },
        ]
      );
      return;
    }
    
    startFlow(flow.id);
    router.back();
  };

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Format distance to start
  const formatDistanceToStart = (meters: number | null): string | null => {
    if (!meters) return null;
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)} km away`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header Sticky */}
      <View style={[styles.header, { borderBottomColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleBack}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleLike}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon
                name="like"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="share" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon
                name="bookmark"
                size={24}
                color={isSaved ? colors.tint : colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Cover image */}
        {coverImageIndex >= 0 && getAllFlowPhotos[coverImageIndex] ? (
          <View style={styles.coverImageContainer}>
            <Image source={{ uri: getAllFlowPhotos[coverImageIndex] }} style={styles.coverImage} resizeMode="cover" />
          </View>
        ) : (
          <View style={[styles.coverImageContainer, styles.coverImagePlaceholder, { backgroundColor: colors.icon + '20' }]}>
            <Icon name="map" size={48} color={colors.icon} />
          </View>
        )}

        {/* Tags y descripción */}
        <View style={styles.section}>
          <View style={styles.tagsContainer}>
            <View
              style={[
                styles.movementModeTag,
                {
                  backgroundColor: getMovementModeBackgroundColor(flow.movementMode, colorScheme ?? 'light'),
                },
              ]}>
              <Text
                style={[
                  styles.tagText,
                  { color: getMovementModeTextColor(flow.movementMode, colorScheme ?? 'light') },
                ]}>
                {getMovementModeLabel(flow.movementMode).toUpperCase()}
              </Text>
            </View>
          </View>
          {flow.description && (
            <Text style={[textStyles.body, { color: colors.text, marginTop: spacing.sm }]}>
              {flow.description}
            </Text>
          )}
        </View>

        {/* Métricas */}
        <View style={styles.section}>
          <View style={styles.metricsContainer}>
            <View style={styles.metric}>
              <Icon name="clock" size={20} color={colors.icon} />
              <Text style={[textStyles.bodyMedium, { color: colors.text, marginTop: spacing.xs / 2 }]}>
                {formatDuration(estimatedDuration)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Icon name="map" size={20} color={colors.icon} />
              <Text style={[textStyles.bodyMedium, { color: colors.text, marginTop: spacing.xs / 2 }]}>
                {formatDistance(totalDistance)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
                {flowSpots.length} {flowSpots.length === 1 ? 'spot' : 'spots'}
              </Text>
            </View>
          </View>
          {distanceToStart && (
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.sm }]}>
              {formatDistanceToStart(distanceToStart)}
            </Text>
          )}
        </View>

        {/* Botón Start Flow */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={handleStartFlow}
            style={[
              styles.startButton, 
              { 
                backgroundColor: userLocation ? colors.tint : colors.icon + '40',
                opacity: userLocation ? 1 : 0.6,
              }
            ]}
            activeOpacity={0.8}
            disabled={!userLocation}>
            <Icon name="play" size={24} color="#fff" />
            <Text style={[textStyles.bodyMedium, { color: '#fff', marginLeft: spacing.xs }]}>
              Start Flow
            </Text>
          </TouchableOpacity>
          {!userLocation && (
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs, textAlign: 'center' }]}>
              Enable location for better experience
            </Text>
          )}
        </View>

        {/* Lista de spots */}
        <View style={styles.section}>
          <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
            Places in this flow
          </Text>
          <View style={styles.spotsList}>
            {flowSpots.map((spot, index) => {
              const distance = userLocation
                ? calculateDistanceToSpot(userLocation, spot.location)
                : undefined;
              return (
                <FlowSpotCard
                  key={spot.id}
                  spot={spot}
                  index={index}
                  distance={distance || undefined}
                  isActive={false}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  coverImageContainer: {
    width: '100%',
    height: Dimensions.get('window').height * 0.4, // 40% de la altura de la pantalla (igual que SpotDetail)
    marginBottom: spacing.md,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  movementModeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '500',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  metric: {
    alignItems: 'flex-start',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  spotsList: {
    gap: spacing.sm,
  },
});

