'use client';

import { useEffect, useState } from 'react';
import { api, EarningsData } from '@/lib/api';

export default function EarningsPage() {
  const [data, setData] = useState<EarningsData | null>(null);
  useEffect(() => { api.farmers.earnings().then(setData); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Earnings & Transactions</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-6">
          <p className="text-sm text-gray-500">Total Earnings</p>
          <p className="text-4xl font-bold text-primary-700">₹{data?.totalEarnings.toLocaleString('en-IN') ?? '0'}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-500">Orders Completed</p>
          <p className="text-4xl font-bold">{data?.orderCount ?? 0}</p>
        </div>
      </div>
      <p className="text-xs text-amber-600">Earnings are based on completed order payouts. Actual realization may vary.</p>
    </div>
  );
}
