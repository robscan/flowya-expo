/**
 * Profile Screen
 * Scope 11: Profile Screen - Preferencias y ajustes
 * 
 * Principios de diseño:
 * - Modal/overlay con efecto glass
 * - Background blur detrás del modal
 * - Preferencias generales
 * - Secciones: "GENERAL", "DATA & PERMISSIONS"
 * - Cards con estilo glass para cada sección
 */

import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';
import { SettingsToggle } from '@/components/SettingsToggle';
import { clearAllStorage } from '@/utils/clearStorage';
import { useNarration } from '@/contexts/NarrationContext';

const PREFERENCES_KEY = '@mini_tours_preferences';

interface UserPreferences {
  narrationEnabled: boolean;
  locationEnabled: boolean;
  notificationsEnabled: boolean;
}

const defaultPreferences: UserPreferences = {
  narrationEnabled: true,
  locationEnabled: true,
  notificationsEnabled: true,
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const narration = useNarration();
  
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // Cargar preferencias
  useEffect(() => {
    loadPreferences();
  }, []);

  // Guardar preferencias
  useEffect(() => {
    if (preferences) {
      savePreferences(preferences);
      // Aplicar preferencias
      if (preferences.narrationEnabled !== undefined) {
        // La narration se maneja a través del contexto
        // Aquí solo guardamos la preferencia
      }
    }
  }, [preferences]);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (prefs: UserPreferences) => {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  // Navegación hacia atrás
  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const handleClearStorage = () => {
    Alert.alert(
      'Limpiar Datos',
      '¿Estás seguro de que quieres limpiar todos los datos guardados? Esto incluye spots, paths y datos guardados (likes, saves, etc.). La app se recargará.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllStorage();
              Alert.alert('Éxito', 'Datos limpiados correctamente. Recarga la app para ver los cambios.');
            } catch (error) {
              Alert.alert('Error', 'No se pudieron limpiar los datos. Revisa la consola para más detalles.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <GlassView style={styles.header} intensity="light" opacity="medium">
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[textStyles.heading3, { color: colors.text }]}>Profile</Text>
          <View style={iconTouchableContainer.base} />
        </View>
      </GlassView>

      {/* Contenido */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* User Profile Card */}
        <GlassView style={styles.card} intensity="medium" opacity="medium">
          <View style={styles.userCard}>
            <View style={[styles.avatar, { backgroundColor: colors.tint + '40' }]}>
              <Icon name="profile" size={32} color={colors.tint} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[textStyles.heading4, { color: colors.text }]}>Usuario</Text>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                usuario@ejemplo.com
              </Text>
            </View>
          </View>
        </GlassView>

        {/* GENERAL Section */}
        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
            GENERAL
          </Text>
          <GlassView style={styles.card} intensity="medium" opacity="medium">
            <SettingsToggle
              label="Narration"
              value={preferences.narrationEnabled}
              onValueChange={(value) => handlePreferenceChange('narrationEnabled', value)}
              description="Audio narrations durante el Flow"
            />
            <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
            <SettingsToggle
              label="Location"
              value={preferences.locationEnabled}
              onValueChange={(value) => handlePreferenceChange('locationEnabled', value)}
              description="Usar ubicación para recomendaciones"
            />
            <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
            <SettingsToggle
              label="Notifications"
              value={preferences.notificationsEnabled}
              onValueChange={(value) => handlePreferenceChange('notificationsEnabled', value)}
              description="Notificaciones sobre nuevos spots y paths"
            />
          </GlassView>
        </View>

        {/* DATA & PERMISSIONS Section */}
        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
            DATA & PERMISSIONS
          </Text>
          <GlassView style={styles.card} intensity="medium" opacity="medium">
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleClearStorage}
              activeOpacity={0.7}>
              <View style={styles.actionContent}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Limpiar todos los datos</Text>
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                  Eliminar spots, paths y datos guardados
                </Text>
              </View>
              <Icon name="edit" size={20} color={colors.icon} />
            </TouchableOpacity>
          </GlassView>
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
  card: {
    borderRadius: 16,
    padding: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  actionContent: {
    flex: 1,
    marginRight: spacing.md,
  },
});
