# Lineamientos de Diseño V5 - Basado en Referencias Visuales

## Análisis de Referencias

### Apple Music (Referencia Principal)
- **Glass Effect**: Volumen y profundidad, no hueco
- **Elementos flotantes**: Tab nav bar y player flotan sobre el contenido
- **Estados activos**: Claramente diferenciados con color y fondo
- **Sombreado**: Sutil para crear elevación
- **Organización**: Sidebar con secciones claramente definidas

### DarkMode/LightMode (Componentes Similares)
- **Organización de información**: Jerarquía clara, espaciado generoso
- **Cards**: Con glass effect y elevación sutil
- **Estados**: Visualmente diferenciados
- **Contenido**: Similar a nuestros componentes (spots, paths, etc.)

---

## Lineamientos Generales

### 1. Glass Effect (Volumen, no hueco)

**Características:**
- Blur con intensidad media-alta (35-45)
- Opacidad alta (0.85-0.95) para crear sensación de volumen
- Sombra sutil para elevación
- Borde sutil (no grueso) para definición
- **Glow interno**: Efecto de resplandor de luz reflejado en el borde superior

**Implementación:**
```typescript
// Glass con volumen
- Blur intensity: 35-45
- Opacity: 0.85-0.95
- Shadow: sutil (elevación)
- Border: 1px, muy sutil (rgba con 0.1)
- Glow interno: Borde superior degradado (blanco muy sutil que se degrada)
```

**Glow Interno:**
- Simula el reflejo de luz en el borde del objeto glass
- Más visible en el centro superior, se degrada hacia los lados
- Color: Blanco con opacidad degradada (0.3 → 0.15 → 0.05)
- Light mode: Más visible
- Dark mode: Más sutil pero presente

### 2. Elevación y Sombreado

**Principios:**
- Elementos flotantes (tab bar, player, modales) tienen sombra
- Sombra sutil, no agresiva
- Múltiples niveles de elevación según jerarquía

**Niveles de elevación (ajustados según análisis):**
- **Nivel 1 (subtle)**: Contenidos normales y resaltados - sombra sutil
- **Nivel 2 (medium)**: Elementos flotantes (tab bar, player) - sombra media
- **Nivel 3 (strong)**: Modales, drawers - sombra más pronunciada

### 3. Estados Activos

**Características:**
- Color de acento claro (rojo en Apple Music)
- Fondo diferenciado (rectángulo redondeado)
- Texto en color de acento cuando está activo
- Transición suave entre estados

### 4. Espaciado y Organización

**Principios:**
- Espaciado generoso entre elementos
- Secciones claramente separadas
- Padding interno consistente (16-24px)
- Gaps entre elementos (8-16px)

### 5. Border Radius

**Principios:**
- Bordes redondeados moderados (8-16px)
- Cards: 12-16px
- Botones/Elementos pequeños: 8px
- Modales/Drawers: 16-24px en esquinas superiores

### 6. Tipografía

**Basado en referencias:**
- Tamaños claramente diferenciados
- Pesos: Regular para cuerpo, Medium/Semibold para títulos
- Line-height generoso para legibilidad
- Jerarquía visual clara

### 7. Elementos Flotantes

**Tab Bar:**
- Flota sobre el contenido
- Glass effect con blur
- Sombra sutil para elevación
- Altura: 64-80px (múltiplo de 8)

**Player (Mini/Full):**
- Flota sobre el contenido
- Glass effect pronunciado
- Sombra para elevación
- Transiciones suaves al expandir/colapsar

### 8. Cards y Contenedores

**Características:**
- Glass effect con volumen
- Border radius: 12-16px
- Padding interno: 16-24px
- Sombra sutil para elevación
- Espaciado entre cards: 16px

---

## Propuesta de Implementación

### Actualización de Tokens de Diseño

**Glass Styles:**
- Aumentar opacidad base a 0.90-0.95
- Ajustar blur intensity a 30-40 por defecto
- Agregar sistema de sombras

**Espaciado:**
- Mantener sistema base 8px
- Ajustar paddings de cards a 16-24px
- Gaps entre elementos: 8-16px

**Border Radius:**
- Cards: 16px
- Botones: 8px
- Modales: 24px (esquinas superiores)
- Elementos pequeños: 8px

**Sombras:**
- Nivel 1 (sutil): `shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4`
- Nivel 2 (medio): `shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8`
- Nivel 3 (pronunciado): `shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16`

### Componentes a Actualizar

1. **GlassView**: Agregar soporte para sombras y ajustar opacidad
2. **Tab Bar**: Implementar flotación y sombra
3. **Cards**: Ajustar border radius, padding, y agregar sombra
4. **Player**: Implementar flotación y sombra
5. **Modales/Drawers**: Ajustar border radius y sombra

---

## Próximos Pasos

1. Implementar actualizaciones en tokens de diseño
2. Actualizar GlassView con soporte de sombras
3. Aplicar lineamientos a componentes base
4. Revisar componente por componente con referencias específicas de Stitch

