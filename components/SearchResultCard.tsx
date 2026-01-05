/**
 * Search Result Card Component
 * Scope 10: Search Screen - Card para resultados
 * 
 * Reutiliza SpotCard o PathCard para resultados de búsqueda
 */

import React from 'react';

import { SearchResult } from '@/utils/searchLogic';
import { SpotCard } from '@/components/SpotCard';
import { FlowCard } from '@/components/FlowCard';
import { Spot } from '@/data/spots';

interface SearchResultCardProps {
  result: SearchResult;
  allSpots: Spot[]; // Array completo de spots para PathCard
  onSpotPress?: (spotId: string) => void;
  onPathPress?: (pathId: string) => void;
}

export function SearchResultCard({ result, allSpots, onSpotPress, onPathPress }: SearchResultCardProps) {
  if (result.type === 'spot' && result.spot) {
    return (
      <SpotCard
        spot={result.spot}
        onPress={() => onSpotPress?.(result.spot!.id)}
      />
    );
  }
  
  if (result.type === 'path' && result.path) {
    return (
      <FlowCard
        flow={result.path}
        spots={allSpots}
        onPress={() => onPathPress?.(result.path!.id)}
      />
    );
  }
  
  return null;
}
