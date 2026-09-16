'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf } from 'lucide-react';
import { api, setAuth } from '@/lib/api';

const DEMO_ACCOUNTS = [
  { email: 'buyer@mumbai.com', role: 'Buyer (Demo Flow)' },
  { email: 'admin@agrichain.in', role: 'Admin' },
  { email: 'fpo.nashik@agrichain.in', role: 'FPO A' },
  { email: 'farmer.rajesh@agrichain.in', role: 'Farmer C' },
  { email: 'logistics@agrichain.in', role: 'Logistics' },
];

const ROLE_REDIRECT: Record<string, string> = {
  FARMER: '/dashboard/farmer',
  FPO: '/dashboard/fpo',
  BUYER: '/dashboard/buyer',
  LOGISTICS: '/dashboard/logistics',
  ADMIN: '/dashboard/admin',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('buyer@mumbai.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token, user } = await api.auth.login(email, password);
      setAuth(token, user);
      router.push(ROLE_REDIRECT[user.role] || '/dashboard/buyer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 text-white p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-8 h-8 text-primary-400" />
          <span className="font-bold text-xl">AgriChain</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">From Demand to Delivery.</h1>
          <p className="mt-4 text-gray-400 text-lg">Connect directly. Consolidate orders. Optimize logistics.</p>
        </div>
        <p className="text-sm text-gray-500">All demo accounts use password: demo123</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
          <p className="mt-1 text-gray-500 text-sm">
            No account? <Link href="/register" className="text-primary-700 font-medium">Register</Link>
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Demo Login</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword('demo123'); }}
                  className="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium">{acc.role}</span>
                  <span className="text-gray-400 ml-2">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
