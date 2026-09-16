'use client';

import { useEffect, useState } from 'react';
import { api, OrderItem } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  useEffect(() => { api.farmers.orders().then(setOrders); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="p-4">Order</th><th className="p-4">Product</th><th className="p-4">Qty</th><th className="p-4">Payout</th><th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-4 font-mono text-xs">{o.order.orderNumber}</td>
                <td className="p-4">{o.productName}</td>
                <td className="p-4">{o.quantity.toLocaleString('en-IN')} kg</td>
                <td className="p-4">₹{o.farmerPayout.toLocaleString('en-IN')}</td>
                <td className="p-4"><StatusBadge status={o.order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
