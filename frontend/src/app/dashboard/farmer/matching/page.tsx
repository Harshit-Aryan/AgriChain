'use client';

import { useEffect, useState } from 'react';
import { api, SupplierMatch } from '@/lib/api';
import { ScoreBar } from '@/components/ui/ScoreBar';

export default function FarmerMatchingPage() {
  const [matches, setMatches] = useState<SupplierMatch[]>([]);

  useEffect(() => { api.farmers.matching().then(setMatches); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Matching Opportunities</h1>
      {matches.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">No matching opportunities yet. Listings will be matched when buyers post demands.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {matches.map((m) => (
            <div key={m.id} className="card p-5">
              <p className="font-semibold">{m.demand?.product.name} — {m.allocatedQty.toLocaleString('en-IN')} kg</p>
              <p className="text-sm text-gray-500">{m.demand?.buyer?.company} — {m.demand?.deliveryLocation}</p>
              <p className="text-2xl font-bold text-primary-700 mt-2">{m.matchScore}% match</p>
              <div className="mt-3 space-y-1">
                <ScoreBar label="Price" score={m.priceScore} />
                <ScoreBar label="Reliability" score={m.reliabilityScore} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
