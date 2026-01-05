# Revisión de Componentes - V5

## Proceso de Revisión

Para cada componente:
1. Usuario comparte referencias visuales (Stitch)
2. Analizar referencias y comparar con implementación actual
3. Ajustar componente según referencias (paddings, gaps, border radius, comportamiento, etc.)
4. Revisar y validar
5. Marcar como completado y pasar al siguiente

---

## Estado de Revisión

### ✅ Completados
- **GlassView** - Características estándar definidas (fondo gris, glow, sombras)
- **Cards** - SpotCard, GemsSpotCard, GemsPathCard, PathCard (completados)

### 🔄 En Progreso
- (Ninguno actualmente)

### ⏳ Pendientes

#### Componentes Base
- [ ] Icon

#### Cards
- [x] SpotCard ✅
- [x] PathCard ✅
- [x] PathSpotCard ✅
- [x] SearchResultCard ✅ (wrapper, no necesita revisión directa)

#### Pantallas Principales
- [ ] Home (Explore y Map tabs)
- [ ] Gems
- [ ] Saved
- [ ] Search
- [ ] Profile

#### Flow
- [ ] FlowScreen
- [ ] FlowMiniPlayer 🔄
- [ ] FlowFullPlayer

#### Modales/Drawers
- [ ] SpotDetailSheet
- [ ] CreateSpotModal

#### Map
- [ ] SimpleMapView
- [ ] MapSpotMarker

#### Navegación
- [ ] Tab Bar 🔄

---

## Notas por Componente

### GlassView
**Estado:** ✅ Características Estándar Definidas
**Referencias:** Apple Music - Inicio.PNG analizado
**Ajustes realizados:**
- ✅ Sistema de sombras implementado (subtle, medium, strong)
- ✅ Glow interno agregado (efecto de resplandor de luz reflejado)
- ✅ Opacidades ajustadas para volumen (0.85-0.95)
- ✅ Blur intensity aumentado (35-45)
- ✅ Fondo gris sutil para todos los componentes
- ✅ Características estándar establecidas

---

## Características Estándar Establecidas ✅

### GlassView - Sistema Base
- **Fondo**: Gris sutil (`backgroundGray`) para todos los componentes
- **Glow**: Activado por defecto (`enableGlow={true}`)
- **Sombras**:
  - `subtle` - Cards
  - `medium` - TabBar y Players
  - `strong` - Modales y Drawers
- **Border Radius**: 16px para cards (múltiplos de 8px)

---

## Revisión de Cards ✅

### Completado

Todas las cards han sido revisadas y ajustadas según las referencias visuales proporcionadas:

#### SpotCard ✅
- **Ubicación**: `components/SpotCard.tsx`
- **Estado**: Completado
- **Ajustes realizados**:
  - Ancho reducido (90%, maxWidth 400px)
  - Separación de funcionalidades (Save en card, Like en player)
  - Reorganización de layout (tag sobre imagen, bookmark sobre imagen, distancia en footer)
  - Textos traducidos a inglés
  - Ajustes de tipografía y espaciado (8px rule)
  - Divider sutil antes del footer

#### PathCard ✅
- **Ubicación**: `components/PathCard.tsx`
- **Estado**: Completado
- **Ajustes realizados**:
  - Chip de tipo de tour movido a la derecha del título
  - Metadata (tiempo, distancia, spots) debajo del título con iconos
  - Líneas verticales sutiles entre cada dato
  - Textos traducidos a inglés
  - Colores de movimiento mode en tokens centralizados
  - Espaciado ajustado (8px rule)

#### GemsSpotCard ✅
- **Ubicación**: `components/GemsSpotCard.tsx`
- **Estado**: Completado (usando estándares de GlassView)

#### GemsPathCard ✅
- **Ubicación**: `components/GemsPathCard.tsx`
- **Estado**: Completado (usando estándares de GlassView)

---

