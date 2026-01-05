/**
 * Sistema de Iconos - MaterialIcons (@expo/vector-icons)
 * Iconos filled para mejor visibilidad en dark mode
 * Nombres semánticos, NO nombres técnicos de la librería
 */

import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

/**
 * Mapeo de nombres semánticos a nombres de iconos MaterialIcons
 * Ejemplos: icon.like, icon.notMyVibe, icon.map, icon.audio
 */
export const iconMap = {
  like: 'favorite',
  bookmark: 'bookmark',
  map: 'place',
  clock: 'access-time',
  audio: 'volume-up',
  play: 'play-arrow',
  pause: 'pause',
  next: 'skip-next',
  previous: 'skip-previous',
  close: 'close',
  more: 'more-vert',
  search: 'search',
  mic: 'mic',
  gems: 'diamond', // o 'auto-awesome' si prefieres
  explore: 'explore',
  saved: 'bookmark',
  profile: 'person',
  edit: 'edit',
  share: 'share',
  back: 'arrow-back',
  mute: 'volume-off',
  home: 'home',
  notMyVibe: 'thumb-down',
  navigation: 'navigation',
  add: 'add',
  star: 'star',
  'chevron-down': 'keyboard-arrow-down',
  sun: 'wb-sunny',
  camera: 'camera-alt',
  money: 'attach-money',
  paw: 'pets',
  accessibility: 'accessible',
  menu: 'more-vert',
  report: 'flag',
  delete: 'delete',
  minimize: 'keyboard-arrow-down',
} as const;

export type IconName = keyof typeof iconMap;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

/**
 * Componente Icon con nombres semánticos
 * Todos los iconos accionables deben estar en contenedor ≥ 48px x 48px
 */
export function Icon({ name, size = 24, color = '#000', style }: IconProps) {
  const iconName = iconMap[name];

  if (!iconName) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  return <MaterialIcons name={iconName} size={size} color={color} style={style} />;
}

/**
 * Helper para crear contenedor táctil para iconos accionables
 * Área mínima: 48px x 48px (múltiplo de 8px)
 */
export const iconTouchableContainer = StyleSheet.create({
  base: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
