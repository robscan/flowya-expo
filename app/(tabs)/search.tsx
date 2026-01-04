/**
 * Search Screen
 * Scope 10: Search Screen - Búsqueda contextual de Spots y Paths
 * 
 * Principios de diseño:
 * - Layout: Columna única, scroll natural, mobile-first
 * - Header con barra de búsqueda prominente (inspiración Apple Music)
 * - Barra de búsqueda con estilo glass, placeholder claro
 * - Sugerencias mientras el usuario escribe
 * - Resultados organizados por relevancia y cercanía
 * - Opción de crear Spot si no se encuentra
 */

import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { SearchBar } from '@/components/SearchBar';
import { SearchSuggestion } from '@/components/SearchSuggestion';
import { SearchResultCard } from '@/components/SearchResultCard';
import { CreateSpotModal } from '@/components/CreateSpotModal';
import { SpotDetailSheet } from '@/components/SpotDetailSheet';
import { useSpot } from '@/contexts/SpotContext';
import { usePath } from '@/contexts/PathContext';
import { useFlow } from '@/contexts/FlowContext';
import { searchAll, getSuggestions, SearchResult } from '@/utils/searchLogic';
import { Spot } from '@/data/spots';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isDetailSheetVisible, setIsDetailSheetVisible] = useState(false);
  const [isCreateSpotModalVisible, setIsCreateSpotModalVisible] = useState(false);
  const [createSpotLocation, setCreateSpotLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { spots, isLoading: spotsLoading, createSpot, getSpotById } = useSpot();
  const { paths, isLoading: pathsLoading, getPathById } = usePath();
  const { startFlow } = useFlow();
  const isLoading = spotsLoading || pathsLoading;

  // Calcular sugerencias mientras escribe
  const suggestions = useMemo(() => {
    if (!isSearchFocused || searchQuery.length < 2) {
      return [];
    }
    return getSuggestions(spots, paths, searchQuery, 5);
  }, [searchQuery, spots, paths, isSearchFocused]);

  // Calcular resultados de búsqueda
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) {
      return { spots: [], paths: [] };
    }
    return searchAll(spots, paths, searchQuery, {
      spotLimit: 20,
      pathLimit: 10,
    });
  }, [searchQuery, spots, paths]);

  const hasResults = searchResults.spots.length > 0 || searchResults.paths.length > 0;
  const showSuggestions = isSearchFocused && suggestions.length > 0 && !hasResults;
  const showResults = searchQuery.trim().length >= 2 && hasResults;
  const showNoResults = searchQuery.trim().length >= 2 && !hasResults && !isSearchFocused;
  const showEmpty = searchQuery.trim().length === 0 && !isSearchFocused;

  // Manejar selección de sugerencia
  const handleSuggestionPress = (suggestion: typeof suggestions[0]) => {
    setSearchQuery(suggestion.name);
    setIsSearchFocused(false);
    Keyboard.dismiss();
  };

  // Manejar selección de Spot desde resultados
  const handleSpotPress = (spotId: string) => {
    const spot = getSpotById(spotId);
    if (spot) {
      setSelectedSpot(spot);
      setIsDetailSheetVisible(true);
    }
  };

  // Manejar selección de Path desde resultados
  const handlePathPress = (pathId: string) => {
    startFlow(pathId);
  };

  const handleCloseDetailSheet = () => {
    setIsDetailSheetVisible(false);
    setSelectedSpot(null);
  };

  // Manejar creación de Spot desde búsqueda
  const handleCreateSpotFromSearch = () => {
    // Usar ubicación por defecto (Lima, Perú) - en producción vendría de geolocalización
    setCreateSpotLocation({
      latitude: -12.0464,
      longitude: -77.0428,
    });
    setIsCreateSpotModalVisible(true);
  };

  const handleCreateSpot = (spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>) => {
    createSpot(spotData);
    setIsCreateSpotModalVisible(false);
    setCreateSpotLocation(null);
    setSearchQuery(''); // Limpiar búsqueda después de crear
  };

  const handleCloseCreateSpotModal = () => {
    setIsCreateSpotModalVisible(false);
    setCreateSpotLocation(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con barra de búsqueda prominente */}
      <GlassView style={styles.header} intensity="light" opacity="medium">
        <View style={styles.headerContent}>
          <Text style={[textStyles.heading3, { color: colors.text }]}>Search</Text>
        </View>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar Spots y Paths..."
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
      </GlassView>

      {/* Contenido */}
      {isLoading ? (
        <View style={styles.loadingState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Cargando...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Sugerencias */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.sm }]}>
                Sugerencias
              </Text>
              {suggestions.map((suggestion) => (
                <SearchSuggestion
                  key={`${suggestion.type}-${suggestion.id}`}
                  name={suggestion.name}
                  type={suggestion.type}
                  onPress={() => handleSuggestionPress(suggestion)}
                />
              ))}
            </View>
          )}

          {/* Resultados */}
          {showResults && (
            <>
              {/* Spots similares */}
              {searchResults.spots.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
                    Spots similares
                  </Text>
                  {searchResults.spots.map((result) => (
                    <SearchResultCard
                      key={`spot-${result.spot!.id}`}
                      result={result}
                      onSpotPress={handleSpotPress}
                    />
                  ))}
                </View>
              )}

              {/* Paths relacionados */}
              {searchResults.paths.length > 0 && (
                <View style={styles.resultsSection}>
                  <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
                    Paths relacionados
                  </Text>
                  {searchResults.paths.map((result) => (
                    <SearchResultCard
                      key={`path-${result.path!.id}`}
                      result={result}
                      onPathPress={handlePathPress}
                    />
                  ))}
                </View>
              )}
            </>
          )}

          {/* Sin resultados - opción de crear Spot */}
          {showNoResults && (
            <View style={styles.noResultsContainer}>
              <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
                No se encontraron resultados
              </Text>
              <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.md }]}>
                No encontramos "{searchQuery}" en los Spots o Paths disponibles.
              </Text>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.tint }]}
                onPress={handleCreateSpotFromSearch}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: colors.background }]}>
                  Crear nuevo Spot
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Estado vacío */}
          {showEmpty && (
            <View style={styles.emptyState}>
              <Text style={[textStyles.body, { color: colors.text, marginBottom: spacing.sm }]}>
                Buscar Spots y Paths
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                Escribe para buscar lugares, paths y sugerencias.
              </Text>
            </View>
          )}
        </ScrollView>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  suggestionsContainer: {
    marginBottom: spacing.md,
  },
  resultsSection: {
    marginBottom: spacing.xl,
  },
  noResultsContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  createButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
