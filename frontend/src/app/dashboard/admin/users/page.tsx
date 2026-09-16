'use client';

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Users</h1>
      <div className="card p-6">
        <p className="text-gray-600">User management is available via the Admin Analytics dashboard. Demo accounts are pre-seeded for all roles.</p>
        <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
          {[
            'admin@agrichain.in — Admin',
            'buyer@mumbai.com — Buyer',
            'fpo.nashik@agrichain.in — FPO A',
            'fpo.pune@agrichain.in — FPO B',
            'farmer.rajesh@agrichain.in — Farmer C',
            'farmer.sunita@agrichain.in — Farmer D',
            'logistics@agrichain.in — Logistics',
          ].map((u) => (
            <div key={u} className="p-3 bg-gray-50 rounded-lg font-mono text-xs">{u}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
