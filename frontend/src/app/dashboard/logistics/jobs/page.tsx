'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Truck, MapPin, CheckCircle2, AlertCircle, TrendingDown, ArrowRight } from 'lucide-react';
import { api, LogisticsJob, LogisticsProfile, Vehicle } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function LogisticsAvailableJobsPage() {
  const [jobs, setJobs] = useState<LogisticsJob[]>([]);
  const [profile, setProfile] = useState<LogisticsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string>('');

  const loadData = () => {
    Promise.all([api.logistics.jobs(), api.logistics.profile()])
      .then(([j, p]) => {
        setJobs(j);
        setProfile(p);
        if (p?.vehicles && p.vehicles.length > 0) {
          const defaultVeh = p.vehicles.find((v) => v.isAvailable) || p.vehicles[0];
          setSelectedVehicleId(defaultVeh.id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (jobId: string) => {
    if (!profile) {
      setActionError('Logistics profile not loaded');
      return;
    }
    if (!selectedVehicleId) {
      setActionError('Please select a vehicle from your fleet');
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await api.logistics.assignJob(jobId, profile.id, selectedVehicleId);
      setActionSuccess('Job accepted! Vehicle assigned and order set to READY_FOR_PICKUP.');
      setAssigningJobId(null);
      loadData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to assign vehicle');
    }
  };

  if (loading) return <div className="text-gray-500">Loading available transport jobs...</div>;

  const vehicles: Vehicle[] = profile?.vehicles || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Logistics Jobs</h1>
          <p className="text-gray-500 mt-1">Open consolidated freight requests ready for carrier assignment</p>
        </div>
        <Link href="/dashboard/logistics/my-jobs" className="btn-secondary inline-flex items-center gap-2">
          <Truck className="w-4 h-4" /> View My Assigned Jobs
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-sm text-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No Open Jobs Available</h3>
          <p className="text-sm mt-1">
            All current orders have been claimed. When a buyer confirms a demand match, new transport jobs will appear here.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/logistics/my-jobs" className="btn-primary text-sm inline-flex items-center gap-2">
              Go to My Dispatches <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const pickups = (job.pickupSequence || job.routePoints || []) as { name: string; load?: number }[];
            const isAssigningThis = assigningJobId === job.id;

            return (
              <div key={job.id} className="card p-6 transition-shadow hover:shadow-md">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-gray-900">
                        {job.order?.orderNumber || `Job #${job.id.slice(0, 8)}`}
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      Destination: <strong className="text-gray-900">{job.order?.deliveryLocation || 'Mumbai Hub'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs text-gray-500">Estimated Carrier Payout</p>
                      <p className="text-2xl font-bold text-gray-900">₹{job.estimatedCost?.toLocaleString('en-IN')}</p>
                    </div>
                    {job.consolidatedSaving && job.consolidatedSaving > 0 ? (
                      <div className="hidden sm:block p-2 bg-green-50 rounded-lg text-left">
                        <p className="text-[11px] text-green-700 font-medium flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" /> Est. Multi-Pickup Saving
                        </p>
                        <p className="text-sm font-bold text-green-800">
                          ₹{job.consolidatedSaving.toLocaleString('en-IN')}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 py-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">Total Freight Load</span>
                    <span className="font-bold text-base text-gray-900">{job.totalLoad?.toLocaleString('en-IN')} kg</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">Estimated Route Distance</span>
                    <span className="font-bold text-base text-gray-900">{job.totalDistance || 0} km</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 block">Pickup Stops</span>
                    <span className="font-bold text-base text-gray-900">{pickups.length} farm locations</span>
                  </div>
                </div>

                {pickups.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Optimized Pickup Path</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {pickups.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs bg-navy-50 text-navy-900 px-3 py-1.5 rounded-md border border-navy-100">
                          <span className="w-4 h-4 bg-navy-900 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{p.name}</span>
                          {p.load ? <span className="text-gray-500">({p.load} kg)</span> : null}
                        </div>
                      ))}
                      <span className="text-gray-400 font-bold">→</span>
                      <div className="flex items-center gap-1 text-xs bg-primary-50 text-primary-900 font-semibold px-3 py-1.5 rounded-md border border-primary-200">
                        <MapPin className="w-3.5 h-3.5 text-primary-700" />
                        <span>{job.order?.deliveryLocation || 'Delivery Destination'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignment Action Box */}
                {isAssigningThis ? (
                  <div className="mt-4 p-4 bg-navy-50 border border-navy-200 rounded-lg space-y-3">
                    <h4 className="text-sm font-bold text-navy-900">Assign Vehicle from Fleet</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        className="input flex-1 bg-white text-sm"
                        value={selectedVehicleId}
                        onChange={(e) => setSelectedVehicleId(e.target.value)}
                      >
                        <option value="">Select vehicle...</option>
                        {vehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.registration} — {v.type.replace('_', ' ')} (Cap: {v.capacity} kg) {v.isAvailable ? '• Available' : '• In Use'}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(job.id)}
                        className="btn-primary text-sm px-6 py-2"
                      >
                        Confirm Assignment
                      </button>
                      <button
                        onClick={() => setAssigningJobId(null)}
                        className="btn-secondary text-sm px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center pt-2">
                    <Link
                      href="/dashboard/logistics/routes"
                      className="text-xs text-primary-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Preview Route Map
                    </Link>
                    <button
                      onClick={() => setAssigningJobId(job.id)}
                      className="btn-primary text-sm px-6 py-2"
                    >
                      Accept & Assign Fleet Vehicle →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
        Estimated carrier payouts and multi-pickup savings are calculated using standard per-km and consolidation metrics. Final payouts subject to completion settlement.
      </p>
    </div>
  );
}
