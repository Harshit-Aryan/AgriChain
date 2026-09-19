'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Truck, CheckCircle2, Play, Navigation, AlertCircle, ArrowUpRight } from 'lucide-react';
import { api, LogisticsJob } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function LogisticsMyJobsPage() {
  const [jobs, setJobs] = useState<LogisticsJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadJobs = () => {
    api.logistics.myJobs()
      .then((data) => {
        setJobs(Array.isArray(data) ? data : data ? [data] : []);
      })
      .catch((err) => {
        console.error('Failed to load logistics jobs:', err);
        setJobs([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleStatusUpdate = async (jobId: string, nextStatus: string) => {
    setUpdatingId(jobId);
    setMessage(null);
    try {
      await api.logistics.updateStatus(jobId, nextStatus);
      setMessage({
        text: `Job status updated to ${nextStatus}. Order milestone automatically recorded!`,
        type: 'success',
      });
      loadJobs();
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : 'Failed to update job status',
        type: 'error',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="text-gray-500">Loading assigned logistics jobs...</div>;

  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const filteredJobs = safeJobs.filter((j) => {
    if (!j) return false;
    if (activeTab === 'ALL') return true;
    return j.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assigned Trips</h1>
          <p className="text-gray-500 mt-1">Live dispatch control and real-time delivery milestone tracking</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/logistics/routes" className="btn-secondary text-sm inline-flex items-center gap-1.5">
            <Navigation className="w-4 h-4" /> Route Optimization Map
          </Link>
          <Link href="/dashboard/logistics/jobs" className="btn-primary text-sm inline-flex items-center gap-1.5">
            <Truck className="w-4 h-4" /> Claim New Job
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {['ALL', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-navy-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {tab.replace('_', ' ')}
            <span className="ml-1.5 opacity-70">
              ({tab === 'ALL' ? safeJobs.length : safeJobs.filter((j) => j && j.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <Truck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No trips in this category</h3>
          <p className="text-sm mt-1">Accept open jobs from the marketplace to dispatch your fleet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            if (!job) return null;
            const isUpdating = updatingId === job.id;

            return (
              <div key={job.id || Math.random()} className="card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-bold text-gray-900">
                        {job.order?.orderNumber || (job.id ? `Job #${String(job.id).slice(0, 8)}` : 'Job')}
                      </span>
                      <StatusBadge status={job.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Assigned Vehicle:{' '}
                      <span className="font-mono font-semibold text-navy-900">
                        {job.vehicle?.registration || 'Vehicle Allocated'}
                      </span>{' '}
                      ({(job.vehicle?.type ? String(job.vehicle.type).replace(/_/g, ' ') : 'Truck')})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {job.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleStatusUpdate(job.id, 'IN_PROGRESS')}
                        disabled={isUpdating}
                        className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5 bg-blue-700 hover:bg-blue-800"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        {isUpdating ? 'Updating...' : 'Start Trip (Mark In Transit)'}
                      </button>
                    )}

                    {job.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusUpdate(job.id, 'COMPLETED')}
                        disabled={isUpdating}
                        className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2.5 bg-green-700 hover:bg-green-800"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isUpdating ? 'Completing...' : 'Mark Delivered & Complete Trip'}
                      </button>
                    )}

                    {job.status === 'COMPLETED' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-800 text-xs font-bold border border-green-200">
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> Trip Completed & Handed Over
                      </span>
                    )}

                    <Link
                      href="/dashboard/logistics/routes"
                      className="btn-secondary text-xs px-3 py-2 inline-flex items-center gap-1"
                    >
                      Inspect Route <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">Total Freight</span>
                    <span className="font-semibold text-gray-900">{Number(job.totalLoad || 0).toLocaleString('en-IN')} kg</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Delivery Destination</span>
                    <span className="font-semibold text-gray-900">{job.order?.deliveryLocation || 'Mumbai'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Distance</span>
                    <span className="font-semibold text-gray-900">{job.totalDistance || 0} km</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Payout (est.)</span>
                    <span className="font-semibold text-green-800">₹{Number(job.estimatedCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
