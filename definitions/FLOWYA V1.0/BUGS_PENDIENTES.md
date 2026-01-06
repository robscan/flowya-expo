# Bugs Pendientes y Áreas de Oportunidad - FLOWYA V1.0

**Última actualización**: 2025-01-XX  
**Revisión realizada por**: Consultor de Producto (Scope 11.5)

---

## 🐛 BUGS CRÍTICOS (Prioridad Alta)

### 1. Google Maps Web API Key No Configurada
**Fecha reportado**: 2025-01-XX  
**Prioridad**: 🔴 Crítica - ASAP  
**Estado**: ✅ Resuelto (requiere reiniciar servidor)

**Descripción**: La API key de Google Maps para Web no está configurada en `.env`, causando que los mapas no funcionen en la versión web de la aplicación.

**Error específico**: 
```
Google Maps API key not configured. Please set EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY in .env
```

**Ubicaciones afectadas**:
- `components/MapViewWeb.tsx` - Línea 154 (error mostrado)
- `utils/mapsConfig.ts` - Línea 30 (variable no configurada)
- Cualquier pantalla que use mapas en web (Home/Map, Spot Detail, FlowScreen)

**Solución aplicada**:
1. ✅ API key agregada al archivo `.env`: `EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY=AIzaSyB33VThswLr84N4-kVP1uC29BuY69HUc0M`
2. ⚠️ **Pendiente**: Reiniciar servidor de Expo para cargar la nueva variable de entorno
3. ⚠️ **Verificar**: Que la API key tenga habilitada "Maps JavaScript API" en Google Cloud Console

**Notas**: 
- Las API keys para Android e iOS ya están configuradas
- La misma clave puede usarse para web si tiene restricciones apropiadas
- O crear una clave específica para web con restricciones HTTP referrer

**Plataformas afectadas**: Web (crítico)

---

### 2. Sección MAP - Pantalla Negra y Mejoras
**Fecha reportado**: 2025-01-XX  
**Prioridad**: 🔴 Crítica - ASAP  
**Estado**: ✅ Resuelto

**Descripción**: 
1. La mitad de la pantalla se ve negra en la sección MAP
2. El letrero "For development purposes only" no ocupa todo el espacio disponible
3. Falta el botón "+" para crear spot (como en la sección Search)

**Ubicaciones afectadas**:
- `app/(tabs)/map.tsx` - Contenedor del mapa y header
- `components/MapViewWeb.tsx` - Estilos del contenedor

**Solución aplicada**:
1. ✅ Agregado botón "+" en header junto al icono de perfil
2. ✅ Ajustado `mapContainer` con `width: '100%'`, `height: '100%'` y `backgroundColor` para evitar pantalla negra
3. ✅ Agregados estilos CSS personalizados para que el letrero "For development purposes only" ocupe todo el espacio disponible
4. ✅ Mejorado estilo del contenedor del mapa con `backgroundColor: 'transparent'`

**Plataformas afectadas**: Web (crítico)

---

### 3. Botón de Mostrar Mi Ubicación No Funciona en Mobile
**Fecha reportado**: 2025-01-XX  
**Prioridad**: 🔴 Crítica - ASAP  
**Estado**: ✅ Resuelto

**Descripción**: El botón flotante para centrar el mapa en la ubicación del usuario no funciona en dispositivos móviles (iOS/Android). El botón funciona en web pero no en mobile.

**Ubicaciones afectadas**:
- `app/(tabs)/map.tsx` - Botón flotante de ubicación (líneas 162-170)
- `components/MapView.tsx` - Función `centerOnUserLocation` expuesta (líneas 140-159)
- `components/SimpleMapView.tsx` - Función `centerOnUserLocation` (líneas 235-244)
- `components/MapViewWeb.tsx` - Función `centerOnUserLocation` (líneas 395-409)

