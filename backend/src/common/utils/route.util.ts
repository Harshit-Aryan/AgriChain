import { haversineDistance, Coordinates } from './geo.util';

export interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  load: number;
  type: 'pickup' | 'delivery';
}

export interface OptimizedRoute {
  points: RoutePoint[];
  optimizedOrder: number[];
  totalDistance: number;
  estimatedTimeHours: number;
  estimatedCost: number;
  separateTripsCost: number;
  consolidatedSaving: number;
}

export function optimizeRoute(
  pickups: RoutePoint[],
  delivery: RoutePoint,
  costPerKm: number,
): OptimizedRoute {
  if (pickups.length === 0) {
    return {
      points: [delivery],
      optimizedOrder: [0],
      totalDistance: 0,
      estimatedTimeHours: 0,
      estimatedCost: 0,
      separateTripsCost: 0,
      consolidatedSaving: 0,
    };
  }

  const unvisited = [...pickups];
  const ordered: RoutePoint[] = [];
  let current: Coordinates = { lat: pickups[0].lat, lng: pickups[0].lng };

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const dist = haversineDistance(current, { lat: unvisited[i].lat, lng: unvisited[i].lng });
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    const next = unvisited.splice(nearestIdx, 1)[0];
    ordered.push(next);
    current = { lat: next.lat, lng: next.lng };
  }

  const allPoints = [...ordered, delivery];
  let totalDistance = 0;
  let separateTripsCost = 0;

  for (let i = 0; i < allPoints.length - 1; i++) {
    const dist = haversineDistance(
      { lat: allPoints[i].lat, lng: allPoints[i].lng },
      { lat: allPoints[i + 1].lat, lng: allPoints[i + 1].lng },
    );
    totalDistance += dist;
  }

  for (const pickup of pickups) {
    const toDelivery = haversineDistance(
      { lat: pickup.lat, lng: pickup.lng },
      { lat: delivery.lat, lng: delivery.lng },
    );
    separateTripsCost += toDelivery * costPerKm * 2;
  }

  const estimatedCost = totalDistance * costPerKm;
  const consolidatedSaving = Math.max(0, separateTripsCost - estimatedCost);
  const estimatedTimeHours = totalDistance / 40 + pickups.length * 0.5;

  return {
    points: allPoints,
    optimizedOrder: allPoints.map((_, i) => i),
    totalDistance: Math.round(totalDistance * 10) / 10,
    estimatedTimeHours: Math.round(estimatedTimeHours * 10) / 10,
    estimatedCost: Math.round(estimatedCost),
    separateTripsCost: Math.round(separateTripsCost),
    consolidatedSaving: Math.round(consolidatedSaving),
  };
}
