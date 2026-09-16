'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, Truck, TrendingUp } from 'lucide-react';
import { api, Demand, Order } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function BuyerDashboard() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [supplyCount, setSupplyCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.buyers.demands().catch(() => []),
      api.buyers.orders().catch(() => []),
      api.buyers.supply().catch(() => []),
    ])
      .then(([d, o, s]) => {
        setDemands(d);
        setOrders(o);
        setSupplyCount(s.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="text-gray-500 mt-1">SpiceRoute Restaurant Chain — Mumbai</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Demands', value: demands.filter((d) => d.status !== 'FULFILLED').length, icon: ShoppingCart, color: 'text-blue-600' },
          { label: 'Total Orders', value: orders.length, icon: Truck, color: 'text-green-600' },
          { label: 'Open Listings Available', value: supplyCount, icon: Package, color: 'text-purple-600' },
          { label: 'Forecast Available', value: 'Yes', icon: TrendingUp, color: 'text-orange-600' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Recent Demands</h2>
          <Link href="/dashboard/buyer/create-demand" className="btn-primary text-sm">+ Create Demand</Link>
        </div>
        {demands.length === 0 ? (
          <p className="text-gray-500 text-sm">No demands yet. Create your first demand to start the demo flow.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Product</th>
                  <th className="pb-3 font-medium">Quantity</th>
                  <th className="pb-3 font-medium">Max Price</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {demands.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50">
                    <td className="py-3 font-medium">{d.product.name}</td>
                    <td className="py-3">{d.quantity.toLocaleString('en-IN')} kg</td>
                    <td className="py-3">₹{d.maxPrice}/kg</td>
                    <td className="py-3">{d.deliveryLocation}</td>
                    <td className="py-3"><StatusBadge status={d.status} /></td>
                    <td className="py-3">
                      <Link href={`/dashboard/buyer/matching/${d.id}`} className="text-primary-700 font-medium hover:underline">
                        {d.status === 'OPEN' ? 'Run AI Matching →' : 'View Matches →'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-6 bg-primary-50 border-primary-200">
        <h3 className="font-semibold text-primary-900">Demo Flow Guide</h3>
        <ol className="mt-3 space-y-2 text-sm text-primary-800 list-decimal list-inside">
          <li>Create a 10,000 kg Tomato demand for Mumbai</li>
          <li>Run AI supplier matching to find FPOs and farmers</li>
          <li>Confirm suppliers and create consolidated order</li>
          <li>View logistics route and price breakdown</li>
          <li>Track delivery status through completion</li>
        </ol>
      </div>
    </div>
  );
}
