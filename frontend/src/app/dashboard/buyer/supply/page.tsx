'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Leaf, Search, Plus, MapPin, Calendar, Tag } from 'lucide-react';
import { api, ProduceListing } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function BuyerSupplyPage() {
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  useEffect(() => {
    api.buyers.supply()
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      (item.fpo?.name && item.fpo.name.toLowerCase().includes(search.toLowerCase())) ||
      (item.farmer?.user.name && item.farmer.user.name.toLowerCase().includes(search.toLowerCase()));

    const matchesGrade = selectedGrade === 'ALL' || item.grade === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  const totalAvailableKg = listings.reduce((sum, item) => sum + (item.availableQty || item.quantity), 0);

  if (loading) return <div className="text-gray-500">Loading available supply catalog...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Farm Supply</h1>
          <p className="text-gray-500 mt-1">Live verified inventory from regional FPOs and individual farmers</p>
        </div>
        <Link href="/dashboard/buyer/create-demand" className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create Demand Request
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Live Listings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{listings.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Available Produce</p>
          <p className="text-2xl font-bold text-primary-700 mt-1">{(totalAvailableKg / 1000).toFixed(1)} Tonnes</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Sourcing Direct From</p>
          <p className="text-2xl font-bold text-navy-800 mt-1">FPOs & Farmers</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center pb-4 border-b border-gray-100 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search crop, supplier, or location..."
              className="input pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Grade:</span>
            {['ALL', 'A', 'B', 'C'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedGrade === g
                    ? 'bg-navy-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g === 'ALL' ? 'All' : `Grade ${g}`}
              </button>
            ))}
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Leaf className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-base font-medium">No produce listings found matching your search</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b text-gray-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-medium">Produce</th>
                  <th className="pb-3 font-medium">Supplier</th>
                  <th className="pb-3 font-medium">Available / Total</th>
                  <th className="pb-3 font-medium">Grade</th>
                  <th className="pb-3 font-medium">Expected Price</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Harvest Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Procure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredListings.map((item) => {
                  const supplierName = item.fpo?.name || item.farmer?.user?.name || 'Local Producer';
                  const isFpo = !!item.fpo;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3.5 font-medium text-gray-900 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-primary-600" />
                        <div>
                          <p className="font-semibold">{item.product?.name}</p>
                          <p className="text-xs text-gray-400">{item.product?.category}</p>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <p className="font-medium text-gray-800">{supplierName}</p>
                        <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                          isFpo ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {isFpo ? 'FPO Collective' : 'Individual Farmer'}
                        </span>
                      </td>
                      <td className="py-3.5 font-medium">
                        {(item.availableQty || item.quantity).toLocaleString('en-IN')} / {item.quantity.toLocaleString('en-IN')} kg
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-xs font-semibold text-blue-700">
                          Grade {item.grade}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-gray-900">
                        ₹{item.expectedPrice}/kg
                      </td>
                      <td className="py-3.5 text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{item.location}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-gray-500">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(item.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href="/dashboard/buyer/create-demand"
                          className="btn-secondary text-xs px-3 py-1.5"
                        >
                          Request Demand
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