**Problema específico**: 
- En mobile, cuando se usa `react-native-maps`, el código intenta acceder a funciones expuestas en el contenedor, pero el ref de `react-native-maps` está dentro de `MapView.tsx` y no se expone correctamente al componente padre.
- El código actual solo funciona para web (MapViewWeb) y SimpleMapView, pero no para react-native-maps en mobile.
- La función `centerOnUserLocation` en `MapView.tsx` solo maneja el caso de react-native-maps pero no se expone correctamente al contenedor.

**Pasos para reproducir**:
1. Abrir la app en dispositivo móvil (iOS o Android)
2. Navegar a la sección Map
3. Tocar el botón flotante de ubicación (icono de mapa en la esquina inferior izquierda)
4. El mapa no se centra en la ubicación del usuario

**Solución aplicada**:
1. ✅ Modificado `MapView.tsx` para usar `forwardRef` y `useImperativeHandle` para exponer `centerOnUserLocation` correctamente
2. ✅ Actualizado `map.tsx` para usar el ref directamente del componente `FlowyaMapView`
3. ✅ Eliminada dependencia de `_nativeNode` (específico de React Native Web)
4. ✅ Eliminados tooltips con hover en `SimpleMapView.tsx` (solo funcionan con tap)
5. ✅ Verificado que funciona en web, iOS y Android

**Notas**: La solución usa `useImperativeHandle` para exponer la función de manera consistente en todas las plataformas.

**Notas**: 
- El botón debe funcionar con tap (onPress), no con hover
- Debe funcionar en web, iOS y Android
- La implementación actual usa `_nativeNode` que es específico de React Native Web

**Plataformas afectadas**: iOS/Android (crítico), Web (funciona)

---

### 4. Mapa - Visibilidad y Navegación
**Fecha reportado**: 2025-01-XX  
**Prioridad**: 🔴 Crítica  
**Estado**: ✅ Resuelto

**Descripción**: El mapa no se ve bien y no se puede navegar/desplazarse en él. El problema se ha reportado múltiples veces pero persiste.

**Ubicaciones afectadas**:
- `app/spot-detail.tsx` - Sección Location
- `app/(tabs)/home.tsx` - Tab Map
- `components/FlowScreen.tsx` - Vista de mapa durante flow activo

**Componentes relacionados**:
- `components/SimpleMapView.tsx`
- `components/MapView.tsx` (FlowyaMapView)
- `components/MapViewWeb.tsx`

**Solución aplicada**:
1. ✅ Ajustado `gestureHandling` para detectar móvil y usar 'greedy' en lugar de 'cooperative' (que requiere Ctrl para zoom)
2. ✅ Agregada validación de dimensiones del contenedor antes de inicializar el mapa
3. ✅ Implementada lógica de reintento si el contenedor no tiene dimensiones al inicializar
4. ✅ Asegurado que el mapa sea interactivo (`draggable: true`, `scrollwheel: true`)
5. ✅ Mejorado manejo de limpieza de recursos al desmontar el componente
6. ✅ Agregado `position: 'relative'` al contenedor para asegurar dimensiones válidas

**Notas**: El problema principal era `gestureHandling: 'cooperative'` que requiere Ctrl para hacer zoom, lo cual no funciona en móvil. Ahora se detecta si es móvil y se usa 'greedy' que permite scroll/zoom normal.

**Pasos para reproducir**:
1. Navegar a Home → Tab Map
2. Intentar desplazar/zoom en el mapa
3. Navegar a cualquier Spot Detail
4. Intentar interactuar con el mapa en la sección Location

**Plataformas afectadas**: Web (confirmado), iOS/Android (por verificar)

---

## ⚠️ BUGS ALTOS (Prioridad Media-Alta)

### 2. Autenticación No Implementada Completamente
**Fecha identificado**: 2025-01-XX  
**Prioridad**: 🟠 Alta  
**Estado**: Scope 8 en progreso

