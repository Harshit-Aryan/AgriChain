'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus, ArrowRight } from 'lucide-react';
import { api, Demand } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function BuyerDemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    api.buyers.demands()
      .then(setDemands)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredDemands = demands.filter((d) => {
    if (filter === 'ALL') return true;
    return d.status === filter;
  });

  const totalDemands = demands.length;
  const openDemands = demands.filter((d) => d.status === 'OPEN' || d.status === 'MATCHING').length;
  const fulfilledDemands = demands.filter((d) => d.status === 'FULFILLED' || d.status === 'MATCHED').length;

  if (loading) return <div className="text-gray-500">Loading buyer demands...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Demands</h1>
          <p className="text-gray-500 mt-1">Track and manage produce purchase requirements</p>
        </div>
        <Link href="/dashboard/buyer/create-demand" className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create New Demand
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Demands</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalDemands}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Open / Matching</p>
          <p className="text-2xl font-bold text-primary-700 mt-1">{openDemands}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Fulfilled</p>
          <p className="text-2xl font-bold text-navy-800 mt-1">{fulfilledDemands}</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-700" />
            <h2 className="font-semibold text-gray-900">Demands List</h2>
          </div>
          <div className="flex gap-2">
            {['ALL', 'OPEN', 'MATCHED', 'FULFILLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  filter === tab
                    ? 'bg-navy-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredDemands.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-base font-medium">No demands found</p>
            <p className="text-sm mt-1">Post a demand to match with local FPOs and farmers</p>
            <Link href="/dashboard/buyer/create-demand" className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Demand
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b text-gray-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Quantity</th>
                  <th className="pb-3 font-medium">Grade</th>
                  <th className="pb-3 font-medium">Max Budget</th>
                  <th className="pb-3 font-medium">Delivery Location</th>
                  <th className="pb-3 font-medium">Required By</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDemands.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 font-medium text-gray-900">{d.product?.name || 'Produce'}</td>
                    <td className="py-3.5">{d.quantity.toLocaleString('en-IN')} kg</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-xs font-semibold text-gray-700">
                        Grade {d.grade}
                      </span>
                    </td>
                    <td className="py-3.5 font-medium">₹{d.maxPrice}/kg</td>
                    <td className="py-3.5">{d.deliveryLocation}</td>
                    <td className="py-3.5 text-gray-500">
                      {new Date(d.requiredBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/dashboard/buyer/matching/${d.id}`}
                        className="inline-flex items-center gap-1 text-primary-700 hover:text-primary-900 font-medium"
                      >
                        {d.status === 'OPEN' || d.status === 'MATCHING' ? 'AI Matching' : 'View Matches'}
                        <ArrowRight className="w-3.5 h-3.5" />
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
