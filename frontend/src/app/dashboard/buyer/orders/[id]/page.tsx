'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { api, Order, PriceBreakdown, LogisticsJob } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OrderTimeline } from '@/components/ui/OrderTimeline';
import { PriceBreakdownCard } from '@/components/ui/PriceBreakdownCard';
import { ConsolidationTree } from '@/components/ui/ConsolidationTree';

const RouteMap = dynamic(() => import('@/components/map/RouteMap').then((m) => m.RouteMap), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 animate-pulse" style={{ height: '350px' }}>
      Loading Route Map...
    </div>
  ),
});

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [priceData, setPriceData] = useState<PriceBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.orders.get(id), api.orders.priceBreakdown(id)])
      .then(([o, p]) => { setOrder(o); setPriceData(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-gray-500">Loading order...</div>;
  if (!order) return <div className="text-red-600">Order not found</div>;

  const job = order.logisticsJob;
  const rawPoints = (job?.routePoints || job?.route?.waypoints || job?.pickupSequence || []) as { name: string; lat: number; lng: number; type?: string; load?: number }[];
  const routePoints = rawPoints.map((p, idx) => ({
    name: p.name,
    lat: p.lat,
    lng: p.lng,
    type: (p.type || (idx === rawPoints.length - 1 ? 'delivery' : 'pickup')).toLowerCase(),
    load: p.load,
  }));

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/buyer/orders" className="text-sm text-primary-700 hover:underline">← All Orders</Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-gray-500 mt-1">
          {order.totalQuantity.toLocaleString('en-IN')} kg → {order.deliveryLocation} — Required by {new Date(order.requiredBy).toLocaleDateString('en-IN')}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h2 className="font-semibold text-lg mb-6">Delivery Timeline</h2>
          <OrderTimeline currentStatus={order.status} history={order.statusHistory} />
        </div>

        {priceData && <PriceBreakdownCard data={priceData} />}
      </div>

      {order.items && order.items.length > 0 && (
        <ConsolidationTree
          buyer={order.deliveryLocation}
          suppliers={order.items.map((item) => ({
            name: item.fpo?.name || item.farmer?.user?.name || 'Supplier',
            type: item.fpo ? 'FPO' : 'Farmer',
            quantity: item.quantity,
          }))}
        />
      )}

      {job && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Logistics Plan</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Total Load</p>
                <p className="font-bold">{job.totalLoad?.toLocaleString('en-IN')} kg</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Distance (est.)</p>
                <p className="font-bold">{job.totalDistance} km</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Cost (est.)</p>
                <p className="font-bold">₹{job.estimatedCost?.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <p className="text-primary-700">Saving (est.)</p>
                <p className="font-bold text-primary-800">₹{job.consolidatedSaving?.toLocaleString('en-IN')}</p>
              </div>
            </div>
            {job.pickupSequence && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pickup Sequence</p>
                <div className="flex flex-wrap gap-2">
                  {(job.pickupSequence as { name: string }[]).map((p, i) => (
                    <span key={i} className="px-3 py-1 bg-navy-800 text-white text-xs rounded-full">
                      {i + 1}. {p.name}
                    </span>
                  ))}
                  <span className="px-3 py-1 bg-primary-700 text-white text-xs rounded-full">→ {order.deliveryLocation}</span>
                </div>
              </div>
            )}
            <p className="text-xs text-amber-600">All logistics savings shown as ESTIMATES, not guaranteed results.</p>
          </div>

          <div className="card p-4">
            <h2 className="font-semibold text-lg mb-4 px-2">Route Map</h2>
            <RouteMap points={routePoints} height="350px" />
          </div>
        </div>
      )}
    </div>
  );
}
