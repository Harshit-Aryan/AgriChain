'use client';

import { useEffect, useState } from 'react';
import { api, AnalyticsDashboard } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.analytics.dashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading analytics...</div>;
  if (!data) return null;

  const { summary, charts, topDemandedCrops, supplyDemandGaps } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Analytics Dashboard</h1>
        <p className="text-gray-500">Supply chain control tower — all metrics are estimates where noted</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Farmers', value: summary.totalFarmers },
          { label: 'FPOs', value: summary.totalFPOs },
          { label: 'Buyers', value: summary.totalBuyers },
          { label: 'Active Orders', value: summary.activeOrders },
          { label: 'Active Demands', value: summary.activeDemands },
          { label: 'Active Listings', value: summary.activeListings },
          { label: 'Transaction Value', value: `₹${(summary.totalTransactionValue / 100000).toFixed(1)}L` },
          { label: 'Est. Logistics Savings', value: `₹${summary.estimatedLogisticsSavings.toLocaleString('en-IN')}` },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Supply vs Demand by Crop</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts.supplyVsDemand}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="demand" fill="#1e3a5f" name="Demand (kg)" />
              <Bar dataKey="supply" fill="#16a34a" name="Supply (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Orders by Crop</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts.ordersByCrop}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="crop" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#15803d" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Demand Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={charts.demandTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="quantity" stroke="#16a34a" name="Quantity (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Regional Demand</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={charts.regionalDemand} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="region" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="quantity" fill="#1e3a5f" name="Demand (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Top Demanded Crops</h2>
          <div className="space-y-3">
            {topDemandedCrops.map((c) => (
              <div key={c.crop} className="flex items-center justify-between">
                <span className="font-medium">{c.crop}</span>
                <span className="text-gray-600">{(c.quantity / 1000).toFixed(1)}T</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">Supply-Demand Gaps (Est.)</h2>
          <div className="space-y-3">
            {supplyDemandGaps.map((g, i) => (
              <div key={i} className="p-3 bg-amber-50 rounded-lg text-sm">
                <p className="font-medium">{g.product} — {g.location}</p>
                <p className="text-amber-700">Potential shortage: {(g.shortage / 1000).toFixed(1)}T (estimate)</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        Estimated farmer realization improvement: ₹{summary.estimatedFarmerImprovement}/kg —
        based on current transaction assumptions, not guaranteed outcomes.
      </div>
    </div>
  );
}
