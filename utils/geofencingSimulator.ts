/**
 * Geofencing Simulator - Simulación de proximidad a Spots
 * Scope 7: Flow (Estado Activo) - Geofencing Simulado
 * 
 * Funcionalidades:
 * - Simulación de proximidad a Spots (para desarrollo sin GPS real)
 * - Triggers de eventos (approaching, arriving, leaving)
 * - Callbacks para eventos de geofencing
 * 
 * Nota: En producción, esto se reemplazará con geofencing real usando expo-location
 */

import { Spot } from '@/data/spots';

export type GeofencingEvent = 'approaching' | 'arriving' | 'leaving';

export interface GeofencingCallback {
  onApproaching?: (spotId: string) => void;
  onArriving?: (spotId: string) => void;
  onLeaving?: (spotId: string) => void;
}

interface GeofencingSimulatorState {
  currentLocation: { latitude: number; longitude: number } | null;
  currentSpotId: string | null;
  isMonitoring: boolean;
  intervalId: NodeJS.Timeout | null;
}

class GeofencingSimulator {
  private state: GeofencingSimulatorState;
  private callbacks: GeofencingCallback[] = [];
  private spots: Spot[] = [];
  
  // Distancias en metros (radio de geofencing)
  private readonly APPROACHING_DISTANCE = 100; // 100m para "approaching"
  private readonly ARRIVING_DISTANCE = 20; // 20m para "arriving"
  private readonly LEAVING_DISTANCE = 50; // 50m para "leaving"

  constructor() {
    this.state = {
      currentLocation: null,
      currentSpotId: null,
      isMonitoring: false,
      intervalId: null,
    };
  }

  /**
   * Calcular distancia entre dos coordenadas (fórmula de Haversine)
   * Retorna distancia en metros
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Registrar callbacks para eventos de geofencing
   */
  addCallbacks(callbacks: GeofencingCallback): () => void {
    this.callbacks.push(callbacks);
    
    // Retornar función para remover callbacks
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callbacks);
    };
  }

  /**
   * Establecer spots a monitorear
   */
  setSpots(spots: Spot[]): void {
    this.spots = spots;
  }

  /**
   * Establecer ubicación actual (simulada)
   */
  setCurrentLocation(location: { latitude: number; longitude: number }): void {
    this.state.currentLocation = location;
  }

  /**
   * Iniciar monitoreo de geofencing
   */
  startMonitoring(
    initialLocation: { latitude: number; longitude: number },
    spots: Spot[]
  ): void {
    if (this.state.isMonitoring) {
      this.stopMonitoring();
    }

    this.setCurrentLocation(initialLocation);
    this.setSpots(spots);

    this.state.isMonitoring = true;

    // Simular actualización de ubicación cada 2 segundos
    this.state.intervalId = setInterval(() => {
      this.checkProximity();
    }, 2000);

    // Primera verificación inmediata
    this.checkProximity();
  }

  /**
   * Detener monitoreo de geofencing
   */
  stopMonitoring(): void {
    this.state.isMonitoring = false;
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
    this.state.currentSpotId = null;
  }

  /**
   * Verificar proximidad a spots y disparar eventos
   */
  private checkProximity(): void {
    if (!this.state.currentLocation || this.spots.length === 0) {
      return;
    }

    const { latitude, longitude } = this.state.currentLocation;
    let closestSpot: Spot | null = null;
    let closestDistance = Infinity;

    // Encontrar el spot más cercano
    for (const spot of this.spots) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        spot.location.latitude,
        spot.location.longitude
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestSpot = spot;
      }
    }

    if (!closestSpot) {
      return;
    }

    const previousSpotId = this.state.currentSpotId;
    const currentSpotId = closestSpot.id;

    // Lógica de eventos basada en distancia
    if (closestDistance <= this.ARRIVING_DISTANCE) {
      // Llegada al spot
      if (previousSpotId !== currentSpotId) {
        this.state.currentSpotId = currentSpotId;
        this.triggerEvent('arriving', currentSpotId);
      }
    } else if (closestDistance <= this.APPROACHING_DISTANCE) {
      // Aproximándose al spot
      if (previousSpotId !== currentSpotId) {
        this.state.currentSpotId = currentSpotId;
        this.triggerEvent('approaching', currentSpotId);
      }
    } else if (previousSpotId === currentSpotId && closestDistance > this.LEAVING_DISTANCE) {
      // Saliendo del spot (solo si antes estaba en este spot)
      this.state.currentSpotId = null;
      this.triggerEvent('leaving', previousSpotId);
    }
  }

  /**
   * Disparar evento a todos los callbacks registrados
   */
  private triggerEvent(event: GeofencingEvent, spotId: string): void {
    this.callbacks.forEach((callbacks) => {
      switch (event) {
        case 'approaching':
          callbacks.onApproaching?.(spotId);
          break;
        case 'arriving':
          callbacks.onArriving?.(spotId);
          break;
        case 'leaving':
          callbacks.onLeaving?.(spotId);
          break;
      }
    });
  }

  /**
   * Simular movimiento hacia un spot (para testing)
   */
  simulateMovementToSpot(
    spotId: string,
    duration: number = 5000,
    steps: number = 10
  ): void {
    const spot = this.spots.find((s) => s.id === spotId);
    if (!spot || !this.state.currentLocation) {
      return;
    }

    const startLat = this.state.currentLocation.latitude;
    const startLon = this.state.currentLocation.longitude;
    const endLat = spot.location.latitude;
    const endLon = spot.location.longitude;

    const latStep = (endLat - startLat) / steps;
    const lonStep = (endLon - startLon) / steps;
    const timeStep = duration / steps;

    let currentStep = 0;

    const moveInterval = setInterval(() => {
      if (currentStep >= steps) {
        clearInterval(moveInterval);
        return;
      }

      const newLat = startLat + latStep * (currentStep + 1);
      const newLon = startLon + lonStep * (currentStep + 1);

      this.setCurrentLocation({ latitude: newLat, longitude: newLon });
      currentStep++;
    }, timeStep);
  }
}

// Singleton instance
export const geofencingSimulator = new GeofencingSimulator();

