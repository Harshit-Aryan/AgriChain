import { Injectable } from '@nestjs/common';
import { OptimizeRouteDto } from './dto/optimize-route.dto';
import { optimizeRoute, RoutePoint } from '../common/utils/route.util';
import { getCoords } from '../common/utils/geo.util';

@Injectable()
export class RoutesService {
  optimize(dto: OptimizeRouteDto) {
    const pickups: RoutePoint[] = dto.pickups.map((p, i) => ({
      id: p.id || `pickup-${i}`,
      name: p.name,
      lat: p.lat ?? getCoords(p.name).lat,
      lng: p.lng ?? getCoords(p.name).lng,
      load: p.load,
      type: 'pickup',
    }));

    const delivery: RoutePoint = {
      id: 'delivery',
      name: dto.delivery.name,
      lat: dto.delivery.lat ?? getCoords(dto.delivery.name).lat,
      lng: dto.delivery.lng ?? getCoords(dto.delivery.name).lng,
      load: 0,
      type: 'delivery',
    };

    const route = optimizeRoute(pickups, delivery, dto.costPerKm ?? 25);
    const totalLoad = pickups.reduce((s, p) => s + p.load, 0);

    return {
      ...route,
      totalLoad,
      vehicleCapacity: dto.vehicleCapacity ?? 2500,
      capacityUtilization: Math.round((totalLoad / (dto.vehicleCapacity ?? 2500)) * 100),
      pickupSequence: route.points.filter((p) => p.type === 'pickup').map((p) => p.name),
      isEstimate: true,
      note: 'Route optimization uses Haversine distance with nearest-neighbour heuristic. Integrate with Google Maps/OSRM/OR-Tools for production.',
    };
  }
}
