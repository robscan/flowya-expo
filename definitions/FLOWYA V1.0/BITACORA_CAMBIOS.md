# Bitácora de Cambios - FLOWYA V1.0

Este documento registra todos los cambios, mejoras y ajustes realizados durante el desarrollo de FLOWYA V1.0.

---

## 2024-12-19 - Migración de Mini Tours a FLOWYA

### Cambios de Nombre
- ✅ Migración completa del nombre del producto de "Mini Tours" a "FLOWYA"
- ✅ Actualización de `package.json`: nombre cambiado a "flowya-expo"
- ✅ Actualización de `app.json`: name, slug y scheme actualizados a "flowya"
- ✅ Actualización de `README.md`: título cambiado a "FLOWYA"
- ✅ Actualización de documentación principal
- ✅ Creación de carpeta `definitions/FLOWYA V1.0/` con nueva definición del producto

### Documentación
- ✅ Creación de `FLOWYA Product Definition V1.0.md`
- ✅ Creación de `flowya_v1.0_plan_ux_qa_lanzamiento.plan`
- ✅ Creación de `docs/MIGRACION_MINI_TOURS_A_FLOWYA.md`

---

## 2024-12-19 - Mejoras de UI/UX

### Home Screen
- ✅ Título actualizado: "Home" → "FLOWYA - Home"
- ✅ Mover botón "Testing Components" más arriba (de `bottom: spacing.xl` a `top: spacing.lg`)

### FlowScreen - Mejoras Principales
- ✅ Agregar botones de minimizar y cerrar en header (junto a "NOW MOVING")
- ✅ Implementar listado de spots con drag and drop en vista "List" (usando PathSpotCard)
  - Spot actual destacado arriba
  - Listado de spots futuros debajo con PathSpotCard
  - Cálculo de distancia a cada spot
- ✅ Implementar diálogo de guardar Path al cerrar (Alert con opciones: "Guardar Path", "Cerrar sin guardar", "Cancelar")
- ✅ Implementar funcionalidad de minimizar (oculta FlowScreen, muestra FlowMiniPlayer)
- ✅ Implementar funcionalidad de cerrar (regresa a pantalla de origen con router.back())
- ✅ Agregar estado `isMinimized` en FlowContext
- ✅ Agregar funciones `minimizeFlow()` y `expandFlow()` en FlowContext
- ✅ Actualizar FlowMiniPlayer para expandir FlowScreen al tocar (llama a expandFlow())
- ✅ Agregar icono "minimize" al sistema de iconos (keyboard-arrow-down)

### FlowMiniPlayer - Ajustes de Diseño y Controles
- ✅ Cambiar a fullwidth: eliminar márgenes laterales (left: 0, right: 0 en lugar de spacing.md)
- ✅ Eliminar bordes redondeados: borderRadius: 0 para fusionarse con viewport
- ✅ Reemplazar botón de navegación por botón play/pause central:
  - Icono dinámico según estado (play cuando paused, pause cuando active)
  - Implementa pauseFlow() y resumeFlow()
- ✅ Implementar controles funcionales:
  - Atrás: previousSpot() para navegar al spot anterior
  - Adelante: nextSpot() para navegar al spot siguiente
- ✅ Asegurar que todos los controles usan stopPropagation para no expandir el player
- ✅ Tap en área general del player sigue expandiendo FlowScreen (expandFlow)

### Renombrado Masivo: Path → Flow
- ✅ Renombrado completo de "Path" a "Flow" en todo el codebase
- ✅ `data/paths.ts` → `data/flows.ts` (tipos, funciones, datos mock)
- ✅ `PathContext` internamente renombrado a usar "Flow" (con aliases temporales)
- ✅ `FlowContext` actualizado para usar `getFlowById` y `currentFlowId`
- ✅ `SavedContext` actualizado: `savedFlows`, `visitedFlows` (con aliases)
- ✅ Componentes: `PathCard` → `FlowCard`, `PathSpotCard` → `FlowSpotCard`
- ✅ Actualización de todos los imports y usos en pantallas (home, gems, saved, search, testing-components, flow-full-player)
- ✅ UI texts actualizados: "Nearby - Paths" → "Nearby - Flows", "Path" → "Flow"
- ✅ Corrección de bug en `FlowCard.tsx`: `calculatePathDistance` ahora recibe parámetros correctos

### Home Screen - Degradado de Clima
- ✅ Integración de degradado sutil basado en condiciones climáticas
- ✅ Sistema de utilidades de clima (`utils/weather.ts`)
  - Función `getWeatherCondition()` con cache de 30 minutos
  - Función `getWeatherGradientColor()` que mapea condiciones a colores sutiles
- ✅ Colores definidos:
  - `clear`: Amarillo dorado suave (soleado)
  - `clouds`: Gris suave (nublado)
  - `rain`: Azul grisáceo (lluvia)
  - `snow`: Blanco/azul claro (nevado)
  - `thunderstorm`: Gris oscuro (tormenta)
  - `mist/fog`: Gris pálido (niebla)
  - `drizzle`: Azul suave (llovizna)
  - `night-clouds`: Gris azulado/morado oscuro muy sutil (noche con nubes) - `rgba(80, 90, 140, 0.08)` en dark mode, `rgba(100, 110, 150, 0.06)` en light mode
- ✅ Degradado aplicado en la parte superior de Home screen (300px de altura)
- ✅ Degradado se superpone sutilmente al fondo (dark/light mode)

### FlowScreen - Corrección Botón Cerrar
- ✅ Botón X (cerrar) simplificado para cerrar flow directamente
- ✅ Eliminado diálogo de alerta (se cerrará directamente)
- ✅ `handleClose()` ahora solo ejecuta `endFlow()` y `router.back()`

---

## Formato de Entradas

Cada entrada debe incluir:
- **Fecha**: Fecha del cambio (YYYY-MM-DD)
- **Categoría**: Tipo de cambio (UI/UX, Funcionalidad, Bug Fix, Documentación, etc.)
- **Descripción**: Descripción clara del cambio
- **Estado**: ✅ Completado, 📝 Pendiente, 🔄 En progreso, ⚠️ Bloqueado

---

## Notas

- Los cambios se registran en orden cronológico (más recientes primero)
- Se mantiene un registro de cambios pendientes para seguimiento
- Los cambios críticos o que afectan funcionalidad principal se marcan claramente

