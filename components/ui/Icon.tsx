/**
 * Sistema de Iconos - Lucide React Native
 * CRÍTICO: Lucide como ÚNICA librería de iconos
 * Nombres semánticos, NO nombres técnicos de la librería
 */

import {
    ArrowLeft,
    Bookmark,
    Compass,
    Edit,
    Heart,
    Home,
    MapPin,
    Mic,
    MoreVertical,
    Pause,
    Play,
    Search,
    Share,
    SkipBack,
    SkipForward,
    Sparkles,
    ThumbsDown,
    User,
    Volume2,
    VolumeX,
    X,
} from 'lucide-react-native';
import { StyleSheet } from 'react-native';

/**
 * Mapeo de nombres semánticos a iconos de Lucide
 * Ejemplos: icon.like, icon.notMyVibe, icon.map, icon.audio
 */
export const iconMap = {
  like: Heart,
  bookmark: Bookmark,
  map: MapPin,
  audio: Volume2,
  play: Play,
  pause: Pause,
  next: SkipForward,
  previous: SkipBack,
  close: X,
  more: MoreVertical,
  search: Search,
  mic: Mic,
  gems: Sparkles,
  explore: Compass,
  saved: Bookmark,
  profile: User,
  edit: Edit,
  share: Share,
  back: ArrowLeft,
  mute: VolumeX,
  home: Home,
  notMyVibe: ThumbsDown,
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
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return null;
  }

  // lucide-react-native acepta color, size y style como props
  // TypeScript puede requerir aserción para color, pero funciona en runtime
  const props: any = { size, color, style };
  return <IconComponent {...props} />;
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

