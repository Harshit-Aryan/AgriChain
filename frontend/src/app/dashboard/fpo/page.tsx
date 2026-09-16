'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, FPOProfile, ReliabilityData } from '@/lib/api';

export default function FPODashboard() {
  const [profile, setProfile] = useState<FPOProfile | null>(null);
  const [reliability, setReliability] = useState<ReliabilityData | null>(null);

  useEffect(() => {
    Promise.all([api.farmers.fpoProfile(), api.farmers.reliability()])
      .then(([p, r]) => { setProfile(p); setReliability(r); })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{profile?.name || 'FPO Dashboard'}</h1>
        <p className="text-gray-500">{profile?.location} — {profile?.memberCount} members</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Reliability</p>
          <p className="text-3xl font-bold text-primary-700">{reliability?.score ?? profile?.reliabilityScore}/100</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Members</p>
          <p className="text-3xl font-bold">{profile?.memberCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">On-time</p>
          <p className="text-3xl font-bold">{reliability?.onTimeRate}%</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Quality</p>
          <p className="text-3xl font-bold">{reliability?.qualityConsistency}%</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/farmer/listings', label: 'Bulk Inventory', desc: 'Manage aggregated produce listings' },
          { href: '/dashboard/farmer/demands', label: 'Buyer Demands', desc: 'View institutional demand requests' },
          { href: '/dashboard/farmer/orders', label: 'Fulfillment Orders', desc: 'Track large buyer orders' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card p-5 hover:border-primary-300 transition-colors">
            <p className="font-semibold">{item.label}</p>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
