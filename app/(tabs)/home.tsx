/**
 * Home Screen con tabs internos
 * Scope 5: Home - Explore Tab
 * 
 * Home · Explore: "¿Qué puedo hacer aquí y ahora?"
 * - Spots cercanos
 * - Paths sugeridos (secundarios)
 * - Recomendaciones basadas en ubicación, tiempo, preferencias
 * 
 * Home · Map: "Quiero entender este lugar, ahora o después"
 * - Mapa libre
 * - Spots visibles (incluso lejanos)
 * - Acciones: ver Spot, guardar Spot, crear Spot, ajustar ubicación
 */

import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { SpotCard } from '@/components/SpotCard';
import { SpotDetailSheet } from '@/components/SpotDetailSheet';
import { SimpleMapView } from '@/components/SimpleMapView';
import { CreateSpotModal } from '@/components/CreateSpotModal';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';

type HomeTab = 'explore' | 'map';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HomeTab>('explore');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false);
  const [createSpotLocation, setCreateSpotLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isCreateSpotModalVisible, setIsCreateSpotModalVisible] = useState(false);
  const colors = Colors[colorScheme ?? 'light'];

  const { spots, isLoading, createSpot } = useSpot();

  // Header con icono Profile
  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  // Manejar selección de Spot
  const handleSpotPress = (spot: Spot) => {
    setSelectedSpot(spot);
    setIsDetailSheetVisible(true);
  };

  const handleCloseDetailSheet = () => {
    setIsDetailSheetVisible(false);
    setSelectedSpot(null);
  };

  // Manejar creación de Spot desde mapa
  const handleMapLongPress = (location: { latitude: number; longitude: number }) => {
    setCreateSpotLocation(location);
    setIsCreateSpotModalVisible(true);
  };

  const handleCreateSpot = (spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>) => {
    createSpot(spotData);
    setIsCreateSpotModalVisible(false);
    setCreateSpotLocation(null);
  };

  const handleCloseCreateSpotModal = () => {
    setIsCreateSpotModalVisible(false);
    setCreateSpotLocation(null);
  };

  // Renderizar Explore tab
  const renderExplore = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Cargando...</Text>
        </View>
      );
    }

    if (spots.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={[textStyles.body, { color: colors.text, marginBottom: spacing.sm }]}>
            ¿Qué puedo hacer aquí y ahora?
          </Text>
          <Text style={[textStyles.caption, { color: colors.icon }]}>
            Spots cercanos, Paths sugeridos y recomendaciones aparecerán aquí.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.exploreContent}>
        {spots.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            onPress={() => handleSpotPress(spot)}
            onLike={() => {
              // Acción adicional si es necesaria
            }}
            onSave={() => {
              // Acción adicional si es necesaria
            }}
          />
        ))}
      </View>
    );
  };

  // Renderizar Map tab
  const renderMap = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Cargando...</Text>
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con icono Profile */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor:
              colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        ]}>
        <View style={styles.headerContent}>
          <Text style={[textStyles.heading3, { color: colors.text }]}>Home</Text>
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

      {/* Contenido de tabs */}
      {activeTab === 'explore' ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderExplore()}
        </ScrollView>
      ) : (
        renderMap()
      )}

      {/* Spot Detail Sheet */}
      <SpotDetailSheet
        spot={selectedSpot}
        visible={isDetailSheetVisible}
        onClose={handleCloseDetailSheet}
      />

      {/* Create Spot Modal */}
      <CreateSpotModal
        visible={isCreateSpotModalVisible}
        location={createSpotLocation}
        onClose={handleCloseCreateSpotModal}
        onCreate={handleCreateSpot}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
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
    // Estilos adicionales aplicados inline
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  exploreContent: {
    gap: spacing.md,
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
});