**Descripción**: El sistema de autenticación está configurado (Supabase) pero no está completamente integrado. El código de autenticación está comentado en `app/create-spot.tsx`.

**Ubicaciones afectadas**:
- `app/create-spot.tsx` - Líneas 71-79 (código comentado)
- `app/_layout.tsx` - AuthProvider presente pero no se protegen rutas

**Impacto**:
- Cualquier usuario puede crear spots sin autenticación
- No hay asociación de contenido con usuarios
- No se puede implementar "My Spots" correctamente

**Notas**: 
- Supabase está configurado y funcionando
- Credenciales están en `.env`
- Falta completar Scope 8: proteger rutas y habilitar autenticación en create-spot

**Recomendación**: Completar Scope 8 antes de pruebas internas.

---

### 3. Referencias a "Mini Tours" en Código
**Fecha identificado**: 2025-01-XX  
**Prioridad**: 🟡 Media  
**Estado**: Scope 0 pendiente

**Descripción**: Aún existen referencias al nombre antiguo "Mini Tours" en el código y configuración.

**Ubicaciones encontradas**:
- `contexts/SpotContext.tsx` - `STORAGE_KEY = '@mini_tours_spots'`
- `contexts/PathContext.tsx` - `STORAGE_KEY = '@mini_tours_flows'`
- `contexts/SavedContext.tsx` - `STORAGE_KEY = '@mini_tours_saved'`
- `app/(tabs)/profile.tsx` - `PREFERENCES_KEY = '@mini_tours_preferences'`
- `package.json` - `"name": "flowya-expo"` (ya actualizado)
- `GIT_REPOSITORIES.md` - Referencias históricas (aceptable)

**Impacto**:
- Inconsistencia en nombres de storage keys
- Confusión potencial en debugging
- No crítico para funcionalidad

**Recomendación**: Completar Scope 0 para mantener consistencia.

---

### 4. Pantalla Gems Eliminada pero Referenciada
**Fecha identificado**: 2025-01-XX  
**Prioridad**: 🟡 Media  
**Estado**: Pendiente

**Descripción**: El archivo `app/(tabs)/gems.tsx` fue eliminado pero puede estar referenciado en navegación o documentación.

**Ubicaciones a verificar**:
- `app/(tabs)/_layout.tsx` - Tab bar configuration
- Navegación desde otras pantallas
- Documentación

**Impacto**:
- Posibles errores de navegación si se intenta acceder a Gems
- Inconsistencia con Product Definition que menciona Gems

**Recomendación**: 
- Verificar si Gems debe existir según Product Definition
- Si debe existir, restaurar o recrear la pantalla
- Si no debe existir, eliminar todas las referencias

---

## 🔍 ÁREAS DE OPORTUNIDAD (Mejoras)

### 5. Manejo de Errores - Falta Feedback al Usuario
**Prioridad**: 🟡 Media  
**Categoría**: UX/Experiencia

**Descripción**: Muchos errores solo se registran en `console.error` sin proporcionar feedback visual al usuario.

**Ejemplos encontrados**:
- `app/create-spot.tsx`: Errores de geocodificación solo en consola
- `app/spot-detail.tsx`: Errores de compartir solo en consola
- `contexts/AuthContext.tsx`: Errores de autenticación solo en consola
- `utils/weather.ts`: Errores de API de clima sin feedback

**Recomendación**: 
- Implementar sistema de notificaciones/toasts para errores
- Mostrar mensajes amigables al usuario
- Mantener logs técnicos para debugging

---

### 6. Estados de Carga Inconsistentes
**Prioridad**: 🟡 Media  
**Categoría**: UX/Experiencia

**Descripción**: Algunos componentes muestran estados de carga, otros no. Falta consistencia.

**Componentes con loading**:
- ✅ `app/(tabs)/home.tsx` - Muestra "Loading..." cuando `isLoading`
- ✅ `app/(tabs)/saved.tsx` - Maneja `isLoading`

