'use client';

import { useEffect, useState } from 'react';
import { api, ProduceListing, Product } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function ListingsPage() {
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productId: '', quantity: 2000, grade: 'A', expectedPrice: 22, harvestDate: '2026-09-18', location: 'Nashik' });
  const [loading, setLoading] = useState(false);

  const load = () => api.farmers.listings().then(setListings);
  useEffect(() => {
    load();
    api.products.list().then((p) => { setProducts(p); setForm((f) => ({ ...f, productId: p[0]?.id || '' })); });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.farmers.createListing(form);
      setShowForm(false);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produce Listings</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">+ Add Listing</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 grid md:grid-cols-2 gap-4">
          <div>
            <label className="label">Product</label>
            <select className="input" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quantity (kg)</label>
            <input type="number" className="input" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: +e.target.value })} />
          </div>
          <div>
            <label className="label">Grade</label>
            <select className="input" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
              <option value="A">A</option><option value="B">B</option><option value="C">C</option>
            </select>
          </div>
          <div>
            <label className="label">Expected Price (₹/kg)</label>
            <input type="number" className="input" value={form.expectedPrice} onChange={(e) => setForm({ ...form, expectedPrice: +e.target.value })} />
          </div>
          <div>
            <label className="label">Harvest Date</label>
            <input type="date" className="input" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Create Listing'}</button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-500">
              <th className="p-4">Product</th><th className="p-4">Qty</th><th className="p-4">Grade</th>
              <th className="p-4">Price</th><th className="p-4">Location</th><th className="p-4">Available</th><th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="p-4 font-medium">{l.product.name}</td>
                <td className="p-4">{l.quantity.toLocaleString('en-IN')} kg</td>
                <td className="p-4">Grade {l.grade}</td>
                <td className="p-4">₹{l.expectedPrice}/kg</td>
                <td className="p-4">{l.location}</td>
                <td className="p-4">{new Date(l.harvestDate).toLocaleDateString('en-IN')}</td>
                <td className="p-4"><StatusBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
