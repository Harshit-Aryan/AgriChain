'use client';

import { useEffect, useState } from 'react';
import { api, Demand } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function FarmerDemandsPage() {
  const [demands, setDemands] = useState<Demand[]>([]);

  useEffect(() => { api.farmers.demands().then(setDemands); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Buyer Demands</h1>
      <div className="grid gap-4">
        {demands.map((d) => (
          <div key={d.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-lg">{d.product.name}</p>
                <p className="text-gray-500 text-sm">{d.buyer?.company} — {d.deliveryLocation}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div><p className="text-gray-500">Quantity</p><p className="font-medium">{d.quantity.toLocaleString('en-IN')} kg</p></div>
              <div><p className="text-gray-500">Max Price</p><p className="font-medium">₹{d.maxPrice}/kg</p></div>
              <div><p className="text-gray-500">Grade</p><p className="font-medium">{d.grade}</p></div>
              <div><p className="text-gray-500">Required By</p><p className="font-medium">{new Date(d.requiredBy).toLocaleDateString('en-IN')}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
