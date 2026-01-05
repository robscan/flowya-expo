# Guía de Inicio - FLOWYA V1.0

**Nota histórica:** Este documento corresponde al trabajo realizado cuando el proyecto se llamaba "Mini Tours". El proyecto ahora se llama FLOWYA, pero el trabajo realizado sigue siendo válido.

**Fecha:** 2024-12-19  
**Estado anterior:** Fase V4 completada ✅

## 📋 Documentos de Referencia

1. **ESTADO_FINAL_FASE_V4.md** - Estado detallado completo del proyecto
2. **RESUMEN_FASE_V4.md** - Resumen ejecutivo de logros
3. **definitions/V4/mini_tours_mvp_plan_e4601459.plan** - Plan original completado (histórico)
4. **DEBUG_CHECKLIST.md** - Checklist de debug realizado
5. **definitions/FLOWYA V1.0/FLOWYA Product Definition V1.0.md** - Definición actual del producto

## ✅ Lo que está Completado (V4)

### Funcionalidades Core
- ✅ Sistema completo de Spots (crear, listar, guardar, like)
- ✅ Sistema completo de Paths (crear, listar, guardar)
- ✅ Flow Screen completo (estado activo de tours)
- ✅ Sistema de Narration funcional (Audio + TTS)
- ✅ Búsqueda contextual con sugerencias
- ✅ Gems (recomendaciones)
- ✅ Saved (memoria personal + timeline)
- ✅ Profile (preferencias + ajustes)

### Diseño y UI
- ✅ Sistema Glass (Apple Style) completo
- ✅ Sistema de espaciado 8px consistente
- ✅ Tipografía Inter única
- ✅ Iconos Lucide con nombres semánticos
- ✅ Dark/Light mode funcionando

### Infraestructura
- ✅ 5 Contexts funcionando (Spot, Path, Flow, Saved, Narration)
- ✅ Persistencia con AsyncStorage
- ✅ Navegación completa (tabs + modals)
- ✅ Sistema de tipos TypeScript completo

## 🎯 Áreas para Mejorar/Completar en V5

### 1. Integraciones Reales
- [ ] Mapa real (react-native-maps o expo-maps)
- [ ] Geolocalización real (reemplazar simulación)
- [ ] Sistema de fotos (cámara/galería)
- [ ] Backend/API real

### 2. Mejoras de UI/UX
- [ ] Animaciones más refinadas
- [ ] Optimización de performance (FlatList)
- [ ] Mejoras en accesibilidad
- [ ] Refinamiento visual

### 3. Funcionalidades Adicionales
- [ ] Compartir spots/paths
- [ ] Edición de spots/paths
- [ ] Sistema de fotos completo
- [ ] Notificaciones push

### 4. Testing y QA
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] QA completo

## 📁 Estructura del Proyecto

```
mini-tours-expo/
├── app/                    # Pantallas (expo-router)
│   ├── (tabs)/            # Tabs principales
│   │   ├── home.tsx       # Explore + Map
│   │   ├── gems.tsx
│   │   ├── saved.tsx
│   │   ├── search.tsx
│   │   └── profile.tsx
│   └── _layout.tsx        # Root layout
│
├── components/             # Componentes reutilizables
│   ├── ui/                # Componentes base (GlassView, Icon)
│   └── [20+ componentes]
│
├── contexts/               # Context providers
│   ├── SpotContext.tsx
│   ├── PathContext.tsx
│   ├── FlowContext.tsx
│   ├── SavedContext.tsx
│   └── NarrationContext.tsx
│
├── data/                   # Datos y modelos
│   ├── spots.ts
│   ├── paths.ts
│   └── narrations.ts
│
├── utils/                  # Utilidades
│   ├── audioManager.ts
│   ├── narrationEngine.ts
│   ├── geofencingSimulator.ts
│   ├── gemsLogic.ts
│   ├── searchLogic.ts
│   └── clearStorage.ts
│
├── constants/              # Constantes
│   ├── theme.ts
│   ├── spacing.ts
│   └── typography.ts
│
└── definitions/            # Documentación
    ├── mini_tours_mvp_plan_e4601459.plan
    └── [documentos de estado]
```

## 🔑 Archivos Clave para Entender el Proyecto

### Configuración
- `package.json` - Dependencias
- `app.json` - Configuración Expo
- `tsconfig.json` - Configuración TypeScript

### Entrada Principal
- `app/_layout.tsx` - Root layout con todos los providers

### Contextos (Estado Global)
- `contexts/SpotContext.tsx` - Gestión de Spots
- `contexts/PathContext.tsx` - Gestión de Paths
- `contexts/FlowContext.tsx` - Estado de Flow
- `contexts/SavedContext.tsx` - Sistema de afinidad
- `contexts/NarrationContext.tsx` - Sistema de narration

### Componentes Base
- `components/ui/GlassView.tsx` - Componente glass base
- `components/ui/Icon.tsx` - Sistema de iconos

### Constantes de Diseño
- `constants/theme.ts` - Colores y tema
- `constants/spacing.ts` - Sistema de espaciado 8px
- `constants/typography.ts` - Tipografía Inter

## 🚀 Comandos Útiles

```bash
# Iniciar desarrollo
npm start

# Limpiar caché (si hay problemas)
npm start -- --clear

# Limpiar datos de la app (desde Profile screen)
# O usar el botón en Profile screen
```

## 📝 Notas Importantes

1. **Mock Data**: Actualmente se usa mock data. Para producción, integrar con backend.
2. **Mapa Simple**: Implementación básica. Para V5, usar react-native-maps o expo-maps.
3. **Geofencing**: Actualmente simulado. Para V5, usar geolocalización real.
4. **Persistencia**: AsyncStorage funcionando correctamente. Listo para migrar a backend.
5. **Debug**: Se realizó debug inicial. No hay errores críticos conocidos.

## 🎨 Principios de Diseño

- **Glass Style**: Apple Style con blur y transparencia
- **Espaciado 8px**: Todos los valores deben ser múltiplos de 8
- **Tipografía Inter**: Única fuente permitida
- **Iconos Lucide**: Única librería de iconos, nombres semánticos
- **Dark/Light Mode**: Soporte completo
- **Mobile-first**: Diseño optimizado para móvil

## 📊 Estado del Código

- ✅ Sin errores de lint
- ✅ TypeScript bien tipado
- ✅ Componentes reutilizables
- ✅ Contextos bien estructurados
- ✅ Código limpio y organizado

## 🔄 Siguiente Fase

Para continuar con V5:
1. Revisar `ESTADO_FINAL_FASE_V4.md` para detalles completos
2. Revisar `RESUMEN_FASE_V4.md` para resumen ejecutivo
3. Crear nuevo plan de trabajo V5
4. Identificar prioridades y objetivos

---

**¡Listo para comenzar Fase V5!**

