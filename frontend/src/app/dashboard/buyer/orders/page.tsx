'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Order } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.buyers.orders().then(setOrders).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      {orders.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <p>No orders yet.</p>
          <Link href="/dashboard/buyer/create-demand" className="text-primary-700 font-medium mt-2 inline-block">Create a demand →</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Quantity</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-4 font-mono text-xs">{o.orderNumber}</td>
                  <td className="p-4">{o.demand?.product.name || '—'}</td>
                  <td className="p-4">{o.totalQuantity.toLocaleString('en-IN')} kg</td>
                  <td className="p-4">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="p-4"><StatusBadge status={o.status} /></td>
                  <td className="p-4">
                    <Link href={`/dashboard/buyer/orders/${o.id}`} className="text-primary-700 font-medium hover:underline">Track →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
