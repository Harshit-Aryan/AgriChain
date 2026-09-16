'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Product } from '@/lib/api';

export default function CreateDemandPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    productId: '',
    quantity: 10000,
    grade: 'A',
    maxPrice: 25,
    deliveryLocation: 'Mumbai',
    requiredBy: '2026-09-20',
    notes: 'Grade A tomatoes for restaurant chain weekly supply',
  });

  useEffect(() => {
    api.products.list().then((p) => {
      setProducts(p);
      const tomato = p.find((x) => x.name === 'Tomato');
      if (tomato) setForm((f) => ({ ...f, productId: tomato.id }));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const demand = await api.buyers.createDemand(form);
      router.push(`/dashboard/buyer/matching/${demand.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create demand');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Create Demand Request</h1>
      <p className="text-gray-500 mt-1">Post your requirement — the system will find and consolidate suppliers</p>

      <form onSubmit={handleSubmit} className="card p-6 mt-6 space-y-5">
        <div>
          <label className="label">Product</label>
          <select className="input" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
            <option value="">Select product</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Quantity (kg)</label>
            <input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} required />
          </div>
          <div>
            <label className="label">Quality Grade</label>
            <select className="input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Maximum Price (₹/kg)</label>
            <input type="number" step="0.5" className="input" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: +e.target.value })} required />
          </div>
          <div>
            <label className="label">Required By</label>
            <input type="date" className="input" value={form.requiredBy} onChange={(e) => setForm({ ...form, requiredBy: e.target.value })} required />
          </div>
        </div>
        <div>
          <label className="label">Delivery Location</label>
          <select className="input" value={form.deliveryLocation} onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })}>
            {['Mumbai', 'Pune', 'Nashik', 'Delhi', 'Nagpur', 'Indore'].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea className="input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Example:</strong> 10,000 kg Grade-A Tomato, max ₹25/kg, delivery Mumbai by 20 Sept
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? 'Creating Demand...' : 'Post Demand & Run AI Matching →'}
        </button>
      </form>
    </div>
  );
}
