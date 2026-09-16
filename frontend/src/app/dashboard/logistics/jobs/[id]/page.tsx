'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Truck, MapPin, ArrowLeft, CheckCircle2, Play, Navigation } from 'lucide-react';
import { api, LogisticsJob, RoutePoint } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RouteMap } from '@/components/map/RouteMap';

export default function LogisticsJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<LogisticsJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchJob = () => {
    api.logistics.getJob(id)
      .then(setJob)
      .catch((err) => setError(err instanceof Error ? err.message : 'Job not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleStatusUpdate = async (nextStatus: string) => {
    setUpdating(true);
    try {
      await api.logistics.updateStatus(id, nextStatus);
      fetchJob();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading trip details...</div>;
  if (error || !job) {
    return (
      <div className="card p-8 text-center text-red-600">
        <p className="font-semibold">Unable to load trip details</p>
        <p className="text-sm text-gray-500 mt-1">{error || 'Job not found'}</p>
        <Link href="/dashboard/logistics/my-jobs" className="btn-secondary mt-4 inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to My Jobs
        </Link>
      </div>
    );
  }

  const rawPoints = (job.routePoints || job.route?.waypoints || job.pickupSequence || []) as RoutePoint[];
  const points = rawPoints.map((p, idx) => ({
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    type: (p.type || (idx === rawPoints.length - 1 ? 'delivery' : 'pickup')).toLowerCase(),
    load: p.load,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/logistics/my-jobs" className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Trips
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {job.order?.orderNumber ? `Trip: ${job.order.orderNumber}` : `Job #${job.id.slice(0, 8)}`}
              </h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Assigned Vehicle: <span className="font-mono font-medium text-navy-900">{job.vehicle?.registration || 'Fleet Vehicle'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.status === 'ASSIGNED' && (
            <button
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              disabled={updating}
              className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Start Dispatch
            </button>
          )}
          {job.status === 'IN_PROGRESS' && (
            <button
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={updating}
              className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-800"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary-700" /> Route Navigation
          </h2>
          <RouteMap points={points} height="380px" />
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Trip Breakdown</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
              <span className="text-gray-500">Total Freight:</span>
              <span className="font-bold text-gray-900">{job.totalLoad?.toLocaleString('en-IN')} kg</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
              <span className="text-gray-500">Distance (est.):</span>
              <span className="font-bold text-gray-900">{job.totalDistance || 0} km</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
              <span className="text-gray-500">Carrier Payout (est.):</span>
              <span className="font-bold text-green-700">₹{job.estimatedCost?.toLocaleString('en-IN') || 0}</span>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg flex justify-between">
              <span className="text-primary-800">Multi-Pickup Saving:</span>
              <span className="font-bold text-primary-900">₹{job.consolidatedSaving?.toLocaleString('en-IN') || 0}</span>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Destination</p>
            <div className="p-3 bg-gray-50 rounded-lg text-xs flex items-center gap-2 text-gray-800">
              <MapPin className="w-4 h-4 text-primary-700 flex-shrink-0" />
              <span>{job.order?.deliveryLocation || 'Mumbai Commercial Hub'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
