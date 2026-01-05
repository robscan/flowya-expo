/**
 * Create Spot Sheet Component
 * Scope 8: Home - Map Tab - Create Spot from Map
 * 
 * Design principles:
 * - Sheet/drawer style (not modal)
 * - 4 sections: Photo, Location, Name/Description, Type
 * - Location search by address
 * - Required photo
 * - Success message after sending
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Pressable,
  Dimensions,
} from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

import { Spot, SpotType } from '@/data/spots';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { SimpleMapView } from '@/components/SimpleMapView';

interface CreateSpotModalProps {
  visible: boolean;
  location: { latitude: number; longitude: number } | null;
  userLocation: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onCreate: (spot: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const SPOT_TYPES: SpotType[] = [
  'beach',
  'cafe',
  'viewpoint',
  'museum',
  'restaurant',
  'park',
  'monument',
  'market',
  'other',
];

function getSpotTypeLabel(type: SpotType): string {
  const labels: Record<SpotType, string> = {
    beach: 'Beach',
    cafe: 'Café',
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function CreateSpotModal({ visible, location, userLocation, onClose, onCreate }: CreateSpotModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpotType>('other');
  const [photo, setPhoto] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addressSearch, setAddressSearch] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Initialize location: use userLocation if available, otherwise use provided location
  useEffect(() => {
    if (visible) {
      const initialLocation = userLocation || location;
      if (initialLocation) {
        setCurrentLocation(initialLocation);
      }
    }
  }, [visible, userLocation, location]);

  // Reset form when modal closes (but not if showing success message)
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7807ebbf-84f7-465d-ad24-4eb47c053dcc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateSpotModal.tsx:useEffect',message:'Modal visibility changed',data:{visible,showSuccessMessage},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    
    if (!visible && !showSuccessMessage) {
      setName('');
      setDescription('');
      setType('other');
      setPhoto(null);
      setAddressSearch('');
      setShowSuccessMessage(false);
    }
  }, [visible, showSuccessMessage]);

  // Search address and update location
  const handleSearchAddress = async () => {
    if (!addressSearch.trim()) return;

    setIsSearchingAddress(true);
    try {
      const results = await Location.geocodeAsync(addressSearch);
      if (results.length > 0) {
        const firstResult = results[0];
        setCurrentLocation({
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
        });
        setAddressSearch('');
      } else {
        Alert.alert('Not found', 'Could not find that address. Please try a different search.');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      Alert.alert('Error', 'Failed to search address. Please try again.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Handle location change from map
  const handleLocationChange = (newLocation: { latitude: number; longitude: number }) => {
    setCurrentLocation(newLocation);
  };

  // Handle photo selection
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your photos to add a spot image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Handle send
  const handleSend = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7807ebbf-84f7-465d-ad24-4eb47c053dcc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateSpotModal.tsx:handleSend',message:'handleSend called',data:{hasLocation:!!currentLocation,hasPhoto:!!photo},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    if (!currentLocation) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    if (!photo) {
      Alert.alert('Photo required', 'Please add a photo of the place');
      return;
    }

    const newSpot: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name || undefined,
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        adjustable: true,
      },
      photos: [photo],
      description: description || undefined,
      type,
    };

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7807ebbf-84f7-465d-ad24-4eb47c053dcc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateSpotModal.tsx:handleSend',message:'Before setShowSuccessMessage',data:{spotName:newSpot.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Show success message first
    setShowSuccessMessage(true);
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7807ebbf-84f7-465d-ad24-4eb47c053dcc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateSpotModal.tsx:handleSend',message:'After setShowSuccessMessage(true)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // Call onCreate after a brief delay to ensure state update renders
    setTimeout(() => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7807ebbf-84f7-465d-ad24-4eb47c053dcc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateSpotModal.tsx:handleSend',message:'Calling onCreate after delay',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      onCreate(newSpot);
    }, 100);
    
    // Close after showing success message
    setTimeout(() => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7807ebbf-84f7-465d-ad24-4eb47c053dcc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateSpotModal.tsx:handleSend',message:'setTimeout callback executing handleClose',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setType('other');
    setPhoto(null);
    setAddressSearch('');
    setShowSuccessMessage(false);
    onClose();
  };

  if (!location && !userLocation) {
    return null;
  }

  // Success message overlay
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7807ebbf-84f7-465d-ad24-4eb47c053dcc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateSpotModal.tsx:render',message:'Checking showSuccessMessage',data:{showSuccessMessage,visible},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  
  if (showSuccessMessage) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7807ebbf-84f7-465d-ad24-4eb47c053dcc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CreateSpotModal.tsx:render',message:'Rendering success message modal',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <GlassView 
            style={styles.successModal} 
            intensity="strong" 
            opacity="strong"
            shadowLevel="strong"
            enableGlow={true}
            useGrayBackground={true}
          >
            <Icon name="like" size={48} color={colors.tint} />
            <Text style={[textStyles.heading4, { color: colors.text, marginTop: spacing.md, textAlign: 'center' }]}>
              Thanks for sharing
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, textAlign: 'center' }]}>
              Your spot is being reviewed and will be available soon.
            </Text>
          </GlassView>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
      {/* Background with blur */}
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <GlassView style={StyleSheet.absoluteFill} intensity="medium" opacity="light" />
      </Pressable>

      {/* Sheet */}
      <View style={styles.sheetContainer} pointerEvents="box-none">
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.sheet}>
          <GlassView 
            style={styles.sheetGlass} 
            intensity="strong" 
            opacity="strong"
            shadowLevel="strong"
            enableGlow={true}
            useGrayBackground={true}
          >
            {/* Handle bar */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.icon + '40' }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[textStyles.heading3, { color: colors.text }]}>Create Spot</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={iconTouchableContainer.base}
                activeOpacity={0.7}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Section 1: Photo */}
              <View style={styles.section}>
                <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
                  Photo <Text style={{ color: colors.tint }}>*</Text>
                </Text>
                {photo ? (
                  <View style={styles.photoContainer}>
                    <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => setPhoto(null)}
                      activeOpacity={0.7}>
                      <Icon name="close" size={20} color={colors.background} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.photoPlaceholder, { backgroundColor: colors.icon + '10', borderColor: colors.icon + '30' }]}
                    onPress={handlePickImage}
                    activeOpacity={0.7}>
                    <Icon name="add" size={32} color={colors.icon} />
                    <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
                      Add photo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Section 2: Location */}
              <View style={styles.section}>
                <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
                  Location
                </Text>
                <Text style={[textStyles.caption, { color: colors.text, marginBottom: spacing.sm }]}>
                  Search by address or adjust the pin on the map
                </Text>
                
                {/* Address search */}
                <View style={styles.addressSearchContainer}>
                  <TextInput
                    style={[
                      styles.addressInput,
                      { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon + '30' },
                    ]}
                    value={addressSearch}
                    onChangeText={setAddressSearch}
                    placeholder="Search by address"
                    placeholderTextColor={colors.icon}
                    onSubmitEditing={handleSearchAddress}
                  />
                  <TouchableOpacity
                    style={[styles.searchButton, { backgroundColor: colors.tint }]}
                    onPress={handleSearchAddress}
                    disabled={isSearchingAddress || !addressSearch.trim()}
                    activeOpacity={0.7}>
                    {isSearchingAddress ? (
                      <ActivityIndicator size="small" color={colors.background} />
                    ) : (
                      <Icon name="search" size={20} color={colors.background} />
                    )}
                  </TouchableOpacity>
                </View>

                {/* Map */}
                {currentLocation && (
                  <>
                    <View style={styles.mapContainer}>
                      <SimpleMapView
                        spots={[{
                          id: 'temp-spot',
                          name: 'New Spot',
                          location: currentLocation,
                          photos: [],
                          type: 'other',
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        }]}
                        onSpotPress={() => {}}
                        onLongPress={handleLocationChange}
                        initialRegion={{
                          latitude: currentLocation.latitude,
                          longitude: currentLocation.longitude,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                      />
                    </View>
                    <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
                      {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </Text>
                  </>
                )}
              </View>

              {/* Section 3: Name and Description */}
              <View style={styles.section}>
                <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
                  Name
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon + '30' }]}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter place name"
                  placeholderTextColor={colors.icon}
                />
              </View>

              <View style={styles.section}>
                <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
                  Description
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon + '30' },
                  ]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Brief description"
                  placeholderTextColor={colors.icon}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Section 4: Type */}
              <View style={styles.section}>
                <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
                  Type
                </Text>
                <View style={styles.typeContainer}>
                  {SPOT_TYPES.map((spotType) => (
                    <TouchableOpacity
                      key={spotType}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: type === spotType ? colors.tint + '20' : colors.icon + '10',
                          borderColor: type === spotType ? colors.tint : 'transparent',
                        },
                      ]}
                      onPress={() => setType(spotType)}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          textStyles.caption,
                          { color: type === spotType ? colors.tint : colors.text },
                        ]}>
                        {getSpotTypeLabel(spotType)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
                onPress={handleClose}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { backgroundColor: photo ? colors.tint : colors.icon + '40' },
                ]}
                onPress={handleSend}
                disabled={!photo}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: photo ? colors.background : colors.icon }]}>
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetGlass: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  successModal: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  addressSearchContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  addressInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 16,
    minHeight: 48,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  typeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  sendButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
