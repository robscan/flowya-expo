/**
 * Pantalla de Testing de Componentes
 * Temporal: Para revisar componentes en composición
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { GlassView } from '@/components/ui/GlassView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { textStyles, fontSize, lineHeight, fontFamily, fontFamilyMedium } from '@/constants/typography';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { borderTokens } from '@/constants/borders';
import { SpotCard } from '@/components/SpotCard';
import { FlowCard } from '@/components/FlowCard';
import { FlowSpotCard } from '@/components/FlowSpotCard';
import { mockSpots } from '@/data/spots';
import { mockFlows } from '@/data/flows';
import { Spot } from '@/data/spots';
import { calculateDistanceToSpot } from '@/utils/distance';

// Helper para formatear distancia (copiado de FlowMiniPlayer)
function formatDistance(distance?: number, useMiles: boolean = false): string | null {
  if (!distance) return null;
  
  if (useMiles) {
    const miles = distance / 1609.34;
    if (miles < 0.1) {
      const feet = (miles * 5280).toFixed(0);
      return `${feet} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  }
  
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)} km`;
}

// Componente de ejemplo para FlowMiniPlayer (sin dependencias de contextos)
function FlowMiniPlayerExample() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [useMiles, setUseMiles] = useState(false);

  // Usar el primer spot como ejemplo
  const exampleSpot = mockSpots[0];

  // Obtener ubicación del usuario
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
        console.error('Error obteniendo ubicación:', error);
      }
    })();
  }, []);

  // Calcular distancia al spot
  const distance = calculateDistanceToSpot(userLocation, exampleSpot.location);
  const distanceText = formatDistance(distance || undefined, useMiles);
  const hasImage = exampleSpot.photos && exampleSpot.photos.length > 0;

  const handleDistancePress = (e: any) => {
    e.stopPropagation();
    if (distance) {
      setUseMiles(!useMiles);
    }
  };

  const handleNavigationPress = (e: any) => {
    e.stopPropagation();
    console.log('Navigate to full player');
  };

  return (
    <View style={exampleStyles.container}>
      <GlassView 
        style={exampleStyles.player} 
        intensity="medium" 
        opacity="strong"
        shadowLevel="strong"
        enableGlow={true}
        useGrayBackground={true}
      >
        <View style={exampleStyles.content}>
          {/* Imagen del spot */}
          {hasImage ? (
            <Image 
              source={{ uri: exampleSpot.photos[0] }} 
              style={exampleStyles.spotImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[exampleStyles.spotImagePlaceholder, { backgroundColor: colors.icon + '20' }]}>
              <Icon name="map" size={16} color={colors.icon} />
            </View>
          )}

          {/* Información: Nombre y distancia */}
          <View style={exampleStyles.info}>
            <Text style={[exampleStyles.spotName, { color: colors.text }]} numberOfLines={1}>
              {exampleSpot.name || 'Current spot'}
            </Text>
            {distanceText && (
              <TouchableOpacity 
                onPress={handleDistancePress}
                activeOpacity={0.7}
                style={exampleStyles.distanceContainer}
              >
                <Icon name="map" size={10} color={colors.icon} />
                <Text style={[exampleStyles.distanceText, { color: colors.icon }]}>
                  {distanceText}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Controles: Atrás, Navegación, Adelante */}
          <View style={exampleStyles.controls}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                console.log('Previous');
              }}
              style={exampleStyles.controlButton}
              activeOpacity={0.7}>
              <Icon name="previous" size={18} color={colors.icon} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleNavigationPress}
              style={exampleStyles.controlButton}
              activeOpacity={0.7}>
              <Icon name="navigation" size={20} color={colors.tint} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                console.log('Next');
              }}
              style={exampleStyles.controlButton}
              activeOpacity={0.7}>
              <Icon name="next" size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </GlassView>
    </View>
  );
}