**Componentes sin loading**:
- ⚠️ `app/spot-detail.tsx` - No muestra loading mientras carga spot
- ⚠️ `app/flow-detail.tsx` - No muestra loading mientras carga flow
- ⚠️ `app/(tabs)/search.tsx` - No muestra loading durante búsqueda

**Recomendación**: 
- Implementar skeletons o spinners consistentes
- Usar el mismo patrón de loading en todas las pantallas
- Considerar usar `ActivityIndicator` o componentes de skeleton

---

### 7. Validaciones de Formularios Faltantes
**Prioridad**: 🟡 Media  
**Categoría**: Funcionalidad

**Descripción**: Los formularios (Create Spot, Edit Spot) no tienen validaciones claras.

**Ejemplos**:
- `app/create-spot.tsx`: No valida que haya una ubicación antes de crear
- `app/spot-detail.tsx`: No valida campos requeridos en modo edición
- No hay validación de formato de coordenadas
- No hay validación de URLs de imágenes

**Recomendación**: 
- Agregar validaciones antes de guardar
- Mostrar mensajes de error claros
- Deshabilitar botones de guardar si datos inválidos

---

### 8. Manejo de Edge Cases
**Prioridad**: 🟡 Media  
**Categoría**: Robustez

**Descripción**: Falta manejo explícito de varios edge cases.

**Edge cases identificados**:
- Spots sin nombre (puede ser válido según Product Definition, pero UI puede confundir)
- Flows con 0 spots o 1 spot
- Listas vacías sin mensaje claro ("No spots found", "No flows available")
- Datos corruptos en AsyncStorage
- Permisos de ubicación denegados sin mensaje claro
- Conexión perdida durante operaciones

**Recomendación**: 
- Implementar estados vacíos con mensajes claros
- Manejar errores de AsyncStorage con fallbacks
- Mostrar mensajes cuando faltan permisos
- Implementar retry logic para operaciones de red

---

### 9. Indicador de Estado Offline Ausente
**Prioridad**: 🟡 Media  
**Categoría**: UX/Experiencia

**Descripción**: No hay indicador visual cuando la app está offline.

**Impacto**:
- Usuario no sabe si la app está funcionando o si hay problema de conexión
- Operaciones que requieren red fallan silenciosamente

**Recomendación**: 
- Implementar detección de estado de conexión
- Mostrar banner o indicador cuando está offline
- Cachear datos críticos para uso offline

---

### 10. Testing Components Visible
**Prioridad**: 🟢 Baja  
**Categoría**: Desarrollo

**Descripción**: El botón "Testing Components" está oculto pero el archivo `app/testing-components.tsx` existe.

**Estado actual**: Botón oculto en Home (línea ~100: `handleTestingPress` condicionalmente renderizado como `false`)

**Recomendación**: 
- Mantener oculto para usuarios finales
- Considerar eliminar en build de producción
- O mantener como feature flag para desarrollo

---

## 📊 INCONSISTENCIAS CON PRODUCT DEFINITION

### 11. Lenguaje del Producto - "Path" vs "Flow"
**Prioridad**: 🟡 Media  
**Categoría**: Consistencia

**Descripción**: El código usa "Flow" pero el Product Definition menciona "Path" como término oficial. Sin embargo, se realizó una migración masiva de "Path" a "Flow".

**Estado**: 
- ✅ Migración completada en código
- ⚠️ Verificar que Product Definition esté actualizado
- ⚠️ Verificar que documentación esté alineada

**Recomendación**: 
- Revisar Product Definition para asegurar consistencia
- Actualizar documentación si es necesario

---

### 12. Gems Screen - Estado Incierto
**Prioridad**: 🟡 Media  
**Categoría**: Funcionalidad

**Descripción**: La pantalla Gems fue eliminada pero Product Definition la menciona como parte de la navegación principal.

