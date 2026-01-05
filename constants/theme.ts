/**
 * Sistema de temas (dark/light mode)
 * Colores y configuración base del tema
 */

// Magenta vibrante para ambos modos - transmite flow, dinamismo y exploración
// Verificado para accesibilidad: contraste suficiente en light (#fff) y dark (#151718)
const tintColorLight = '#E91E63';
const tintColorDark = '#E91E63';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
