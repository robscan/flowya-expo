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

import { useState, useMemo, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Keyboard, FlatList, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles, fontSize, lineHeight, fontFamilyMedium, fontFamily } from '@/constants/typography';
import { borderRadius } from '@/constants/borders';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { SearchBar } from '@/components/SearchBar';
import { SearchSuggestion } from '@/components/SearchSuggestion';
import { SearchResultCard } from '@/components/SearchResultCard';
import { CreateSpotModal } from '@/components/CreateSpotModal';
import { useSpot } from '@/contexts/SpotContext';
import { usePath } from '@/contexts/PathContext';
import { useFlow } from '@/contexts/FlowContext';
import { searchAll, getSuggestions, SearchResult } from '@/utils/searchLogic';
import { calculateDistanceToSpot } from '@/utils/distance';
import { Spot, SpotType } from '@/data/spots';
import { Flow } from '@/data/flows';
import { SpotCard } from '@/components/SpotCard';
import { FlowCard } from '@/components/FlowCard';
import { SearchCategoryCard } from '@/components/SearchCategoryCard';
import { SimpleMapView } from '@/components/SimpleMapView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';

// Helper to get readable type name (same as in SpotCard)
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400); // 75% of screen width, max 400px for desktop

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'map'>('results');
  const [isCreateSpotModalVisible, setIsCreateSpotModalVisible] = useState(false);
  const [createSpotLocation, setCreateSpotLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SpotType | null>(null);

  const { spots, isLoading: spotsLoading, createSpot, getSpotById } = useSpot();
  const { paths, isLoading: pathsLoading, getPathById } = usePath();
  const { startFlow } = useFlow();
  const isLoading = spotsLoading || pathsLoading;

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

  // Calcular sugerencias mientras escribe con distancia
  const suggestions = useMemo(() => {
    if (!isSearchFocused || searchQuery.length < 2) {
      return [];
    }
    const baseSuggestions = getSuggestions(spots, paths, searchQuery, 5);
    // Agregar distancia a las sugerencias si hay ubicación
    if (userLocation) {
      return baseSuggestions.map((suggestion) => {
        if (suggestion.type === 'spot') {
          const spot = spots.find((s) => s.id === suggestion.id);
          if (spot) {
            const distance = calculateDistanceToSpot(userLocation, spot.location);
            return { ...suggestion, distance: distance || undefined };
          }
        }
        return suggestion;
      });
    }
    return baseSuggestions;
  }, [searchQuery, spots, paths, isSearchFocused, userLocation]);

  // Obtener spots destacados para estado inicial
  const featuredSpots = useMemo(() => {
    if (searchQuery.trim().length > 0 || isSearchFocused) {
      return [];
    }
    
    let featured: Spot[] = [];
    
    if (userLocation) {
      // Priorizar cercanía y variedad
      const spotsWithDistance = spots
        .map((spot) => ({
          spot,
          distance: calculateDistanceToSpot(userLocation, spot.location) || Infinity,
        }))
        .sort((a, b) => a.distance - b.distance);
      
      // Seleccionar spots variados (diferentes tipos)
      const usedTypes = new Set<SpotType>();
      for (const { spot } of spotsWithDistance) {
        if (featured.length >= 6) break;
        if (!usedTypes.has(spot.type) || featured.length < 3) {
          featured.push(spot);
          usedTypes.add(spot.type);
        }
      }
      
      // Si no hay suficientes, agregar más cercanos
      if (featured.length < 6) {
        for (const { spot } of spotsWithDistance) {
          if (featured.length >= 6) break;
          if (!featured.find((s) => s.id === spot.id)) {
            featured.push(spot);
          }
        }
      }
    } else {
      // Sin ubicación: mostrar spots variados
      const usedTypes = new Set<SpotType>();
      for (const spot of spots) {
        if (featured.length >= 6) break;
        if (!usedTypes.has(spot.type) || featured.length < 3) {
          featured.push(spot);
          usedTypes.add(spot.type);
        }
      }
    }
    
    return featured;
  }, [spots, userLocation, searchQuery, isSearchFocused]);

  // Calcular resultados de búsqueda con distancia y filtro de categoría
  const searchResults = useMemo(() => {
    // Si hay categoría seleccionada, mostrar todos los spots de esa categoría
    // Si hay query, buscar dentro de los spots filtrados
    if (!selectedCategory && searchQuery.trim().length < 2) {
      return { spots: [], paths: [] };
    }
    
    // Filtrar spots por categoría si está seleccionada
    let filteredSpots = spots;
    if (selectedCategory) {
      filteredSpots = spots.filter((spot) => spot.type === selectedCategory);
    }
    
    // Si hay query, buscar; si solo hay categoría, mostrar todos los spots de esa categoría
    const query = searchQuery.trim().length >= 2 ? searchQuery : '';
    let results;
    
    if (query) {
      results = searchAll(filteredSpots, paths, query, {
        spotLimit: 20,
        pathLimit: 10,
      });
    } else {
      // Si solo hay categoría sin query, mostrar todos los spots de esa categoría
      results = {
        spots: filteredSpots.map((spot) => ({
          type: 'spot' as const,
          spot,
          relevanceScore: 100, // Todos tienen misma relevancia
        })),
        paths: [], // No mostrar paths sin query
      };
    }
    
    // Ordenar spots por relevancia + cercanía si hay ubicación
    if (userLocation) {
      results.spots = results.spots
        .map((result) => {
          if (result.spot) {
            const distance = calculateDistanceToSpot(userLocation, result.spot.location);
            return { ...result, distance: distance || undefined };
          }
          return result;
        })
        .sort((a, b) => {
          // Si hay query, priorizar por relevancia primero, luego por distancia
          // Si solo hay categoría, ordenar solo por distancia
          if (query && a.relevanceScore !== b.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          const distA = a.distance || Infinity;
          const distB = b.distance || Infinity;
          return distA - distB;
        });
    } else if (!query) {
      // Sin ubicación y sin query: ordenar por relevancia (todos tienen 100, así que mantiene orden original)
      results.spots.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    
    return results;
  }, [searchQuery, spots, paths, userLocation, selectedCategory]);

  const hasResults = searchResults.spots.length > 0 || searchResults.paths.length > 0;
  const showSuggestions = isSearchFocused && suggestions.length > 0 && !hasResults;
  const showResults = (searchQuery.trim().length >= 2 || selectedCategory) && hasResults;
  const showNoResults = (searchQuery.trim().length >= 2 || selectedCategory) && !hasResults && !isSearchFocused;
  const showEmpty = searchQuery.trim().length === 0 && !isSearchFocused && !selectedCategory;

  // Spots para mostrar en el mapa
  const mapSpots = useMemo(() => {
    if (selectedCategory) {
      return spots.filter((spot) => spot.type === selectedCategory);
    }
    if (searchQuery.trim().length >= 2) {
      return searchResults.spots.map((result) => result.spot).filter((spot): spot is Spot => spot !== undefined);
    }
    // Estado inicial: mostrar spots destacados
    return featuredSpots;
  }, [selectedCategory, searchQuery, searchResults.spots, featuredSpots, spots]);

  // Categorías presentes en los resultados actuales (solo si hay más de una)
  const resultCategories = useMemo(() => {
    if (!showResults || searchResults.spots.length === 0) {
      return [];
    }
    
    // Obtener categorías únicas de los resultados
    const categories = new Set<SpotType>();
    searchResults.spots.forEach((result) => {
      if (result.spot?.type) {
        categories.add(result.spot.type);
      }
    });
    
    const categoryArray = Array.from(categories);
    
    // Solo mostrar chips si hay más de una categoría
    return categoryArray.length > 1 ? categoryArray : [];
  }, [showResults, searchResults.spots]);

  // Manejar selección de sugerencia
  const handleSuggestionPress = (suggestion: typeof suggestions[0]) => {
    setSearchQuery(suggestion.name);
    setIsSearchFocused(false);
    Keyboard.dismiss();
  };

  // Manejar selección de categoría
  const handleCategoryPress = (type: SpotType) => {
    setSelectedCategory(type);
    setIsSearchFocused(false);
    Keyboard.dismiss();
  };

  // Limpiar filtro de categoría
  const handleClearCategory = () => {
    setSelectedCategory(null);
  };

  // Manejar selección de Spot desde resultados o mapa
  const handleSpotPress = (spotOrId: Spot | string) => {
    const spotId = typeof spotOrId === 'string' ? spotOrId : spotOrId.id;
    router.push(`/spot-detail?id=${spotId}`);
  };

  // Manejar selección de Path desde resultados
  const handlePathPress = (pathId: string) => {
    startFlow(pathId);
  };

  // Manejar creación de Spot desde búsqueda
  const handleCreateSpotFromSearch = () => {
    // Usar ubicación del usuario si está disponible, sino usar ubicación por defecto
    setCreateSpotLocation(
      userLocation || {
        latitude: -12.0464,
        longitude: -77.0428,
      }
    );
    setIsCreateSpotModalVisible(true);
  };

  const handleCreateSpot = (spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>) => {
    createSpot(spotData);
    // Don't close modal immediately - let CreateSpotModal handle it after showing success message
    setSearchQuery(''); // Clear search after creating
  };

  const handleCloseCreateSpotModal = () => {
    setIsCreateSpotModalVisible(false);
    setCreateSpotLocation(null);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      {/* Contenido */}
      {isLoading ? (
        <View style={styles.loadingState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Loading...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
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
              <Text style={[textStyles.heading3, { color: colors.text }]}>Search</Text>
              <TouchableOpacity
                onPress={handleCreateSpotFromSearch}
                style={iconTouchableContainer.base}
                activeOpacity={0.7}>
                <Icon name="add" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search Spots and Paths..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </View>

          {/* Category Chips - Solo mostrar si hay resultados con más de una categoría */}
          {resultCategories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {resultCategories.map((type) => (
                <SearchCategoryCard
                  key={type}
                  type={type}
                  onPress={() => handleCategoryPress(type)}
                />
              ))}
            </View>
          )}

          {/* Internal tabs */}
          {(showResults || selectedCategory || searchQuery.trim().length >= 2) && (
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
                  activeTab === 'results' && styles.tabActive,
                  activeTab === 'results' && { borderBottomColor: colors.tint },
                ]}
                onPress={() => setActiveTab('results')}
                activeOpacity={0.7}>
                <Text
                  style={[
                    textStyles.bodyMedium,
                    { color: activeTab === 'results' ? colors.tint : colors.icon },
                  ]}>
                  Results
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
          )}

          {/* Suggestions */}
          {showSuggestions && (
            <View style={styles.suggestionsContainer}>
              <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.sm }]}>
                Suggestions
              </Text>
              {suggestions.map((suggestion) => (
                <SearchSuggestion
                  key={`${suggestion.type}-${suggestion.id}`}
                  name={suggestion.name}
                  type={suggestion.type}
                  distance={suggestion.distance}
                  onPress={() => handleSuggestionPress(suggestion)}
                />
              ))}
            </View>
          )}

          {/* Badge de filtro activo */}
          {selectedCategory && (
            <View style={styles.filterBadge}>
              <View
                style={[
                  styles.filterBadgeContent,
                  {
                    backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                  },
                ]}>
                <Text
                  style={[
                    styles.filterBadgeText,
                    {
                      color: colorScheme === 'dark' ? '#fff' : colors.text,
                      marginRight: spacing.xs,
                    },
                  ]}>
                  {getSpotTypeLabel(selectedCategory).toUpperCase()}
                </Text>
                <TouchableOpacity
                  onPress={handleClearCategory}
                  style={styles.filterBadgeClose}
                  activeOpacity={0.7}>
                  <Icon
                    name="close"
                    size={14}
                    color={colorScheme === 'dark' ? '#fff' : colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tab Content */}
          {activeTab === 'results' ? (
            <>
              {/* Resultados */}
              {showResults && (
            <>
              {/* Spots - Results (Slider horizontal) */}
              {searchResults.spots.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Spots - Results ({searchResults.spots.length})
                  </Text>
                  <FlatList
                    data={searchResults.spots}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sliderContent}
                    keyExtractor={(item) => `spot-${item.spot!.id}`}
                    renderItem={({ item: result }) => {
                      if (!result.spot) return null;
                      const distance = result.distance || calculateDistanceToSpot(userLocation, result.spot.location);
                      return (
                        <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                          <SpotCard
                            spot={result.spot}
                            distance={distance || undefined}
                            onPress={() => handleSpotPress(result.spot!.id)}
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
              )}

              {/* Paths - Results (Lista vertical) */}
              {searchResults.paths.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: spacing.xs / 2 }]}>
                    Paths - Results ({searchResults.paths.length})
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.icon, marginTop: 0, marginBottom: spacing.md, paddingHorizontal: spacing.md }]}>
                    Curated routes connecting multiple spots
                  </Text>
                  <View style={styles.pathsList}>
                    {searchResults.paths.map((result) => {
                      if (!result.path) return null;
                      const pathSpots = result.path.spots
                        .map((spotId) => spots.find((s) => s.id === spotId))
                        .filter((s): s is Spot => s !== undefined);
                      const distance = pathSpots.length > 0 && userLocation
                        ? calculateDistanceToSpot(userLocation, pathSpots[0].location)
                        : undefined;
                      return (
                        <FlowCard
                          key={`path-${result.path.id}`}
                          flow={result.path}
                          spots={spots}
                          distance={distance || undefined}
                          onPress={() => handlePathPress(result.path!.id)}
                        />
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )}

              {/* Sin resultados - opción de crear Spot */}
          {showNoResults && (
            <View style={styles.noResultsContainer}>
              <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
                No results found
              </Text>
              <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.md, textAlign: 'center' }]}>
                We couldn't find "{searchQuery}" in available Spots or Paths.
              </Text>
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.tint }]}
                onPress={handleCreateSpotFromSearch}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>
                  Create new Spot
                </Text>
              </TouchableOpacity>
            </View>
          )}

              {/* Estado inicial: Featured Spots y Categorías */}
              {showEmpty && (
            <>
              {/* Featured Spots */}
              {featuredSpots.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {userLocation ? 'Nearby Spots' : 'Featured Spots'}
                  </Text>
                  <FlatList
                    data={featuredSpots}
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
                            onPress={() => handleSpotPress(spot.id)}
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
              )}

            </>
          )}
            </>
          ) : (
            /* Tab Map */
            <View style={styles.mapContainer}>
              <SimpleMapView
                spots={mapSpots}
                onSpotPress={handleSpotPress}
              />
            </View>
          )}
        </ScrollView>
      )}


      {/* Create Spot Modal */}
      <CreateSpotModal
        visible={isCreateSpotModalVisible}
        location={createSpotLocation}
        userLocation={userLocation}
        onClose={handleCloseCreateSpotModal}
        onCreate={handleCreateSpot}
      />
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing['2xl'],
  },
  suggestionsContainer: {
    marginBottom: spacing.md,
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
  },
  sliderCard: {
    marginRight: spacing.sm,
  },
  pathsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  resultsSection: {
    marginBottom: spacing.xl,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  filterBadge: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filterBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm, // 16px - igual que chip del card
    paddingVertical: spacing.xs / 2, // 4px - igual que chip del card
    borderRadius: borderRadius.sm, // 8px - igual que chip del card
    alignSelf: 'flex-start',
  },
  filterBadgeText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs, // 12px - igual que chip del card
    lineHeight: lineHeight.xs, // 16px - igual que chip del card
    fontWeight: '500',
  },
  filterBadgeClose: {
    marginLeft: spacing.xs / 2,
    padding: 0,
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
    // Additional styles applied inline
  },
  mapContainer: {
    flex: 1,
    minHeight: 400,
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
