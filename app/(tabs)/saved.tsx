/**
 * Saved Screen
 * Scope 11: Saved Screen - Memoria personal del usuario
 * 
 * Principios de diseño:
 * - Header: "Saved" con subtítulo "Your personal collection"
 * - Tabs internos: Paths, Liked
 * - Spots guardados, Spots con 👍, Paths guardados, Paths recorridos
 * - Timeline ligero de actividad
 * - Cards con estilo glass
 */

import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { SavedSpotList } from '@/components/SavedSpotList';
import { SavedPathList } from '@/components/SavedPathList';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { SpotDetailSheet } from '@/components/SpotDetailSheet';
import { useSpot } from '@/contexts/SpotContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useFlow } from '@/contexts/FlowContext';
import { Spot } from '@/data/spots';
import { Path } from '@/data/paths';

type SavedTab = 'paths' | 'liked' | 'timeline';

export default function SavedScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<SavedTab>('paths');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false);

  const { spots, isLoading: spotsLoading, getSpotById } = useSpot();
  const { paths, isLoading: pathsLoading, getPathById } = usePath();
  const { savedSpots, likedSpots, savedPaths, visitedPaths, timeline, isLoading: savedLoading } = useSaved();
  const { startFlow } = useFlow();

  const isLoading = spotsLoading || pathsLoading || savedLoading;

  // Obtener spots guardados y con like
  const savedSpotsData = spots.filter((spot) => savedSpots.includes(spot.id));
  const likedSpotsData = spots.filter((spot) => likedSpots.includes(spot.id));
  
  // Obtener paths guardados y visitados
  const savedPathsData = paths.filter((path) => savedPaths.includes(path.id));
  const visitedPathsData = paths.filter((path) => visitedPaths.includes(path.id));

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

  // Manejar selección de Path
  const handlePathPress = (path: Path) => {
    // Navegar a detalles del path o iniciar flow
    // Por ahora, iniciar flow directamente
    startFlow(path.id);
  };

  const handleStartPath = (path: Path) => {
    startFlow(path.id);
  };

  // Renderizar contenido según tab activo
  const renderContent = () => {
    if (activeTab === 'paths') {
      return (
        <>
          <View style={styles.section}>
            <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
              Paths guardados
            </Text>
            <SavedPathList
              paths={savedPathsData}
              allSpots={spots}
              onPathPress={handlePathPress}
              onStartPath={handleStartPath}
              emptyMessage="No hay paths guardados"
            />
          </View>

          <View style={styles.section}>
            <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
              Paths recorridos
            </Text>
            <SavedPathList
              paths={visitedPathsData}
              allSpots={spots}
              onPathPress={handlePathPress}
              onStartPath={handleStartPath}
              emptyMessage="No hay paths recorridos"
            />
          </View>
        </>
      );
    }

    if (activeTab === 'liked') {
      return (
        <>
          <View style={styles.section}>
            <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
              Spots guardados
            </Text>
            <SavedSpotList
              spots={savedSpotsData}
              onSpotPress={handleSpotPress}
              emptyMessage="No hay spots guardados"
            />
          </View>

          <View style={styles.section}>
            <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
              Spots que me gustaron 👍
            </Text>
            <SavedSpotList
              spots={likedSpotsData}
              onSpotPress={handleSpotPress}
              emptyMessage="No hay spots con like"
            />
          </View>
        </>
      );
    }

    if (activeTab === 'timeline') {
      return (
        <View style={styles.section}>
          <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
            Actividad reciente
          </Text>
          <ActivityTimeline entries={timeline} limit={20} />
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con estilo glass */}
      <GlassView style={styles.header} intensity="light" opacity="medium">
        <View style={styles.headerContent}>
          <View>
            <Text style={[textStyles.heading3, { color: colors.text }]}>Saved</Text>
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
              Your personal collection
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="profile" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </GlassView>

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
            activeTab === 'paths' && styles.tabActive,
            activeTab === 'paths' && { borderBottomColor: colors.tint },
          ]}
          onPress={() => setActiveTab('paths')}
          activeOpacity={0.7}>
          <Text
            style={[
              textStyles.bodyMedium,
              { color: activeTab === 'paths' ? colors.tint : colors.icon },
            ]}>
            Paths
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'liked' && styles.tabActive,
            activeTab === 'liked' && { borderBottomColor: colors.tint },
          ]}
          onPress={() => setActiveTab('liked')}
          activeOpacity={0.7}>
          <Text
            style={[
              textStyles.bodyMedium,
              { color: activeTab === 'liked' ? colors.tint : colors.icon },
            ]}>
            Liked
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'timeline' && styles.tabActive,
            activeTab === 'timeline' && { borderBottomColor: colors.tint },
          ]}
          onPress={() => setActiveTab('timeline')}
          activeOpacity={0.7}>
          <Text
            style={[
              textStyles.bodyMedium,
              { color: activeTab === 'timeline' ? colors.tint : colors.icon },
            ]}>
            Timeline
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      {isLoading ? (
        <View style={styles.loadingState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Cargando...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderContent()}
        </ScrollView>
      )}

      {/* Spot Detail Sheet */}
      <SpotDetailSheet
        spot={selectedSpot}
        visible={isDetailSheetVisible}
        onClose={handleCloseDetailSheet}
      />
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
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
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
  section: {
    marginBottom: spacing.xl,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
