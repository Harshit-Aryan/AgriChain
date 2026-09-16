'use client';

import { useEffect, useState } from 'react';
import { MapPin, Navigation, Clock, Truck, TrendingDown, IndianRupee, Layers } from 'lucide-react';
import { api, LogisticsJob, RoutePoint } from '@/lib/api';
import { RouteMap } from '@/components/map/RouteMap';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function LogisticsRoutesPage() {
  const [jobs, setJobs] = useState<LogisticsJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.logistics.myJobs().catch(() => []), api.logistics.jobs().catch(() => [])])
      .then(([mine, avail]) => {
        const combined = [...mine, ...avail];
        // Unique by id
        const unique = Array.from(new Map(combined.map((j) => [j.id, j])).values());
        setJobs(unique);
        if (unique.length > 0) {
          setSelectedJobId(unique[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0] || null;

  const rawPoints = (activeJob?.routePoints || activeJob?.route?.waypoints || activeJob?.pickupSequence || []) as RoutePoint[];
  const points = rawPoints.map((p, idx) => ({
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    type: (p.type || (idx === rawPoints.length - 1 ? 'delivery' : 'pickup')).toLowerCase(),
    load: p.load,
  }));

  const pickups = points.filter((p) => p.type === 'pickup');
  const delivery = points.find((p) => p.type === 'delivery') || points[points.length - 1];

  if (loading) return <div className="text-gray-500">Loading route optimization matrix...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Optimization & Dispatch Map</h1>
          <p className="text-gray-500 mt-1">Multi-pickup consolidation routing powered by nearest-neighbor heuristics</p>
        </div>

        {jobs.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Select Order / Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="input text-sm py-1.5 bg-white max-w-xs font-mono"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.order?.orderNumber || j.id.slice(0, 8)} ({j.totalLoad} kg) — {j.status}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!activeJob || points.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No active route paths available</h3>
          <p className="text-sm mt-1">
            Accept a job from the logistics board or generate an order to view optimized transit maps.
          </p>
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Total Route Distance</span>
                <Navigation className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{activeJob.totalDistance || 0} km</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Optimized circuit (est.)</p>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Estimated Transit Time</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {activeJob.route?.estimatedTime ? `${activeJob.route.estimatedTime} hrs` : '~4.5 hrs'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Including loading buffers</p>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Estimated Transport Cost</span>
                <IndianRupee className="w-4 h-4 text-primary-700" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                ₹{activeJob.estimatedCost?.toLocaleString('en-IN') || 0}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Consolidated rate (est.)</p>
            </div>

            <div className="card p-4 bg-green-50 border border-green-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-green-800 font-semibold">Consolidation Saving</span>
                <TrendingDown className="w-4 h-4 text-green-700" />
              </div>
              <p className="text-2xl font-bold text-green-900">
                ₹{activeJob.consolidatedSaving?.toLocaleString('en-IN') || 0}
              </p>
              <p className="text-[11px] text-green-700 mt-0.5">Vs separate single trips</p>
            </div>
          </div>

          {/* Main Map + Pickup Sequence */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Container */}
            <div className="lg:col-span-2 card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary-700" /> Circuit Visualizer
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Numbered markers reflect pickup sequence to destination</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={activeJob.status} />
                </div>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-200">
                <RouteMap points={points} height="440px" />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#1e3a5f]" /> Farm Pickup Points
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#15803d]" /> Final Delivery Hub
                </span>
              </div>
            </div>

            {/* Waypoint Schedule Sidebar */}
            <div className="card p-5 space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-navy-800" /> Dispatch Sequence
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Load picked up at each location</p>
              </div>

              <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                {pickups.map((p, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-navy-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow">
                      {idx + 1}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg flex-1 border border-gray-100">
                      <p className="font-semibold text-gray-900 text-xs">{p.name}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Load: <strong className="text-navy-900">{p.load?.toLocaleString('en-IN') || 0} kg</strong>
                      </p>
                    </div>
                  </div>
                ))}

                {delivery && (
                  <div className="relative flex items-start gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-primary-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow">
                      ✓
                    </div>
                    <div className="p-3 bg-primary-50 rounded-lg flex-1 border border-primary-200">
                      <p className="font-semibold text-primary-900 text-xs">{delivery.name}</p>
                      <p className="text-[11px] text-primary-700 mt-0.5 font-medium">Final Delivery Destination</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="p-3 bg-navy-50 rounded-lg text-xs space-y-1 text-navy-900">
                  <p className="font-semibold">Vehicle Details</p>
                  <p className="text-gray-600">
                    Registration: <span className="font-mono font-bold text-navy-900">{activeJob.vehicle?.registration || 'Fleet Vehicle'}</span>
                  </p>
                  <p className="text-gray-600">
                    Total Hauled: <span className="font-bold text-navy-900">{activeJob.totalLoad?.toLocaleString('en-IN')} kg</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
            Note: All route distances and multi-pickup savings are ESTIMATES computed using Haversine coordinates and road multipliers. Actual on-road travel time and fuel consumption may vary.
          </p>
        </>
      )}
    </div>
  );
}
