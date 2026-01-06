# Migración de Mini Tours a FLOWYA

**Fecha de migración inicial:** 2024-12-19  
**Última actualización:** 2025-01-XX  
**Versión de destino:** FLOWYA V1.0

## Resumen

Este documento registra la migración del proyecto de "Mini Tours" a "FLOWYA". El cambio principal es el renombramiento del producto, manteniendo toda la funcionalidad y estructura existente.

## Cambios Realizados

### Archivos de Configuración

- **package.json**: `name` actualizado de `"mini-tours-expo"` a `"flowya-expo"` ✅
- **app.json**: 
  - `name` actualizado de `"mini-tours-expo"` a `"flowya"` ✅
  - `slug` actualizado de `"mini-tours-expo"` a `"flowya"` ✅
  - `scheme` actualizado de `"minitoursexpo"` a `"flowya"` ✅

### Storage Keys (AsyncStorage)

**Actualizado en 2025-01-XX:**

- **contexts/SpotContext.tsx**: `STORAGE_KEY` actualizado de `'@mini_tours_spots'` a `'@flowya_spots'` ✅
- **contexts/PathContext.tsx**: `STORAGE_KEY` actualizado de `'@mini_tours_flows'` a `'@flowya_flows'` ✅
- **contexts/SavedContext.tsx**: `STORAGE_KEY` actualizado de `'@mini_tours_saved'` a `'@flowya_saved'` ✅
- **app/(tabs)/profile.tsx**: `PREFERENCES_KEY` actualizado de `'@mini_tours_preferences'` a `'@flowya_preferences'` ✅
- **utils/clearStorage.ts**: Actualizado para limpiar tanto keys antiguas como nuevas (compatibilidad hacia atrás) ✅
- **CLEAR_CACHE.md**: Documentación actualizada con nuevas keys ✅

**Nota sobre compatibilidad:** El archivo `clearStorage.ts` mantiene compatibilidad hacia atrás, limpiando tanto las keys antiguas (`@mini_tours_*`) como las nuevas (`@flowya_*`) para facilitar la migración de datos existentes.

### Documentación

- **README.md**: Título actualizado a "FLOWYA" ✅
- **docs/ESTADO_PRE_UX_QA.md**: Actualizado para reflejar FLOWYA V1.0 ✅
- **ESTADO_FINAL_FASE_V4.md**: Agregada nota histórica sobre el cambio de nombre ✅
- **RESUMEN_FASE_V4.md**: Agregada nota histórica sobre el cambio de nombre ✅
- **INICIO_FASE_V5.md**: Actualizado para reflejar FLOWYA V1.0 ✅

### Nueva Estructura de Documentación

Se creó la carpeta `definitions/FLOWYA V1.0/` con:
- **FLOWYA Product Definition V1.0.md**: Nueva definición del producto basada en la definición proporcionada
- **flowya_v1.0_plan_ux_qa_lanzamiento.plan**: Plan actualizado para FLOWYA V1.0

### Archivos Históricos Preservados

Los siguientes archivos y carpetas mantienen referencias históricas a "Mini Tours" como parte del historial del proyecto:
- `definitions/V4/` - Versión histórica 4
- `definitions/V5/` - Versión histórica 5
- Documentos de estado con notas históricas agregadas

## Convenciones de Nomenclatura

- **Nombre del producto**: FLOWYA (en mayúsculas para referencias al producto)
- **Identificadores técnicos**: flowya (en minúsculas para código, slugs, schemes)
- **Referencias históricas**: Se mantienen en documentos históricos con notas aclaratorias

## Impacto en el Código

No se encontraron referencias a "Mini Tours" en el código fuente (archivos .ts, .tsx, .js, .jsx), por lo que no fue necesario actualizar código existente.

**Verificación realizada:** Búsqueda exhaustiva con grep en todos los archivos de código fuente confirmó que no hay referencias activas a "Mini Tours" en el código.

## Verificación

- ✅ Archivos de configuración actualizados (package.json, app.json)
- ✅ Storage keys actualizadas en todos los contextos
- ✅ Documentación principal actualizada
- ✅ Código fuente verificado (sin referencias encontradas en .ts, .tsx, .js, .jsx)
- ✅ Nueva estructura de documentación creada
- ✅ Documentos históricos preservados con notas
- ✅ Compatibilidad hacia atrás mantenida en clearStorage.ts

## Referencias al Trabajo Previo

Todo el trabajo realizado bajo el nombre "Mini Tours" sigue siendo válido y funcional. La migración es principalmente un cambio de nombre y actualización de documentación. Los scopes 1-11 completados previamente siguen siendo la base del proyecto FLOWYA.

## Próximos Pasos

Continuar con el Scope 0 (completado) y los Scopes 12-14 según el plan en `definitions/FLOWYA V1.0/flowya_v1.0_plan_ux_qa_lanzamiento.plan`.

