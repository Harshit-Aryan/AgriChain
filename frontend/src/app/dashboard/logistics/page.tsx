'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, Package, MapPin, CheckCircle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { api, LogisticsProfile, LogisticsJob, Vehicle } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function LogisticsDashboard() {
  const [profile, setProfile] = useState<LogisticsProfile | null>(null);
  const [availableJobs, setAvailableJobs] = useState<LogisticsJob[]>([]);
  const [myJobs, setMyJobs] = useState<LogisticsJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.logistics.profile().catch(() => null),
      api.logistics.jobs().catch(() => []),
      api.logistics.myJobs().catch(() => []),
    ])
      .then(([prof, avail, mine]) => {
        if (prof) setProfile(prof);
        setAvailableJobs(Array.isArray(avail) ? avail : []);
        setMyJobs(Array.isArray(mine) ? mine : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading logistics command center...</div>;

  const vehicles: Vehicle[] = Array.isArray(profile?.vehicles) ? profile.vehicles : [];
  const activeJobs = Array.isArray(myJobs) ? myJobs.filter((j) => j && (j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS')) : [];
  const completedJobs = Array.isArray(myJobs) ? myJobs.filter((j) => j && j.status === 'COMPLETED') : [];
  const totalTonnageHauled = completedJobs.reduce((sum, j) => sum + (Number(j?.totalLoad) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile?.company || 'Logistics Provider Command Center'}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Carrier
            </span>
          </div>
          <p className="text-gray-500 mt-1 flex items-center gap-1 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            Operational Hub: {profile?.location || 'Mumbai & Western Maharashtra'}
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard/logistics/jobs" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Package className="w-4 h-4" /> Available Jobs ({availableJobs.length})
          </Link>
          <Link href="/dashboard/logistics/routes" className="btn-secondary inline-flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" /> Route Optimization
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Fleet Vehicles', value: vehicles.length, icon: Truck, color: 'text-blue-600', sub: 'Registered' },
          { label: 'Available Jobs', value: availableJobs.length, icon: Package, color: 'text-amber-600', sub: 'Ready to assign' },
          { label: 'Active Trips', value: activeJobs.length, icon: Clock, color: 'text-primary-700', sub: 'In transit / assigned' },
          { label: 'Completed Deliveries', value: completedJobs.length, icon: CheckCircle, color: 'text-green-600', sub: `${(totalTonnageHauled / 1000).toFixed(1)}T hauled` },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-xs text-gray-400">{stat.sub}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Grid: Vehicles Fleet & Active Assignments */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Fleet Inventory */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-700" /> Fleet Vehicles
            </h2>
            <span className="text-xs text-gray-500 font-medium">{vehicles.length} units</span>
          </div>

          {vehicles.length === 0 ? (
            <p className="text-sm text-gray-500">No vehicles registered in fleet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {vehicles.map((v) => (
                <div key={v.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 font-mono text-sm">{v.registration}</p>
                    <p className="text-xs text-gray-500">
                      {v.type.replace('_', ' ')} • Capacity: {(v.capacity ?? 0).toLocaleString('en-IN')} kg
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    v.isAvailable ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {v.isAvailable ? 'Ready for Dispatch' : 'On Assignment'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Active Trips */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-navy-800" /> Active Dispatches
            </h2>
            <Link href="/dashboard/logistics/my-jobs" className="text-xs font-semibold text-primary-700 hover:underline">
              View All ({myJobs.length}) →
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No active dispatches currently.</p>
              <Link href="/dashboard/logistics/jobs" className="text-primary-700 text-xs font-semibold mt-2 inline-block">
                Browse available orders to claim →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div key={job.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-900">
                        {job.order?.orderNumber || `Job #${job.id.slice(0, 8)}`}
                      </p>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Load: {(job.totalLoad ?? 0).toLocaleString('en-IN')} kg • {job.totalDistance ?? 0} km est.
                    </p>
                    <p className="text-xs text-navy-800 mt-0.5">
                      Assigned Vehicle: <span className="font-mono font-medium">{job.vehicle?.registration || 'Vehicle Allocated'}</span>
                    </p>
                  </div>
                  <Link
                    href="/dashboard/logistics/my-jobs"
                    className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                  >
                    Manage <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Available Jobs Preview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-lg text-gray-900">Consolidated Jobs Ready for Transport</h2>
            <p className="text-xs text-gray-500 mt-0.5">Multi-supplier farm pickups consolidated for single-trip transport</p>
          </div>
          <Link href="/dashboard/logistics/jobs" className="btn-primary text-xs">
            Open Job Board →
          </Link>
        </div>

        {availableJobs.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No open jobs awaiting assignment right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b text-gray-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium">Order Number</th>
                  <th className="pb-3 font-medium">Total Load</th>
                  <th className="pb-3 font-medium">Destination</th>
                  <th className="pb-3 font-medium">Distance (est.)</th>
                  <th className="pb-3 font-medium">Payout (est.)</th>
                  <th className="pb-3 font-medium">Consolidated Saving</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {availableJobs.slice(0, 3).map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-mono font-semibold text-gray-900">{job.order?.orderNumber || (job.id ? job.id.slice(0, 8) : 'JOB')}</td>
                    <td className="py-3 font-medium">{(job.totalLoad ?? 0).toLocaleString('en-IN')} kg</td>
                    <td className="py-3 text-gray-700">{job.order?.deliveryLocation || 'Mumbai Hub'}</td>
                    <td className="py-3 text-gray-600">{job.totalDistance ?? 0} km</td>
                    <td className="py-3 font-bold text-gray-900">₹{(job.estimatedCost ?? 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 text-primary-700 font-semibold">
                      ₹{(job.consolidatedSaving ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <Link href="/dashboard/logistics/jobs" className="btn-primary text-xs px-3 py-1.5">
                        Accept Job →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
