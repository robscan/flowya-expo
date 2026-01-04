/**
 * Search Result Card Component
 * Scope 10: Search Screen - Card para resultados
 * 
 * Reutiliza SpotCard o variante para resultados de búsqueda
 */

import React from 'react';

import { SearchResult } from '@/utils/searchLogic';
import { SpotCard } from '@/components/SpotCard';
import { GemsPathCard } from '@/components/GemsPathCard';
import { GemPath } from '@/utils/gemsLogic';

interface SearchResultCardProps {
  result: SearchResult;
  onSpotPress?: (spotId: string) => void;
  onPathPress?: (pathId: string) => void;
}

export function SearchResultCard({ result, onSpotPress, onPathPress }: SearchResultCardProps) {
  if (result.type === 'spot' && result.spot) {
    return (
      <SpotCard
        spot={result.spot}
        onPress={() => onSpotPress?.(result.spot!.id)}
      />
    );
  }
  
  if (result.type === 'path' && result.path) {
    const gemPath: GemPath = {
      path: result.path,
      reason: 'suggested',
      score: result.relevanceScore,
    };
    return (
      <GemsPathCard
        gemPath={gemPath}
        onPress={() => onPathPress?.(result.path!.id)}
      />
    );
  }
  
  return null;
}

