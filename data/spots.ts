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
    photos: [],
    description: 'Hermosa playa con vista al océano',
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
    photos: [],
    description: 'Vista panorámica de la ciudad',
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
    photos: [],
    description: 'Café acogedor en el centro',
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
    photos: [],
    description: 'Colección de arte contemporáneo',
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
    photos: [],
    description: 'Parque urbano con áreas verdes',
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
    photos: [],
    description: 'Cocina local con terraza al aire libre',
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
    photos: [],
    description: 'Monumento que representa la historia de la ciudad',
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
    photos: [],
    description: 'Mercado con productos locales y artesanías',
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