const exampleStyles = StyleSheet.create({
  container: {
    width: '100%',
  },
  player: {
    borderRadius: borderTokens.card, // 16px - border redondeado
    paddingVertical: spacing.xs / 2, // 4px padding vertical mínimo
    paddingHorizontal: spacing.xs, // 8px padding horizontal mínimo
    overflow: 'hidden', // Para que el border radius funcione correctamente
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 8px entre elementos (mínimo)
  },
  spotImage: {
    width: 32, // 32px
    height: 32, // 32px
    borderRadius: borderTokens.button, // 8px
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  spotImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderTokens.button, // 8px
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2, // 2px entre nombre y distancia (mínimo)
  },
  spotName: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs, // 12px - tamaño más pequeño
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2, // 2px entre icono y texto (mínimo)
  },
  distanceText: {
    fontFamily,
    fontSize: fontSize.xs, // 12px - mismo tamaño que nombre
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '400',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2, // 2px entre controles (más juntos)
  },
  controlButton: {
    minWidth: 40, // Zona activa de 40px
    minHeight: 40, // Zona activa de 40px
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function TestingComponentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Datos de ejemplo para las cards
  const spotWithImage = mockSpots[0]; // Playa Principal (tiene imagen)
  const spotWithImage2 = mockSpots[1]; // Mirador de la Ciudad (tiene imagen)
  const spotWithoutImage: Spot = {
    id: 'spot-test-no-image',
    name: 'Spot Sin Imagen',
    location: {
      latitude: -12.0464,
      longitude: -77.0428,
    },
    photos: [], // Sin imágenes
    description: 'Este es un ejemplo de spot sin imagen para ver el fondo gris sutil.',
    type: 'viewpoint',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Icon name="back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[textStyles.heading3, { color: colors.text }]}>
            Testing Components
          </Text>
        </View>

        {/* Sección: Tokens de Tipografía */}
        <View style={styles.section}>
          <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
            Tokens de Tipografía
          </Text>

          {/* Heading */}
          <View style={[styles.tokenExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              heading (32px, semibold)
            </Text>
            <Text style={[textStyles.heading, { color: colors.text }]}>
              The quick brown fox jumps over the lazy dog
            </Text>
          </View>

          {/* Heading2 */}
          <View style={[styles.tokenExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              heading2 (28px, semibold)
            </Text>
            <Text style={[textStyles.heading2, { color: colors.text }]}>
              The quick brown fox jumps over the lazy dog
            </Text>
          </View>

          {/* Heading3 - Título de Card */}
          <View style={[styles.tokenExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              heading3 (24px, medium) - Título de Card
            </Text>
            <Text style={[textStyles.heading3, { color: colors.text }]}>
              The quick brown fox jumps over the lazy dog
            </Text>
          </View>

          {/* Body - Descripción */}
          <View style={[styles.tokenExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              body (16px, regular) - Descripción
            </Text>
            <Text style={[textStyles.body, { color: colors.text }]}>
              The quick brown fox jumps over the lazy dog. This is body text for descriptions.
            </Text>
          </View>

          {/* BodyMedium */}
          <View style={[styles.tokenExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              bodyMedium (16px, medium)
            </Text>
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
              The quick brown fox jumps over the lazy dog
            </Text>
          </View>

          {/* Caption - Chip, Distancia, Link */}
          <View style={[styles.tokenExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              caption (14px, regular) - Chip, Distancia, Link
            </Text>
            <View style={styles.captionExamples}>
              <View style={[styles.chipExample, { backgroundColor: '#fff' }]}>
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  HISTORIC
                </Text>
              </View>
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                0.2 km
              </Text>
              <Text style={[textStyles.caption, { color: colors.tint }]}>
                Ver en mapa →
              </Text>
            </View>
          </View>

          {/* Label */}
          <View style={[styles.tokenExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <Text style={[textStyles.label, { color: colors.icon, marginBottom: spacing.xs }]}>
              label (14px, medium)
            </Text>
            <Text style={[textStyles.label, { color: colors.text }]}>
              The quick brown fox jumps over the lazy dog
            </Text>
          </View>
        </View>

        {/* Sección: Tokens de Colores */}
        <View style={styles.section}>
          <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
            Tokens de Colores
          </Text>

          {/* Color: text */}
          <View style={[styles.colorExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.text }]} />
            <View style={styles.colorInfo}>
              <Text style={[textStyles.label, { color: colors.text }]}>
                text
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                {colors.text} - Color principal de texto
              </Text>
              <Text style={[textStyles.body, { color: colors.text, marginTop: spacing.xs }]}>
                The quick brown fox jumps over the lazy dog
              </Text>
            </View>
          </View>

          {/* Color: background */}
          <View style={[styles.colorExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.icon + '40' }]} />
            <View style={styles.colorInfo}>
              <Text style={[textStyles.label, { color: colors.text }]}>
                background
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                {colors.background} - Color de fondo
              </Text>
              <View style={[styles.colorPreview, { backgroundColor: colors.background }]}>
                <Text style={[textStyles.body, { color: colors.text }]}>
                  Fondo de la aplicación
                </Text>
              </View>
            </View>
          </View>

          {/* Color: tint */}
          <View style={[styles.colorExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.tint }]} />
            <View style={styles.colorInfo}>
              <Text style={[textStyles.label, { color: colors.text }]}>
                tint
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                {colors.tint} - Color de acento / Hipervínculos
              </Text>
              <Text style={[textStyles.body, { color: colors.tint, marginTop: spacing.xs }]}>
                Ver en mapa → (hipervínculo)
              </Text>
            </View>
          </View>

          {/* Color: icon */}
          <View style={[styles.colorExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.icon }]} />
            <View style={styles.colorInfo}>
              <Text style={[textStyles.label, { color: colors.text }]}>
                icon
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                {colors.icon} - Color para iconos y texto secundario
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
                0.2 km (texto secundario)
              </Text>
            </View>
          </View>

          {/* Color: tabIconDefault */}
          <View style={[styles.colorExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.tabIconDefault }]} />
            <View style={styles.colorInfo}>
              <Text style={[textStyles.label, { color: colors.text }]}>
                tabIconDefault
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                {colors.tabIconDefault} - Color de iconos de tabs (no seleccionado)
              </Text>
            </View>
          </View>

          {/* Color: tabIconSelected */}
          <View style={[styles.colorExample, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
            <View style={[styles.colorSwatch, { backgroundColor: colors.tabIconSelected }]} />
            <View style={styles.colorInfo}>
              <Text style={[textStyles.label, { color: colors.text }]}>
                tabIconSelected
              </Text>
              <Text style={[textStyles.caption, { color: colors.icon }]}>
                {colors.tabIconSelected} - Color de iconos de tabs (seleccionado)
              </Text>
            </View>
          </View>
        </View>

        {/* Sección: GlassView - Diferentes configuraciones */}
        <View style={styles.section}>
          <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
            GlassView - Configuraciones
          </Text>

          {/* GlassView sin sombra */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              Sin sombra (shadowLevel: none)
            </Text>
            <GlassView 
              style={styles.glassExample}
              opacity="strong"
              shadowLevel="none"
            >
              <Text style={[textStyles.body, { color: colors.text }]}>
                Contenido con glass effect sin sombra
              </Text>
            </GlassView>
          </View>

          {/* GlassView con sombra sutil */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              Sombra sutil (shadowLevel: subtle)
            </Text>
            <GlassView 
              style={styles.glassExample}
              opacity="strong"
              shadowLevel="subtle"
            >
              <Text style={[textStyles.body, { color: colors.text }]}>
                Contenido con glass effect y sombra sutil
              </Text>
            </GlassView>
          </View>

          {/* GlassView con sombra media (para elementos flotantes) */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              Sombra media (shadowLevel: medium) - Tab Bar / Player
            </Text>
            <GlassView 
              style={styles.glassExample}
              opacity="strong"
              shadowLevel="medium"
              enableGlow={true}
            >
              <Text style={[textStyles.body, { color: colors.text }]}>
                Contenido con glass effect, sombra media y glow interno (elementos flotantes)
              </Text>
            </GlassView>
          </View>

          {/* GlassView con fondo gris (sin imagen) */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              Fondo gris sutil (cuando no hay imagen)
            </Text>
            <GlassView 
              style={styles.glassExample}
              opacity="strong"
              shadowLevel="subtle"
              enableGlow={true}
              useGrayBackground={true}
            >
              <Text style={[textStyles.body, { color: colors.text }]}>
                Fondo gris ayuda a que el glow se note más. Observa el resplandor en el contorno.
              </Text>
            </GlassView>
          </View>

          {/* GlassView con glow en contorno (con imagen) */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              Glow en contorno (cuando hay imagen)
            </Text>
            <GlassView 
              style={styles.glassExample}
              opacity="strong"
              shadowLevel="subtle"
              enableGlow={true}
              useGrayBackground={false}
            >
              <View style={[styles.testImageContainer, { backgroundColor: colors.icon + '30' }]}>
                <Text style={[textStyles.caption, { color: colors.text }]}>
                  [Imagen aquí]
                </Text>
              </View>
              <Text style={[textStyles.body, { color: colors.text, marginTop: spacing.sm }]}>
                Glow visible en todo el contorno cuando hay imagen
              </Text>
            </GlassView>
          </View>

          {/* Comparación con/sin glow */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              Comparación: Con glow vs Sin glow
            </Text>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonItem}>
                <Text style={[textStyles.caption, { color: colors.text, marginBottom: spacing.xs }]}>
                  Con glow
                </Text>
                <GlassView 
                  style={styles.glassSmall}
                  opacity="strong"
                  shadowLevel="subtle"
                  enableGlow={true}
                  useGrayBackground={true}
                >
                  <View style={styles.glassContent} />
                </GlassView>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={[textStyles.caption, { color: colors.text, marginBottom: spacing.xs }]}>
                  Sin glow
                </Text>
                <GlassView 
                  style={styles.glassSmall}
                  opacity="strong"
                  shadowLevel="subtle"
                  enableGlow={false}
                  useGrayBackground={true}
                >
                  <View style={styles.glassContent} />
                </GlassView>
              </View>
            </View>
          </View>

          {/* GlassView con sombra fuerte (para modales) */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              Sombra fuerte (shadowLevel: strong) - Modales / Drawers
            </Text>
            <GlassView 
              style={styles.glassExample}
              opacity="strong"
              shadowLevel="strong"
            >
              <Text style={[textStyles.body, { color: colors.text }]}>
                Contenido con glass effect y sombra fuerte (modales)
              </Text>
            </GlassView>
          </View>

          {/* GlassView con diferentes opacidades */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              Diferentes opacidades
            </Text>
            
            <View style={styles.opacityRow}>
              <View style={styles.opacityItem}>
                <Text style={[textStyles.caption, { color: colors.text, marginBottom: spacing.xs }]}>
                  Light (0.85)
                </Text>
                <GlassView 
                  style={styles.glassSmall}
                  opacity="light"
                  shadowLevel="subtle"
                >
                  <View style={styles.glassContent} />
                </GlassView>
              </View>

              <View style={styles.opacityItem}>
                <Text style={[textStyles.caption, { color: colors.text, marginBottom: spacing.xs }]}>
                  Medium (0.90)
                </Text>
                <GlassView 
                  style={styles.glassSmall}
                  opacity="medium"
                  shadowLevel="subtle"
                >
                  <View style={styles.glassContent} />
                </GlassView>
              </View>

              <View style={styles.opacityItem}>
                <Text style={[textStyles.caption, { color: colors.text, marginBottom: spacing.xs }]}>
                  Strong (0.95)
                </Text>
                <GlassView 
                  style={styles.glassSmall}
                  opacity="strong"
                  shadowLevel="subtle"
                >
                  <View style={styles.glassContent} />
                </GlassView>
              </View>
            </View>
          </View>

          {/* GlassView con diferentes border radius */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              Diferentes border radius
            </Text>
            
            <View style={styles.radiusRow}>
              <View style={styles.radiusItem}>
                <Text style={[textStyles.caption, { color: colors.text, marginBottom: spacing.xs }]}>
                  8px (Botones)
                </Text>
                <GlassView 
                  style={[styles.glassSmall, { borderRadius: borderTokens.button }]}
                  opacity="medium"
                  shadowLevel="subtle"
                >
                  <View style={styles.glassContent} />
                </GlassView>
              </View>

              <View style={styles.radiusItem}>
                <Text style={[textStyles.caption, { color: colors.text, marginBottom: spacing.xs }]}>
                  16px (Cards)
                </Text>
                <GlassView 
                  style={[styles.glassSmall, { borderRadius: borderTokens.card }]}
                  opacity="medium"
                  shadowLevel="subtle"
                >
                  <View style={styles.glassContent} />
                </GlassView>
              </View>

              <View style={styles.radiusItem}>
                <Text style={[textStyles.caption, { color: colors.text, marginBottom: spacing.xs }]}>
                  24px (Modales)
                </Text>
                <GlassView 
                  style={[styles.glassSmall, { borderRadius: borderTokens.modal }]}
                  opacity="medium"
                  shadowLevel="subtle"
                >
                  <View style={styles.glassContent} />
                </GlassView>
              </View>
            </View>
          </View>
        </View>

        {/* Sección: Cards - Todas las variantes */}
        <View style={styles.section}>
          <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
            Cards - Todas las Variantes
          </Text>

          {/* SpotCard con imagen 1 */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              SpotCard - Con Imagen
            </Text>
            <SpotCard 
              spot={spotWithImage} 
              distance={1250}
              onPress={() => {}}
            />
          </View>

          {/* SpotCard con imagen 2 */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              SpotCard - Con Imagen (otro ejemplo)
            </Text>
            <SpotCard 
              spot={spotWithImage2} 
              distance={850}
              onPress={() => {}}
            />
          </View>

          {/* SpotCard sin imagen */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              SpotCard - Sin Imagen (fondo gris sutil)
            </Text>
            <SpotCard 
              spot={spotWithoutImage} 
              distance={650}
              onPress={() => {}}
            />
          </View>

          {/* FlowCard - Layout horizontal */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              FlowCard - Layout Horizontal (Tour List)
            </Text>
            <FlowCard 
              flow={mockFlows[0]} 
              spots={mockSpots}
              onPress={() => {}}
            />
          </View>

          {/* FlowCard - Otro ejemplo */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              FlowCard - Otro ejemplo
            </Text>
            <FlowCard 
              flow={mockFlows[1]} 
              spots={mockSpots}
              onPress={() => {}}
            />
          </View>

          {/* FlowCard - Tercer ejemplo */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              FlowCard - Tercer ejemplo
            </Text>
            <FlowCard 
              flow={mockFlows[2]} 
              spots={mockSpots}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Sección: FlowSpotCard - Cards de spots dentro de Path/Flow */}
        <View style={styles.section}>
          <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
            FlowSpotCard - Spots dentro de Path/Flow
          </Text>

          {/* FlowSpotCard - Ejemplo 1 (Activo) */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              FlowSpotCard - Activo (con distancia)
            </Text>
            <FlowSpotCard 
              spot={mockSpots[0]} 
              index={0}
              distance={250}
              isActive={true}
              onPress={() => {}}
            />
          </View>

          {/* FlowSpotCard - Ejemplo 2 (Inactivo) */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              FlowSpotCard - Inactivo (sin distancia)
            </Text>
            <FlowSpotCard 
              spot={mockSpots[1]} 
              index={1}
              isActive={false}
              onPress={() => {}}
            />
          </View>

          {/* FlowSpotCard - Ejemplo 3 (Inactivo con distancia) */}
          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              FlowSpotCard - Inactivo (con distancia)
            </Text>
            <FlowSpotCard 
              spot={mockSpots[2]} 
              index={2}
              distance={1850}
              isActive={false}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Sección: FlowMiniPlayer - Mini Player de Flow */}
        <View style={styles.section}>
          <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
            FlowMiniPlayer - Mini Player de Flow
          </Text>

          <View style={styles.exampleContainer}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
              FlowMiniPlayer - Ejemplo con datos mock
            </Text>
            <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.sm }]}>
              Nota: En la app, este componente solo se muestra cuando hay un flow activo o pausado. 
              Aquí se muestra con datos de ejemplo para validar su estética.
            </Text>
            <FlowMiniPlayerExample />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  exampleContainer: {
    marginBottom: spacing.lg,
  },
  glassExample: {
    padding: spacing.md,
    borderRadius: borderTokens.card,
    minHeight: 80,
    justifyContent: 'center',
  },
  glassSmall: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassContent: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
  },
  opacityRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-around',
  },
  opacityItem: {
    alignItems: 'center',
    flex: 1,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-around',
  },
  radiusItem: {
    alignItems: 'center',
    flex: 1,
  },
  testImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  tokenExample: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderTokens.card,
  },
  captionExamples: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  chipExample: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderTokens.button,
  },
  colorExample: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderTokens.card,
    gap: spacing.md,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: borderTokens.button,
  },
  colorInfo: {
    flex: 1,
  },
  colorPreview: {
    padding: spacing.sm,
    borderRadius: borderTokens.button,
    marginTop: spacing.xs,
  },
});

