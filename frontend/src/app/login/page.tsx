'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, ShieldAlert, UserCheck, AlertCircle } from 'lucide-react';
import { api, setAuth } from '@/lib/api';

const ROLE_REDIRECT: Record<string, string> = {
  FARMER: '/dashboard/farmer',
  FPO: '/dashboard/fpo',
  BUYER: '/dashboard/buyer',
  LOGISTICS: '/dashboard/logistics',
  ADMIN: '/dashboard/admin',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@agrichain.in');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const executeLogin = async (targetEmail: string, targetPass: string) => {
    setLoading(true);
    setError('');
    try {
      const { token, user } = await api.auth.login(targetEmail, targetPass);
      setAuth(token, user);
      router.push(ROLE_REDIRECT[user.role] || '/dashboard/buyer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Brand Hero Sidebar */}
      <div className="hidden lg:flex lg:w-5/12 bg-navy-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary-400" />
            <span className="font-bold text-2xl tracking-tight">AgriChain</span>
          </Link>
          <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary-300">
            SIH 2026 National Finalist Prototype
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight">
            Demand-to-Delivery Agricultural Intelligence.
          </h1>
          <p className="text-gray-300 text-base leading-relaxed">
            Eliminating multi-middleman losses through AI-guided multi-supplier consolidation, dynamic route dispatch, and transparent farmer price realization.
          </p>

          <div className="bg-white/10 rounded-xl p-5 border border-white/10 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-2 text-primary-300 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4" /> Admin Credentials
            </div>
            <div className="text-sm font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white font-semibold">admin@agrichain.in</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Password:</span>
                <span className="text-white font-semibold">demo123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-400">
          AgriChain Platform © 2026. All benchmark comparisons are algorithmic estimates.
        </div>
      </div>

      {/* Main Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          {/* Mobile Brand Header */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-primary-700" />
              <span className="font-bold text-xl text-navy-900">AgriChain</span>
            </Link>
            <Link href="/register" className="text-sm font-semibold text-primary-700">
              Register →
            </Link>
          </div>

          <div className="card p-8 shadow-md">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sign in to AgriChain</h2>
                <p className="mt-1 text-gray-500 text-sm">Enter your account credentials</p>
              </div>
              <Link href="/register" className="hidden sm:inline-flex text-xs font-semibold text-primary-700 hover:underline">
                Create Account →
              </Link>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Credentials Reference Card */}
            <div className="mt-5 p-4 bg-slate-900 text-white rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Admin & Demo Credentials
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Password: demo123
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-1.5 rounded bg-white/5">
                  <span className="text-slate-400 font-sans">Admin (Control Tower):</span>
                  <span className="text-amber-300 font-semibold">admin@agrichain.in</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-white/5">
                  <span className="text-slate-400 font-sans">Buyer (SpiceRoute):</span>
                  <span className="text-white">buyer@mumbai.com</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-white/5">
                  <span className="text-slate-400 font-sans">Logistics (Fleet):</span>
                  <span className="text-white">logistics@agrichain.in</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-white/5">
                  <span className="text-slate-400 font-sans">Farmer (Producer):</span>
                  <span className="text-white">farmer.rajesh@agrichain.in</span>
                </div>
                <div className="flex items-center justify-between p-1.5 rounded bg-white/5">
                  <span className="text-slate-400 font-sans">FPO (Aggregator):</span>
                  <span className="text-white">fpo.nashik@agrichain.in</span>
                </div>
              </div>
            </div>

            {/* Standard Manual Form */}
            <form onSubmit={handleManualSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="admin@agrichain.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Password</label>
                  <span className="text-xs text-gray-400 font-mono">demo123</span>
                </div>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-block animate-pulse">Authenticating...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" /> Sign In
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Need a new test profile?{' '}
              <Link href="/register" className="text-primary-700 font-semibold hover:underline">
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
