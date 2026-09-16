'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, FarmerProfile, ReliabilityData } from '@/lib/api';

export default function FarmerDashboard() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [reliability, setReliability] = useState<ReliabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.farmers.profile(), api.farmers.reliability()])
      .then(([p, r]) => { setProfile(p); setReliability(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{profile?.farmName || 'Farmer Dashboard'}</h1>
        <p className="text-gray-500">{profile?.location} — {profile?.user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-gray-500">Reliability Score</p>
          <p className="text-3xl font-bold text-primary-700">{reliability?.score ?? '—'}/100</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">On-time Delivery</p>
          <p className="text-3xl font-bold">{reliability?.onTimeRate ?? '—'}%</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Order Completion</p>
          <p className="text-3xl font-bold">{reliability?.orderCompletion?.toFixed(0) ?? '—'}%</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-gray-500">Avg Rating</p>
          <p className="text-3xl font-bold">{reliability?.avgRating ?? '—'}/5</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/farmer/listings', label: 'Manage Listings', desc: 'Add and update produce listings' },
          { href: '/dashboard/farmer/demands', label: 'View Demands', desc: 'See buyer demand requests' },
          { href: '/dashboard/farmer/matching', label: 'AI Opportunities', desc: 'View matching opportunities' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card p-5 hover:border-primary-300 transition-colors">
            <p className="font-semibold text-gray-900">{item.label}</p>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
