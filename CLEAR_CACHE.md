# Cómo Limpiar la Caché y Datos

## Opción 1: Usar el botón en la app (Recomendado)

1. Abre la app
2. Ve a **Profile** (desde cualquier header)
3. Toca el botón **"🗑️ Limpiar Todos los Datos"**
4. Confirma la acción
5. Recarga la app (cierra y vuelve a abrir, o usa shake gesture → "Reload")

## Opción 2: Limpiar desde la consola/terminal

### Limpiar AsyncStorage (datos guardados)

Si estás usando Expo Go o un dispositivo físico, puedes ejecutar este código en la consola de React Native Debugger o Metro:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.multiRemove(['@flowya_spots', '@flowya_flows', '@flowya_saved', '@flowya_preferences']);
```

### Limpiar caché de Metro/Expo

```bash
# Limpiar caché de Metro
npx expo start --clear

# O si usas npm/yarn
npm start -- --clear
# yarn start --clear
```

### Limpiar todo (recomendado después de cambios grandes)

```bash
# 1. Detener el servidor Metro (Ctrl+C)

# 2. Limpiar caché de Metro
rm -rf node_modules/.cache
rm -rf .expo

# 3. Limpiar caché de Expo
npx expo start --clear

# 4. En iOS Simulator: Device > Erase All Content and Settings
# 5. En Android Emulator: Settings > Apps > Expo Go > Storage > Clear Data
# 6. O reinstala la app completamente
```

## Opción 3: Limpiar datos de la app manualmente

### iOS Simulator
1. Device > Erase All Content and Settings
2. O reinstala la app

### Android Emulator
1. Settings > Apps > Expo Go (o tu app) > Storage > Clear Data
2. O reinstala la app

### Dispositivo Físico
1. Desinstala y reinstala la app
2. O Settings > Apps > [Tu App] > Storage > Clear Data

## Verificar que funcionó

Después de limpiar:
1. La app debería mostrar los 8 spots mock (no solo 1)
2. Deberías ver 3 paths disponibles
3. Los likes/saves deberían empezar desde cero
4. Al tocar like/bookmark, debería cambiar de color inmediatamente

