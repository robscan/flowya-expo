/**
 * Narration Generator
 * Scope 12.1: Sistema de narrativas híbrido con prioridades
 * 
 * Genera texto de narration basándose en sistema de prioridades:
 * 1. narration específico del spot (si existe)
 * 2. Fallback: culturalContext
 * 3. Fallback: description/whyItMatters
 * 4. Fallback: narrativa genérica por tipo de spot
 */

import { Spot, SpotType } from '@/data/spots';
import { NarrationType } from '@/data/narrations';

/**
 * Obtener narrativa genérica por tipo de spot
 */
function getGenericNarration(type: SpotType, narrationType: NarrationType): string {
  const genericNarrations: Record<SpotType, Record<NarrationType, string>> = {
    beach: {
      anticipation: 'Una playa te espera. El sonido del mar se acerca.',
      presence: 'Estás aquí. El océano respira contigo.',
      transition: 'El mar queda atrás. El camino continúa.',
    },
    cafe: {
      anticipation: 'Un lugar para pausar. El aroma del café se acerca.',
      presence: 'Tómate un momento. Este lugar invita a la calma.',
      transition: 'Con energía renovada, el viaje continúa.',
    },
    viewpoint: {
      anticipation: 'Una vista se acerca. Prepárate para contemplar.',
      presence: 'Mira alrededor. Este lugar ofrece perspectiva.',
      transition: 'Con la vista en el corazón, sigues adelante.',
    },
    museum: {
      anticipation: 'Un espacio de cultura te espera. La historia se acerca.',
      presence: 'Estás aquí. Cada objeto cuenta una historia.',
      transition: 'Con conocimiento nuevo, el camino continúa.',
    },
    restaurant: {
      anticipation: 'Un lugar para saborear. Los aromas se acercan.',
      presence: 'Disfruta este momento. La comida conecta culturas.',
      transition: 'Con el estómago contento, sigues adelante.',
    },
    park: {
      anticipation: 'Un espacio verde se acerca. La naturaleza te espera.',
      presence: 'Respira. Este lugar invita a la tranquilidad.',
      transition: 'Con calma renovada, el viaje continúa.',
    },
    monument: {
      anticipation: 'Un monumento histórico se acerca. La memoria te espera.',
      presence: 'Estás aquí. Este lugar guarda historias importantes.',
      transition: 'Con respeto por el pasado, sigues adelante.',
    },
    market: {
      anticipation: 'Un mercado vibrante se acerca. La vida local te espera.',
      presence: 'Observa. Este lugar late con energía local.',
      transition: 'Con experiencias nuevas, el camino continúa.',
    },
    other: {
      anticipation: 'Un lugar especial se acerca.',
      presence: 'Estás aquí. Observa y siente este momento.',
      transition: 'Con esta experiencia, el viaje continúa.',
    },
  };

  return genericNarrations[type]?.[narrationType] || genericNarrations.other[narrationType];
}

/**
 * Adaptar contexto cultural a tipo de narration
 */
function adaptContextToNarrationType(
  culturalContext: string,
  narrationType: NarrationType
): string {
  // Para anticipation, agregar prefijo de acercamiento
  if (narrationType === 'anticipation') {
    return `Mientras te acercas: ${culturalContext}`;
  }
  
  // Para presence, usar directamente
  if (narrationType === 'presence') {
    return culturalContext;
  }
  
  // Para transition, agregar prefijo de despedida
  if (narrationType === 'transition') {
    return `Al partir: ${culturalContext}`;
  }
  
  return culturalContext;
}

/**
 * Adaptar descripción a tipo de narration
 */
function adaptDescriptionToNarrationType(
  description: string,
  narrationType: NarrationType
): string {
  // Para anticipation, crear expectativa
  if (narrationType === 'anticipation') {
    return `Pronto estarás en: ${description}`;
  }
  
  // Para presence, usar directamente
  if (narrationType === 'presence') {
    return description;
  }
  
  // Para transition, crear despedida
  if (narrationType === 'transition') {
    return `Dejando atrás: ${description}`;
  }
  
  return description;
}

/**
 * Generar texto de narration basándose en sistema de prioridades
 */
export function generateNarrationText(
  spot: Spot,
  narrationType: NarrationType
): string | null {
  // Prioridad 1: narration específico del spot
  if (spot.narration) {
    const specificNarration = spot.narration[narrationType];
    if (specificNarration && specificNarration.trim().length > 0) {
      return specificNarration;
    }
  }

  // Prioridad 2: culturalContext
  if (spot.culturalContext && spot.culturalContext.trim().length > 0) {
    return adaptContextToNarrationType(spot.culturalContext, narrationType);
  }

  // Prioridad 3: description o whyItMatters
  const description = spot.whyItMatters || spot.description;
  if (description && description.trim().length > 0) {
    return adaptDescriptionToNarrationType(description, narrationType);
  }

  // Prioridad 4: narrativa genérica por tipo de spot
  return getGenericNarration(spot.type, narrationType);
}

