'use client';

import { useEffect, useRef, useState } from 'react';

export interface Point {
  name: string;
  lat?: number;
  lng?: number;
  type?: string;
  load?: number;
}

const KNOWN_COORDINATES: Record<string, [number, number]> = {
  mumbai: [19.0760, 72.8777],
  vashi: [19.0760, 72.9980],
  pune: [18.5204, 73.8567],
  nashik: [19.9975, 73.7898],
  dindori: [20.2000, 73.8300],
  niphad: [20.0800, 74.1100],
  narayangaon: [19.1200, 73.9700],
  nagpur: [21.1458, 79.0882],
  indore: [22.7196, 75.8577],
  delhi: [28.6139, 77.2090],
};

function resolveCoords(p: any, index: number): { lat: number; lng: number; name: string; type: string; load?: number } | null {
  if (!p) return null;
  const isString = typeof p === 'string';
  const name = isString ? p : (p.name || `Waypoint ${index + 1}`);
  let lat = !isString && typeof p.lat === 'number' ? p.lat : parseFloat(p?.lat);
  let lng = !isString && typeof p.lng === 'number' ? p.lng : parseFloat(p?.lng);

  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
    const lower = name.toLowerCase();
    for (const [key, coords] of Object.entries(KNOWN_COORDINATES)) {
      if (lower.includes(key)) {
        lat = coords[0];
        lng = coords[1];
        break;
      }
    }
  }

  // Fallback anchor in Maharashtra agricultural belt if completely unknown
  if (isNaN(lat) || isNaN(lng)) {
    lat = 19.8 + (index * 0.15);
    lng = 73.8 + (index * 0.15);
  }

  return {
    name,
    lat,
    lng,
    type: !isString && p.type ? String(p.type).toLowerCase() : (index === 0 ? 'pickup' : 'delivery'),
    load: !isString ? p.load : undefined,
  };
}

export function RouteMap({ points = [], height = '400px' }: { points?: Point[]; height?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const resolvedPoints = (Array.isArray(points) ? points : [])
    .map((p, idx) => resolveCoords(p, idx))
    .filter((p): p is { lat: number; lng: number; name: string; type: string; load?: number } => p !== null);

  useEffect(() => {
    if (!mapRef.current || resolvedPoints.length === 0) return;

    let cancelled = false;

    import('leaflet')
      .then((L) => {
        if (cancelled || !mapRef.current) return;

        try {
          if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
          }
          if (mapRef.current && (mapRef.current as any)._leaflet_id) {
            (mapRef.current as any)._leaflet_id = null;
          }

          const firstPoint = resolvedPoints[0];
          const map = L.map(mapRef.current, {
            scrollWheelZoom: false,
          }).setView([firstPoint.lat, firstPoint.lng], 8);
          mapInstance.current = map;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
          }).addTo(map);

          const latlngs: [number, number][] = [];

          resolvedPoints.forEach((point, idx) => {
            const isDelivery = point.type === 'delivery' || idx === resolvedPoints.length - 1;
            const color = isDelivery ? '#15803d' : '#1e3a5f';

            const icon = L.divIcon({
              className: 'custom-marker',
              html: `<div style="background:${color};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${isDelivery ? '✓' : idx + 1}</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

            L.marker([point.lat, point.lng], { icon })
              .addTo(map)
              .bindPopup(`<b>${point.name}</b>${point.load ? `<br/>Load: ${point.load.toLocaleString('en-IN')} kg` : ''}<br/><i>${isDelivery ? 'Final Delivery Hub' : 'Farm Pickup'}</i>`);

            latlngs.push([point.lat, point.lng]);
          });

          if (latlngs.length > 1) {
            L.polyline(latlngs, {
              color: '#16a34a',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.85,
            }).addTo(map);
            map.fitBounds(latlngs, { padding: [40, 40] });
          }

          // Trigger invalidateSize to fix gray tiles after container render
          setTimeout(() => {
            if (!cancelled && mapInstance.current) {
              mapInstance.current.invalidateSize();
            }
          }, 200);

          setTimeout(() => {
            if (!cancelled && mapInstance.current) {
              mapInstance.current.invalidateSize();
            }
          }, 600);
        } catch (err) {
          console.error('Leaflet map initialization error:', err);
          setMapError('Unable to load interactive map tiles');
        }
      })
      .catch((err) => {
        console.error('Failed to dynamically load leaflet:', err);
        setMapError('Map component unavailable');
      });

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch {}
        mapInstance.current = null;
      }
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        (mapRef.current as any)._leaflet_id = null;
      }
    };
  }, [points]);

  if (resolvedPoints.length === 0 || mapError) {
    return (
      <div className="bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500 p-6" style={{ height }}>
        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-sm font-medium text-gray-600">{mapError || 'No route waypoints available for this dispatch'}</p>
        <p className="text-xs text-gray-400 mt-1">Accept an order to view optimized circuit</p>
      </div>
    );
  }

  return <div ref={mapRef} className="rounded-lg overflow-hidden border border-gray-200 shadow-inner" style={{ height }} />;
}
