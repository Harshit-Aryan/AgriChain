'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, MatchingResult, Order } from '@/lib/api';
import { ScoreBar } from '@/components/ui/ScoreBar';
import { ConsolidationTree } from '@/components/ui/ConsolidationTree';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function MatchingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<MatchingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.matching.run(id)
      .then(setResult)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    if (!result) return;
    setConfirming(true);
    setError('');
    try {
      const matchIds = result.matches.map((m) => m.id);
      await api.matching.confirm(id, matchIds);
      const newOrder = await api.orders.create(id, matchIds);
      setOrder(newOrder);
      const job = await api.logistics.createJob(newOrder.id);
      router.push(`/dashboard/buyer/orders/${newOrder.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div className="text-gray-500">Running AI supplier matching...</div>;
  if (error && !result) return <div className="text-red-600">{error}</div>;
  if (!result) return null;

  const { demand, matches, consolidation } = result;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/buyer" className="text-sm text-primary-700 hover:underline">← Back to Dashboard</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">AI Supplier Matching</h1>
        <p className="text-gray-500 mt-1">
          {demand.product.name} — {demand.quantity.toLocaleString('en-IN')} kg — {demand.deliveryLocation}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Required</p>
          <p className="text-2xl font-bold">{(consolidation.totalRequired / 1000).toFixed(1)}T</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Total Allocated</p>
          <p className="text-2xl font-bold text-primary-700">{(consolidation.totalAllocated / 1000).toFixed(1)}T</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Suppliers Matched</p>
          <p className="text-2xl font-bold">{consolidation.supplierCount}</p>
          <StatusBadge status={consolidation.isFullyMatched ? 'MATCHED' : 'MATCHING'} />
        </div>
      </div>

      <ConsolidationTree
        buyer={demand.deliveryLocation}
        suppliers={matches.map((m) => ({
          name: m.supplierName || m.fpo?.name || m.farmer?.user?.name || 'Supplier',
          type: m.supplierType || (m.fpo ? 'FPO' : 'Farmer'),
          quantity: m.allocatedQty,
        }))}
      />

      <div>
        <h2 className="font-semibold text-lg mb-4">Supplier Match Scores</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {matches.map((m) => (
            <div key={m.id} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{m.supplierName || m.fpo?.name || m.farmer?.user?.name}</p>
                  <p className="text-sm text-gray-500">{m.supplierType} — {m.allocatedQty.toLocaleString('en-IN')} kg</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-700">{m.matchScore}%</p>
                  <p className="text-xs text-gray-500">Match Score</p>
                </div>
              </div>
              <div className="space-y-2">
                <ScoreBar label="Price" score={m.priceScore} />
                <ScoreBar label="Distance" score={m.distanceScore} />
                <ScoreBar label="Quantity" score={m.quantityScore} />
                <ScoreBar label="Quality" score={m.qualityScore} />
                <ScoreBar label="Reliability" score={m.reliabilityScore} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.isEstimate && (
        <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
          Match scores are calculated using weighted factors: Price (30%), Distance (20%), Quantity (20%), Quality (15%), Delivery (10%), Reliability (5%).
        </p>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!order && (
        <button onClick={handleConfirm} className="btn-primary px-8 py-3 text-base" disabled={confirming || !consolidation.isFullyMatched}>
          {confirming ? 'Creating Order...' : 'Confirm Suppliers & Create Consolidated Order →'}
        </button>
      )}
    </div>
  );
}
