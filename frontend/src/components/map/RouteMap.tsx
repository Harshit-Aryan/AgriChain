'use client';

import { useEffect, useRef } from 'react';

interface Point {
  name: string;
  lat: number;
  lng: number;
  type?: string;
  load?: number;
}

export function RouteMap({ points, height = '400px' }: { points: Point[]; height?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;

    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return;

      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      const map = L.map(mapRef.current).setView([points[0].lat, points[0].lng], 8);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      const latlngs: [number, number][] = [];

      points.forEach((point, idx) => {
        const isDelivery = point.type === 'delivery' || idx === points.length - 1;
        const color = isDelivery ? '#15803d' : '#1e3a5f';

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="background:${color};color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${idx + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([point.lat, point.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${point.name}</b>${point.load ? `<br/>Load: ${point.load} kg` : ''}`);

        latlngs.push([point.lat, point.lng]);
      });

      if (latlngs.length > 1) {
        L.polyline(latlngs, { color: '#16a34a', weight: 3, dashArray: '8, 8' }).addTo(map);
        map.fitBounds(latlngs, { padding: [40, 40] });
      }
    });

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-500" style={{ height }}>
        No route data available
      </div>
    );
  }

  return <div ref={mapRef} className="rounded-lg overflow-hidden border border-gray-200" style={{ height }} />;
}