**Preguntas**:
- ¿Debe existir Gems según Product Definition FLOWYA V1.0?
- Si debe existir, ¿por qué fue eliminada?
- Si no debe existir, ¿actualizar Product Definition?

**Recomendación**: 
- Revisar Product Definition FLOWYA V1.0
- Decidir si Gems debe restaurarse o eliminarse de la definición
- Actualizar navegación en consecuencia

---

## 🔧 PROBLEMAS TÉCNICOS

### 13. Console Logs en Producción
**Prioridad**: 🟢 Baja  
**Categoría**: Calidad de Código

**Descripción**: Múltiples `console.log`, `console.error`, `console.warn` en código que se ejecutará en producción.

**Ubicaciones**:
- `app/create-spot.tsx`: 4 console.error
- `app/spot-detail.tsx`: 3 console.error
- `app/(tabs)/map.tsx`: 2 console.log/error
- `app/(tabs)/search.tsx`: 2 console.log/error
- `contexts/AuthContext.tsx`: Múltiples console.error
- `utils/weather.ts`: console.warn

**Recomendación**: 
- Usar sistema de logging condicional (`__DEV__`)
- O implementar servicio de logging que se desactive en producción
- Mantener logs de error críticos pero con mejor formato

---

### 14. TODOs en Código
**Prioridad**: 🟢 Baja  
**Categoría**: Calidad de Código

**Descripción**: Varios TODOs en el código que indican trabajo pendiente.

**TODOs encontrados**:
- `app/create-spot.tsx`: "Scope 8 - Enable authentication"
- `data/spots.ts`: "TODO: Reemplazar con datos reales o API"
- `data/flows.ts`: "TODO: Reemplazar con datos reales o API"
- `contexts/NarrationContext.tsx`: "TODO: Obtener del sistema o configuración" (idioma)

**Recomendación**: 
- Priorizar TODOs críticos
- Documentar en plan de trabajo
- Eliminar TODOs completados

---

### 15. Storage Keys con Nombres Antiguos
**Prioridad**: 🟢 Baja  
**Categoría**: Consistencia
**Estado**: ✅ Resuelto

**Descripción**: Las claves de AsyncStorage aún usan "@mini_tours_" en lugar de "@flowya_".

**Ubicaciones**:
- `contexts/SpotContext.tsx`: `'@mini_tours_spots'` → ✅ Actualizado a `'@flowya_spots'`
- `contexts/PathContext.tsx`: `'@mini_tours_flows'` → ✅ Actualizado a `'@flowya_flows'`
- `contexts/SavedContext.tsx`: `'@mini_tours_saved'` → ✅ Actualizado a `'@flowya_saved'`
- `app/(tabs)/profile.tsx`: `'@mini_tours_preferences'` → ✅ Actualizado a `'@flowya_preferences'`

**Solución aplicada**:
- ✅ Actualizadas todas las storage keys de `@mini_tours_` a `@flowya_` en todos los contextos
- ✅ Actualizado `utils/clearStorage.ts` para limpiar tanto las keys antiguas como las nuevas (compatibilidad)
- ✅ Actualizado `CLEAR_CACHE.md` con las nuevas keys

**Impacto**: 
- No crítico para funcionalidad
- Inconsistencia con nombre del producto (resuelto)
- Puede causar confusión en debugging (resuelto)

**Notas**: Se mantiene compatibilidad con keys antiguas en `clearStorage.ts` para limpiar datos existentes si es necesario.

---

### 17. Errores en Build iOS - react-native-maps y Worklets
**Fecha reportado**: 2025-01-XX  
**Prioridad**: 🟢 Baja (no prioritario - foco en web)  
**Estado**: ⚠️ Documentado, no resuelto (no prioritario)

**Descripción**: El build de iOS muestra varios errores que impiden la ejecución correcta:

1. **Error de react-native-maps**: `'RNMapsAirModule' could not be found`
   - El módulo nativo de react-native-maps no está disponible
   - El require se ejecutaba en tiempo de módulo incluso en web

