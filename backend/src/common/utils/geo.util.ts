export interface Coordinates {
  lat: number;
  lng: number;
}

const EARTH_RADIUS_KM = 6371;

export function haversineDistance(from: Coordinates, to: Coordinates): number {
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export const CITY_COORDS: Record<string, Coordinates> = {
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Delhi: { lat: 28.6139, lng: 77.209 },
};

export function getCoords(location: string): Coordinates {
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (location.toLowerCase().includes(city.toLowerCase())) {
      return coords;
    }
  }
  return CITY_COORDS.Mumbai;
}
