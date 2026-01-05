# Muestra: Degradado "Noche con Nubes"

## Descripción

Este documento muestra cómo se vería el degradado de clima para la condición "noche con nubes" en la pantalla Home de FLOWYA.

## Color Definido

La condición `night-clouds` utiliza un degradado sutil de color gris azulado/morado oscuro que evoca un cielo nocturno con nubes.

### Valores RGBA

- **Dark Mode**: `rgba(80, 90, 140, 0.08)`
  - R: 80 (tono rojo muy bajo)
  - G: 90 (tono verde bajo)
  - B: 140 (tono azul medio-alto, evoca cielo nocturno)
  - Alpha: 0.08 (8% de opacidad - muy sutil)

- **Light Mode**: `rgba(100, 110, 150, 0.06)`
  - R: 100 (tono rojo bajo, ligeramente más claro)
  - G: 110 (tono verde bajo-medio)
  - B: 150 (tono azul medio, más claro que dark mode)
  - Alpha: 0.06 (6% de opacidad - muy sutil)

## Características Visuales

- **Efecto**: Degradado nebuloso que se superpone sutilmente al fondo
- **Ubicación**: Parte superior de la pantalla Home (primeros 300px)
- **Transición**: El degradado va de opaco a transparente (locations: [0, 0.5])
- **Intensidad**: Muy sutil (5-8% de opacidad) para no competir con el contenido

## Comparación con Otros Colores

| Condición | Dark Mode | Light Mode | Sensación |
|-----------|-----------|------------|-----------|
| **night-clouds** | `rgba(80, 90, 140, 0.08)` | `rgba(100, 110, 150, 0.06)` | Cielo nocturno con nubes |
| clouds (día) | `rgba(150, 150, 150, 0.06)` | `rgba(150, 150, 150, 0.04)` | Nublado neutro |
| clear (soleado) | `rgba(255, 235, 180, 0.08)` | `rgba(255, 235, 180, 0.06)` | Amanecer/atardecer |
| rain (lluvia) | `rgba(150, 180, 220, 0.08)` | `rgba(150, 180, 220, 0.06)` | Lluvioso |
| snow (nevado) | `rgba(200, 220, 255, 0.08)` | `rgba(200, 220, 255, 0.06)` | Nevado |

## Implementación Técnica

El color se aplica usando `LinearGradient` de `expo-linear-gradient`:

```tsx
<LinearGradient
  colors={[gradientColor, 'transparent']}
  locations={[0, 0.5]}
  style={styles.weatherGradient}
  pointerEvents="none"
/>
```

Donde `gradientColor` es el resultado de `getWeatherGradientColor('night-clouds', colorScheme)`.

## Notas de Diseño

- El color está diseñado para ser **muy sutil** y no distraer del contenido
- Mantiene la coherencia con el sistema de diseño de FLOWYA (colores nebulosos y sutiles)
- El tono azulado/morado oscuro evoca la atmósfera de una noche con nubes sin ser demasiado dramático
- Se integra perfectamente tanto en modo oscuro como claro