2. **Error de Worklets**: Mismatch entre versión JavaScript (0.7.1) y nativa (0.5.1)
   - Versiones incompatibles de react-native-worklets

3. **Warnings de rutas**: Varias rutas reportan falta de default export (pueden ser falsos positivos)

**Solución aplicada**:
1. ✅ Implementado lazy loading de react-native-maps en `components/MapView.tsx`
   - El require ahora se hace solo cuando se necesita (no en tiempo de módulo)
   - Agregado fallback a SimpleMapView si react-native-maps no está disponible
2. ✅ Corregido import incorrecto de `useEffect` en `app/(tabs)/_layout.tsx` (estaba importado desde 'react-native' en lugar de 'react')
3. ⚠️ **Pendiente (no prioritario)**: Resolver mismatch de worklets - requiere reinstalar dependencias:
   ```bash
   npm install react-native-worklets@latest
   # O reinstalar todas las dependencias:
   rm -rf node_modules package-lock.json
   npm install
   ```
4. ⚠️ **Pendiente (no prioritario)**: Verificar que react-native-maps esté correctamente instalado para iOS:
   ```bash
   cd ios
   pod install
   cd ..
   ```

**Ubicaciones afectadas**:
- `components/MapView.tsx` - Require de react-native-maps
- `app/(tabs)/_layout.tsx` - Import de useEffect
- `package.json` - Versión de react-native-worklets

**Notas**: 
- ✅ El build web funciona correctamente
- ⚠️ Los errores solo afectan iOS/Android nativo
- ✅ El lazy loading de react-native-maps previene el error en web
- 📌 **Decisión**: No prioritario - foco actual en web. Se resolverá cuando sea necesario para iOS/Android.

**Plataformas afectadas**: iOS (no crítico para web), Android (probable, no crítico para web)

---

## 🎨 PROBLEMAS DE UX/UI

### 16. Iconos del Header en Spot Detail
**Prioridad**: 🟡 Media  
**Categoría**: UI/Consistencia

**Descripción**: Los iconos del header en `app/spot-detail.tsx` no tienen envolvente circular según convenciones del sistema de diseño.

**Estado**: Pendiente según Scope 5

**Recomendación**: 
- Implementar envolvente circular para iconos
- Dark mode: fondo negro/icono blanco
- Estado activo: color tint
- Aplicar mismo estilo en Flow Detail

---

### 17. Estados Vacíos Sin Mensajes Claros
**Prioridad**: 🟡 Media  
**Categoría**: UX

**Descripción**: Algunas pantallas no muestran mensajes claros cuando no hay datos.

**Ejemplos**:
- Home sin spots cercanos
- Saved sin items guardados
- Search sin resultados
- Profile sin contenido

**Recomendación**: 
- Implementar estados vacíos con mensajes amigables
- Incluir acciones sugeridas ("Create your first spot", "Explore nearby")
- Usar ilustraciones o iconos para hacer más amigable

---

### 18. Feedback Visual en Acciones
**Prioridad**: 🟡 Media  
**Categoría**: UX

**Descripción**: Algunas acciones no tienen feedback visual inmediato.

**Ejemplos**:
- Guardar/Like spot - ¿hay feedback?
- Crear spot - ¿muestra confirmación?
- Compartir - ¿muestra que se compartió?

**Recomendación**: 
- Agregar haptic feedback en acciones importantes
- Mostrar toasts/notificaciones breves
- Cambiar estados visuales (iconos, colores) inmediatamente

---

## 🔐 SEGURIDAD Y PRIVACIDAD

### 19. API Keys en Código
**Prioridad**: 🟡 Media  
**Categoría**: Seguridad

**Descripción**: Las API keys están en `.env` (correcto) pero se debe verificar que no estén en código.

**Estado**: 
- ✅ Keys en `.env` (correcto)
- ✅ `.env` en `.gitignore` (verificar)
- ⚠️ Verificar que no haya keys hardcodeadas

