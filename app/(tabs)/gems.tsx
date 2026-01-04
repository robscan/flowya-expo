/**
 * Gems Screen
 * Scope 9: Gems Screen - Lo que está brillando ahora
 * 
 * Principios:
 * - Layout tipo feed/cards
 * - Header con estilo glass
 * - Spots destacados (recientes, populares, sugeridos)
 * - Cards con efecto glass para cada gem
 * - Paths sugeridos (como contexto secundario, según definición: como contexto no foco)
 * - El foco siempre está en Spots, no en recorrer Paths completos
 */

import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

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
import { getAllGems, getSuggestedPaths } from '@/utils/gemsLogic';
import { GemsSpotCard } from '@/components/GemsSpotCard';
import { GemsPathCard } from '@/components/GemsPathCard';
import { SpotDetailSheet } from '@/components/SpotDetailSheet';
import { Spot } from '@/data/spots';

export default function GemsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false);

  const { spots, isLoading: spotsLoading } = useSpot();
  const { paths, isLoading: pathsLoading } = usePath();
  const { likedSpots, savedSpots } = useSaved();
  const { startFlow } = useFlow();

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
    setSelectedSpot(spot);
    setIsDetailSheetVisible(true);
  };

  const handleCloseDetailSheet = () => {
    setIsDetailSheetVisible(false);
    setSelectedSpot(null);
  };

  // Renderizar sección de Spots
  const renderSpotSection = (title: string, gemSpots: typeof gems.featured, showIfEmpty: boolean = false) => {
    if (gemSpots.length === 0 && !showIfEmpty) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
          {title}
        </Text>
        {gemSpots.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[textStyles.body, { color: colors.icon }]}>
              No hay {title.toLowerCase()} disponibles
            </Text>
          </View>
        ) : (
          gemSpots.map((gemSpot) => (
            <GemsSpotCard
              key={gemSpot.spot.id}
              gemSpot={gemSpot}
              onPress={() => handleSpotPress(gemSpot.spot)}
            />
          ))
        )}
      </View>
    );
  };

  // Renderizar sección de Paths sugeridos
  const renderSuggestedPaths = () => {
    if (suggestedPaths.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
          Paths sugeridos
        </Text>
        {suggestedPaths.map((gemPath) => (
          <GemsPathCard
            key={gemPath.path.id}
            gemPath={gemPath}
            onPress={() => {
              // Iniciar Flow desde Path sugerido
              startFlow(gemPath.path.id);
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con estilo glass */}
      <GlassView style={styles.header} intensity="light" opacity="medium">
        <View style={styles.headerContent}>
          <Text style={[textStyles.heading3, { color: colors.text }]}>Gems</Text>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="profile" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
          Lo que está brillando ahora
        </Text>
      </GlassView>

      {/* Contenido */}
      {isLoading ? (
        <View style={styles.loadingState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Cargando...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderSpotSection('Destacados', gems.featured)}
          {renderSpotSection('Recientes', gems.recent)}
          {renderSpotSection('Sugeridos', gems.suggested)}
          {renderSuggestedPaths()}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  emptyState: {
    padding: spacing.md,
    alignItems: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
