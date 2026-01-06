/**
 * LocationWeatherHeader Component
 * Muestra ubicación actual, dropdown para cambiar ciudad, clima y temperatura
 * 
 * Funcionalidades:
 * - Nombre de ciudad con dropdown para seleccionar ciudad predefinida
 * - Icono de clima según condición
 * - Temperatura clickeable (toggle Celsius/Fahrenheit)
 */

import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles, fontSize, fontFamilyMedium, lineHeight } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon, IconName } from '@/components/ui/Icon';
import { GlassView } from '@/components/ui/GlassView';
import { getCityNameFromCoordinates, getPredefinedCities, PREDEFINED_CITIES, findNearestPredefinedCity } from '@/utils/geocoding';
import { getWeatherData, WeatherCondition, celsiusToFahrenheit, isDaytime } from '@/utils/weather';

export interface LocationWeatherHeaderProps {
  userLocation: { latitude: number; longitude: number } | null;
  selectedLocation: { latitude: number; longitude: number } | null;
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
  onResetLocation: () => void;
}

export function LocationWeatherHeader({
  userLocation,
  selectedLocation,
  onLocationChange,
  onResetLocation,
}: LocationWeatherHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [cityName, setCityName] = useState<string>('Detecting location...');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('default');
  const [temperature, setTemperature] = useState<number>(20);
  const [isCelsius, setIsCelsius] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  // Asegurar que currentLocation siempre use userLocation si selectedLocation es null
  const currentLocation = selectedLocation || userLocation;

  // Obtener nombre de ciudad y clima cuando cambia la ubicación
  useEffect(() => {
    if (!currentLocation) {
      setCityName('Detecting location...');
      setIsLoading(true);
      return;
    }

    const loadCityAndWeather = async () => {
      setIsLoading(true);
      try {
        // Obtener nombre de ciudad
        let city = await getCityNameFromCoordinates(
          currentLocation.latitude,
          currentLocation.longitude
        );

        // Fallback inteligente: si no se encuentra ciudad, buscar ciudad predefinida más cercana
        if (!city) {
          const nearestCity = findNearestPredefinedCity(
            currentLocation.latitude,
            currentLocation.longitude,
            10000 // 10km de radio
          );
          if (nearestCity) {
            city = nearestCity.name;
            console.log(`Using nearest predefined city as fallback: ${city}`);
          }
        }

        // Último recurso: mostrar "Current location" solo si no hay fallback
        setCityName(city || 'Current location');

        // Obtener datos del clima
        const weatherData = await getWeatherData(
          currentLocation.latitude,
          currentLocation.longitude
        );
        setWeatherCondition(weatherData.condition);
        setTemperature(weatherData.temperature);
      } catch (error) {
        console.error('Error loading city and weather:', error);
        // Intentar fallback a ciudad predefinida en caso de error
        try {
          const nearestCity = findNearestPredefinedCity(
            currentLocation.latitude,
            currentLocation.longitude,
            10000
          );
          if (nearestCity) {
            setCityName(nearestCity.name);
          } else {
            setCityName('Current location');
          }
        } catch (fallbackError) {
          console.error('Error in fallback:', fallbackError);
          setCityName('Current location');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCityAndWeather();
  }, [currentLocation]);

  // Mapear condición climática a icono (con detección día/noche)
  const getWeatherIcon = (condition: WeatherCondition): IconName => {
    // Detectar si es día o noche (si hay ubicación disponible)
    const daytime = currentLocation ? isDaytime(currentLocation.latitude, currentLocation.longitude) : true;
    
    switch (condition) {
      case 'clear':
        // Mostrar sol de día, luna de noche
        return daytime ? 'weather-sunny' : 'weather-moon';
      case 'clouds':
        return 'weather-cloudy';
      case 'rain':
        return 'weather-rain';
      case 'snow':
        return 'weather-snow';
      case 'thunderstorm':
        return 'weather-thunderstorm';
      case 'mist':
      case 'fog':
        return 'weather-mist';
      case 'drizzle':
        return 'weather-drizzle';
      default:
        // Fallback: considerar día/noche también
        return daytime ? 'weather-sunny' : 'weather-moon';
    }
  };

  const handleCitySelect = (city: typeof PREDEFINED_CITIES[0]) => {
    onLocationChange(city.coordinates);
    setIsDropdownVisible(false);
  };

  const handleTemperatureToggle = () => {
    setIsCelsius(!isCelsius);
  };

  const displayTemperature = isCelsius ? temperature : celsiusToFahrenheit(temperature);
  const temperatureUnit = isCelsius ? '°C' : '°F';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Location section */}
        <View style={styles.locationSection}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setIsDropdownVisible(true)}
            activeOpacity={0.7}>
            <Text 
              style={[
                styles.locationText, 
                { 
                  color: colors.text,
                  opacity: isLoading ? 0.6 : 1,
                }
              ]} 
              numberOfLines={2}
              ellipsizeMode="tail">
              {isLoading ? 'Detecting location...' : cityName}
            </Text>
            <Icon name="chevron-down" size={14} color={colors.tint} />
          </TouchableOpacity>
        </View>

        {/* Weather section */}
        <View style={styles.weatherSection}>
          <Icon
            name={getWeatherIcon(weatherCondition)}
            size={14}
            color={colors.text}
          />
          <TouchableOpacity
            onPress={handleTemperatureToggle}
            activeOpacity={0.7}
            style={styles.temperatureButton}>
            <Text style={[styles.temperatureText, { color: colors.text }]}>
              {displayTemperature}{temperatureUnit}
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Dropdown modal */}
      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDropdownVisible(false)}>
          <GlassView
            style={styles.dropdown}
            intensity="medium"
            opacity="strong"
            shadowLevel="medium"
            enableGlow={true}>
            <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
              Select Location
            </Text>
            {getPredefinedCities().map((city) => (
              <TouchableOpacity
                key={city.name}
                style={[
                  styles.dropdownItem,
                  {
                    backgroundColor:
                      currentLocation &&
                      Math.abs(currentLocation.latitude - city.coordinates.latitude) < 0.001 &&
                      Math.abs(currentLocation.longitude - city.coordinates.longitude) < 0.001
                        ? colors.tint + '20'
                        : 'transparent',
                  },
                ]}
                onPress={() => handleCitySelect(city)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    textStyles.bodyMedium,
                    {
                      color:
                        currentLocation &&
                        Math.abs(currentLocation.latitude - city.coordinates.latitude) < 0.001 &&
                        Math.abs(currentLocation.longitude - city.coordinates.longitude) < 0.001
                          ? colors.tint
                          : colors.text,
                    },
                  ]}>
                  {city.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                onResetLocation();
                setIsDropdownVisible(false);
              }}
              activeOpacity={0.7}>
              <Icon name="map-pin" size={16} color={colors.tint} />
              <Text style={[textStyles.bodyMedium, { color: colors.tint, marginLeft: spacing.xs }]}>
                Use my location
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
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs, // Reducir gap principal
  },
  locationSection: {
    flex: 1.5, // Más espacio para ubicación
    minWidth: 0, // Permite truncamiento correcto
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2, // Reducir gap entre texto y chevron
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: 0, // Eliminar padding horizontal
  },
  locationText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.lg, // 18px - más pequeño para que quepa completo
    lineHeight: lineHeight.lg, // 28px
    fontWeight: '600',
    flexShrink: 1, // Permite que el texto se ajuste
  },
  weatherSection: {
    flex: 0.5, // Menos espacio para clima
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 4, // Gap mínimo entre icono y temperatura
    paddingLeft: spacing.xs / 2, // Pequeño padding izquierdo para separación
  },
  temperatureButton: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: 0, // Eliminar padding horizontal
  },
  temperatureText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm, // 14px - más pequeño
    lineHeight: lineHeight.sm, // 20px
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dropdown: {
    width: '100%',
    maxWidth: 300,
    padding: spacing.md,
    borderRadius: 16,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
});

