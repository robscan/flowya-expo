/**
 * Utilidades para cálculo de distancias
 * Cálculo de distancia entre coordenadas usando fórmula de Haversine
 */

/**
 * Calcular distancia entre dos puntos geográficos usando fórmula de Haversine
 * @param lat1 Latitud del primer punto
 * @param lon1 Longitud del primer punto
 * @param lat2 Latitud del segundo punto
 * @param lon2 Longitud del segundo punto
 * @returns Distancia en metros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convertir grados a radianes
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calcular distancia desde ubicación del usuario a un spot
 */
export function calculateDistanceToSpot(
  userLocation: { latitude: number; longitude: number } | null,
  spotLocation: { latitude: number; longitude: number }
): number | null {
  if (!userLocation) {
    return null;
  }
  
  return calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    spotLocation.latitude,
    spotLocation.longitude
  );
}

/**
 * Calcular distancia total de un path sumando distancias entre spots consecutivos
 * @param path Path con array de spot IDs en orden
 * @param spots Array completo de spots para obtener ubicaciones
 * @returns Distancia total en metros, o 0 si no hay suficientes spots
 */
export function calculatePathDistance(path: { spots: string[] }, spots: Array<{ id: string; location: { latitude: number; longitude: number } }>): number {
  if (path.spots.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let i = 0; i < path.spots.length - 1; i++) {
    const currentSpotId = path.spots[i];
    const nextSpotId = path.spots[i + 1];

    const currentSpot = spots.find(s => s.id === currentSpotId);
    const nextSpot = spots.find(s => s.id === nextSpotId);

    if (currentSpot && nextSpot) {
      const segmentDistance = calculateDistance(
        currentSpot.location.latitude,
        currentSpot.location.longitude,
        nextSpot.location.latitude,
        nextSpot.location.longitude
      );
      totalDistance += segmentDistance;
    }
  }

  return totalDistance;
}

/**
 * Formatear distancia en formato legible (metros/kilómetros o pies/millas)
 * @param distance Distancia en metros
 * @param useMiles Si es true, usa sistema imperial (pies/millas), sino usa métrico (metros/kilómetros)
 * @returns String formateado o null si distance es undefined/null
 */
export function formatDistance(distance?: number, useMiles: boolean = false): string | null {
  if (distance === undefined || distance === null) {
    return null;
  }

  if (useMiles) {
    // Sistema imperial: pies y millas
    const feet = distance * 3.28084; // 1 metro = 3.28084 pies
    if (feet < 528) {
      // Menos de 528 pies (0.1 millas) → mostrar en pies
      return `${Math.round(feet)} ft`;
    } else {
      // 528 pies o más → mostrar en millas
      const miles = feet / 5280; // 1 milla = 5280 pies
      if (miles < 10) {
        return `${miles.toFixed(1)} mi`;
      } else {
        return `${Math.round(miles)} mi`;
      }
    }
  } else {
    // Sistema métrico: metros y kilómetros
    if (distance < 1000) {
      // Menos de 1km → mostrar en metros
      return `${Math.round(distance)} m`;
    } else {
      // 1km o más → mostrar en kilómetros
      const kilometers = distance / 1000;
      if (kilometers < 10) {
        return `${kilometers.toFixed(1)} km`;
      } else {
        return `${Math.round(kilometers)} km`;
      }
    }
  }
}

