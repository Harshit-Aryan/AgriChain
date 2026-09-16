'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, setAuth } from '@/lib/api';

const ROLES = [
  { value: 'FARMER', label: 'Farmer' },
  { value: 'FPO', label: 'FPO' },
  { value: 'BUYER', label: 'Buyer' },
  { value: 'LOGISTICS', label: 'Logistics Provider' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'BUYER', location: 'Mumbai', company: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, user } = await api.auth.register(form);
      setAuth(token, user);
      const redirects: Record<string, string> = {
        FARMER: '/dashboard/farmer', FPO: '/dashboard/fpo', BUYER: '/dashboard/buyer', LOGISTICS: '/dashboard/logistics',
      };
      router.push(redirects[user.role] || '/dashboard/buyer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md card p-8">
        <h2 className="text-2xl font-bold">Create Account</h2>
        <p className="text-sm text-gray-500 mt-1">
          Already have an account? <Link href="/login" className="text-primary-700">Sign in</Link>
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          {form.role === 'BUYER' && (
            <div>
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
