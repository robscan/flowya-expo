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
import { useAuth } from '@/contexts/AuthContext';

const PREFERENCES_KEY = '@flowya_preferences';

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
  const { user, isAuthenticated, signOut } = useAuth();
  
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
      'Limpiar todos los datos',
      '¿Estás seguro de que quieres eliminar todos los datos guardados?\n\nEsto incluye:\n• Todos los lugares creados\n• Todos los flows guardados\n• Tus lugares y flows favoritos\n• Historial de actividad\n\nEsta acción no se puede deshacer. La app se recargará después de limpiar los datos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpiar todo',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllStorage();
              Alert.alert('Data cleared', 'All data deleted. App will reload.');
              // Recargar la app
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            } catch (error) {
              Alert.alert('Error', 'Couldn\'t clear data. Try again.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(tabs)/home');
            } catch (error) {
                  Alert.alert('Error', 'Couldn\'t sign out. Check console for details.');
            }
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/(tabs)/login');
  };

  const handleSignup = () => {
    router.push('/(tabs)/signup');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity
              onPress={handleBackPress}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name="back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[textStyles.heading3, { color: colors.text }]}>Profile</Text>
            <View style={iconTouchableContainer.base} />
          </View>
        </View>

        {/* User Profile Card */}
        <View style={styles.section}>
          <GlassView style={styles.card} intensity="medium" opacity="medium">
            {isAuthenticated && user ? (
              <View style={styles.userCard}>
                <View style={[styles.avatar, { backgroundColor: colors.tint + '40' }]}>
                  <Icon name="profile" size={32} color={colors.tint} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={[textStyles.heading4, { color: colors.text }]}>
                    {user.email?.split('@')[0] || 'Usuario'}
                  </Text>
                  <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                    {user.email || 'usuario@ejemplo.com'}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.userCard}>
                <View style={[styles.avatar, { backgroundColor: colors.icon + '20' }]}>
                  <Icon name="profile" size={32} color={colors.icon} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={[textStyles.heading4, { color: colors.text }]}>Guest</Text>
                  <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                    Sign in to save preferences
                  </Text>
                </View>
              </View>
            )}
          </GlassView>
        </View>

        {/* Login/Signup Section (solo si no está autenticado) */}
        {!isAuthenticated && (
          <View style={styles.section}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
              ACCOUNT
            </Text>
            <GlassView style={styles.card} intensity="medium" opacity="medium">
              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleLogin}
                activeOpacity={0.7}>
                <View style={styles.actionContent}>
                  <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Sign in</Text>
                  <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                    Access your account
                  </Text>
                </View>
                <Icon name="profile" size={20} color={colors.icon} />
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleSignup}
                activeOpacity={0.7}>
                <View style={styles.actionContent}>
                  <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Create account</Text>
                  <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                    Create an account to start
                  </Text>
                </View>
                <Icon name="add" size={20} color={colors.icon} />
              </TouchableOpacity>
            </GlassView>
          </View>
        )}

        {/* GENERAL Section */}
        <View style={styles.section}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
              General
            </Text>
          <GlassView style={styles.card} intensity="medium" opacity="medium">
            <SettingsToggle
              label="Narration"
              value={preferences.narrationEnabled}
              onValueChange={(value) => handlePreferenceChange('narrationEnabled', value)}
              description="Audio narrations during flow"
            />
            <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
            <SettingsToggle
              label="Location"
              value={preferences.locationEnabled}
              onValueChange={(value) => handlePreferenceChange('locationEnabled', value)}
              description="Use location for nearby places"
            />
            <View style={[styles.divider, { backgroundColor: colors.icon + '20' }]} />
            <SettingsToggle
              label="Notifications"
              value={preferences.notificationsEnabled}
              onValueChange={(value) => handlePreferenceChange('notificationsEnabled', value)}
              description="Notifications about new places and flows"
            />
          </GlassView>
        </View>

        {/* LIKED SPOTS Section */}
        <View style={styles.section}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
              My content
            </Text>
          <GlassView style={styles.card} intensity="medium" opacity="medium">
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/liked-spots')}
              activeOpacity={0.7}>
              <View style={styles.actionContent}>
                    <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Liked places</Text>
                    <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                      Places you liked while moving
                    </Text>
              </View>
              <Icon name="like" size={20} color={colors.icon} />
            </TouchableOpacity>
          </GlassView>
        </View>

        {/* ACCOUNT Section (solo si está autenticado) */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.md, textTransform: 'uppercase' }]}>
              ACCOUNT
            </Text>
            <GlassView style={styles.card} intensity="medium" opacity="medium">
              <TouchableOpacity
                style={styles.actionItem}
                onPress={handleLogout}
                activeOpacity={0.7}>
                <View style={styles.actionContent}>
                    <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Sign out</Text>
                  <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                    Salir de tu cuenta
                  </Text>
                </View>
                <Icon name="close" size={20} color={colors.icon} />
              </TouchableOpacity>
            </GlassView>
          </View>
        )}

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
    marginBottom: spacing.md,
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
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
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
