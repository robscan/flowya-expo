/**
 * Modelo de Datos - Spots
 * Scope 1.1: Tipo Spot según definición de producto
 * 
 * Campos según definición:
 * - nombre (opcional)
 * - ubicación en mapa (lat/lng)
 * - fotos (array)
 * - descripción breve (opcional)
 * - horarios (si aplica)
 * - costos (si aplica)
 * - tipo (playa, café, mirador, museo, etc.)
 * - ubicación ajustable (pin ajustable)
 */

export type SpotType =
  | 'beach'
  | 'cafe'
  | 'viewpoint'
  | 'museum'
  | 'restaurant'
  | 'park'
  | 'monument'
  | 'market'
  | 'other';

export type SpotHours = {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
};

export type SpotCost = {
  currency: string;
  amount: number;
  description?: string;
};

export interface Spot {
  id: string;
  name?: string; // Opcional
  location: {
    latitude: number;
    longitude: number;
    adjustable?: boolean; // Pin ajustable
  };
  photos: string[]; // Array de URLs o paths
  description?: string; // Opcional, descripción breve
  type: SpotType;
  hours?: SpotHours; // Si aplica
  cost?: SpotCost; // Si aplica
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos de ejemplo para desarrollo
 * TODO: Reemplazar con datos reales o API
 */
export const mockSpots: Spot[] = [
  {
    id: 'spot-1',
    name: 'Playa Principal',
    location: {
      latitude: -12.0464,
      longitude: -77.0428,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    ],
    description: 'Hermosa playa con vista al océano. Perfecta para relajarse y disfrutar del atardecer.',
    type: 'beach',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'spot-2',
    name: 'Mirador de la Ciudad',
    location: {
      latitude: -12.0564,
      longitude: -77.0328,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=600&fit=crop',
    ],
    description: 'Vista panorámica de la ciudad desde las alturas. Ideal para fotografías y contemplar el paisaje urbano.',
    type: 'viewpoint',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'spot-3',
    name: 'Café Central',
    location: {
      latitude: -12.0484,
      longitude: -77.0388,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&h=600&fit=crop',
    ],
    description: 'Café acogedor en el centro de la ciudad. Ambiente tranquilo para trabajar o reunirse con amigos.',
    type: 'cafe',
    hours: {
      monday: '8:00 - 20:00',
      tuesday: '8:00 - 20:00',
      wednesday: '8:00 - 20:00',
      thursday: '8:00 - 20:00',
      friday: '8:00 - 22:00',
      saturday: '9:00 - 22:00',
      sunday: '9:00 - 20:00',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'spot-4',
    name: 'Museo de Arte',
    location: {
      latitude: -12.0524,
      longitude: -77.0428,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
    ],
    description: 'Colección de arte contemporáneo y exposiciones temporales. Un espacio cultural imperdible.',
    type: 'museum',
    hours: {
      tuesday: '10:00 - 18:00',
      wednesday: '10:00 - 18:00',
      thursday: '10:00 - 18:00',
      friday: '10:00 - 20:00',
      saturday: '10:00 - 20:00',
      sunday: '10:00 - 18:00',
    },
    cost: {
      currency: 'PEN',
      amount: 25,
      description: 'Entrada general',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'spot-5',
    name: 'Parque Central',
    location: {
      latitude: -12.0504,
      longitude: -77.0408,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=800&h=600&fit=crop',
    ],
    description: 'Parque urbano con áreas verdes, senderos para caminar y espacios para actividades al aire libre.',
    type: 'park',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'spot-6',
    name: 'Restaurante La Terraza',
    location: {
      latitude: -12.0544,
      longitude: -77.0448,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    ],
    description: 'Cocina local con terraza al aire libre. Platos tradicionales con un toque moderno.',
    type: 'restaurant',
    hours: {
      monday: '12:00 - 23:00',
      tuesday: '12:00 - 23:00',
      wednesday: '12:00 - 23:00',
      thursday: '12:00 - 23:00',
      friday: '12:00 - 24:00',
      saturday: '12:00 - 24:00',
      sunday: '12:00 - 22:00',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'spot-7',
    name: 'Monumento Histórico',
    location: {
      latitude: -12.0484,
      longitude: -77.0368,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop',
    ],
    description: 'Monumento que representa la historia de la ciudad. Un símbolo importante del patrimonio cultural.',
    type: 'monument',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'spot-8',
    name: 'Mercado Artesanal',
    location: {
      latitude: -12.0464,
      longitude: -77.0348,
      adjustable: false,
    },
    photos: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop',
    ],
    description: 'Mercado con productos locales y artesanías. Un lugar para descubrir la cultura local y apoyar a los artesanos.',
    type: 'market',
    hours: {
      monday: '8:00 - 18:00',
      tuesday: '8:00 - 18:00',
      wednesday: '8:00 - 18:00',
      thursday: '8:00 - 18:00',
      friday: '8:00 - 18:00',
      saturday: '8:00 - 20:00',
      sunday: '9:00 - 16:00',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
