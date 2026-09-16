'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { IndianRupee, ArrowLeft } from 'lucide-react';
import { api, PriceBreakdown } from '@/lib/api';
import { PriceBreakdownCard } from '@/components/ui/PriceBreakdownCard';

export default function StandalonePriceBreakdownPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.orders.priceBreakdown(id)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch price breakdown'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-gray-500">Loading transparent price breakdown...</div>;
  if (error || !data) {
    return (
      <div className="card p-8 text-center text-red-600">
        <p className="font-semibold">Unable to load price transparency data</p>
        <p className="text-sm text-gray-500 mt-1">{error || 'Order not found'}</p>
        <Link href="/dashboard/buyer/orders" className="btn-secondary mt-4 inline-flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/buyer/orders/${id}`} className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Order
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-primary-700" /> Price Transparency Audit
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Order {data.orderNumber} • {data.totalQuantity.toLocaleString('en-IN')} kg</p>
        </div>
      </div>

      <PriceBreakdownCard data={data} />
    </div>
  );
}