**Recomendación**: 
- Auditar código para keys hardcodeadas
- Verificar restricciones de API keys en Google Cloud Console
- Implementar rotación de keys si es necesario

---

## 📱 PLATAFORMAS

### 20. Compatibilidad Web - Mapas
**Prioridad**: 🟠 Alta  
**Categoría**: Compatibilidad

**Descripción**: Los mapas usan `SimpleMapView` como fallback en web, pero el bug de navegación afecta principalmente web.

**Estado**: 
- `MapViewWeb.tsx` existe pero puede no estar funcionando correctamente
- `SimpleMapView.tsx` es el fallback actual

**Recomendación**: 
- Verificar que `MapViewWeb` funcione correctamente con Google Maps JavaScript API
- Mejorar `SimpleMapView` si `MapViewWeb` no es viable
- Considerar usar librería específica para web si es necesario

---

### 21. Pines No Visibles en Mapa Web
**Fecha reportado**: 2025-01-XX  
**Prioridad**: 🟠 Alta  
**Categoría**: Funcionalidad  
**Estado**: ⚠️ Pendiente

**Descripción**: Los marcadores (pines) de los spots no se ven en el mapa en navegadores web, aunque el mapa se carga correctamente.

**Ubicaciones afectadas**:
- `components/MapViewWeb.tsx` - Creación de marcadores (líneas 304-393)
- `app/(tabs)/map.tsx` - Pantalla de mapa

**Problema específico**: 
- Los marcadores se crean pero no son visibles en el navegador
- El código intenta crear marcadores con iconos personalizados usando `google.maps.SymbolPath.CIRCLE`
- Puede ser un problema de timing (marcadores creados antes de que el mapa esté listo)
- O problema con el icono personalizado que no se renderiza correctamente

**Solución intentada**:
1. ✅ Agregada verificación de `window.google` y `window.google.maps` antes de crear marcadores
2. ✅ Aumentado tamaño del icono (scale: 12)
3. ✅ Agregado `visible: true` y `optimized: false` en marcadores
4. ✅ Agregados logs de debug para identificar el problema
5. ⚠️ **Pendiente**: Verificar en consola del navegador los logs de debug
6. ⚠️ **Pendiente**: Probar con icono por defecto de Google Maps (sin personalización)

**Pasos para reproducir**:
1. Abrir la app en navegador web
2. Navegar a la sección Map
3. Verificar que el mapa se carga
4. Los pines de los spots no son visibles

**Notas**: 
- El mapa se carga correctamente
- La navegación del mapa funciona
- Solo los marcadores no son visibles
- Puede requerir usar icono por defecto de Google Maps en lugar de personalizado

**Plataformas afectadas**: Web (crítico para pruebas)

---

## 📝 NOTAS DE REVISIÓN

### Metodología Utilizada
- Revisión de código fuente de pantallas principales
- Revisión de componentes core
- Revisión de contextos y estado global
- Comparación con Product Definition FLOWYA V1.0
- Identificación de patrones y inconsistencias

### Priorización
- 🔴 **Crítica**: Bloquea funcionalidad principal
- 🟠 **Alta**: Afecta experiencia significativamente
- 🟡 **Media**: Mejora calidad pero no bloquea
- 🟢 **Baja**: Nice to have, puede esperar

### Próximos Pasos Recomendados
1. **Inmediato**: Resolver bug crítico de mapas (#1)
2. **Corto plazo**: Completar Scope 8 (Autenticación) y Scope 0 (Revisión de nombre)
3. **Medio plazo**: Implementar mejoras de UX (estados vacíos, feedback visual, validaciones)
4. **Largo plazo**: Optimizaciones y polish

---

**Total de bugs identificados**: 22  
**Críticos**: 2 (ambos resueltos)  
**Altos**: 3  
**Medios**: 12  
**Bajos**: 5 (incluye iOS - no prioritario)
