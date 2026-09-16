'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, ShieldAlert, ArrowRight, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';
import { api, setAuth } from '@/lib/api';

const ROLE_REDIRECT: Record<string, string> = {
  FARMER: '/dashboard/farmer',
  FPO: '/dashboard/fpo',
  BUYER: '/dashboard/buyer',
  LOGISTICS: '/dashboard/logistics',
  ADMIN: '/dashboard/admin',
};

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    name: 'System Admin',
    email: 'admin@agrichain.in',
    badge: 'System Control Tower',
    color: 'bg-red-50 border-red-200 text-red-900',
  },
  {
    role: 'Buyer',
    name: 'Vikram Mehta (SpiceRoute)',
    email: 'buyer@mumbai.com',
    badge: 'Demand Creator',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
  },
  {
    role: 'Logistics',
    name: 'Raj Cold Chain Services',
    email: 'logistics@agrichain.in',
    badge: 'Fleet Dispatcher',
    color: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  {
    role: 'FPO A',
    name: 'Nashik Sunrise FPO',
    email: 'fpo.nashik@agrichain.in',
    badge: 'Aggregator (45 Farmers)',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  },
  {
    role: 'Farmer C',
    name: 'Rajesh Patil',
    email: 'farmer.rajesh@agrichain.in',
    badge: 'Direct Farm Producer',
    color: 'bg-green-50 border-green-200 text-green-900',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@agrichain.in');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [instantLoginRole, setInstantLoginRole] = useState<string | null>(null);

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
      setInstantLoginRole(null);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  const handleInstantLogin = (targetEmail: string, roleName: string) => {
    setEmail(targetEmail);
    setPassword('demo123');
    setInstantLoginRole(roleName);
    executeLogin(targetEmail, 'demo123');
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
                <p className="mt-1 text-gray-500 text-sm">Select an account or enter custom credentials</p>
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

            {/* Quick 1-Click Admin Access Banner */}
            <div className="mt-5 p-4 bg-navy-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                    Admin
                  </span>
                  <span className="font-bold text-sm">System Control Tower</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">admin@agrichain.in (demo123)</p>
              </div>
              <button
                type="button"
                onClick={() => handleInstantLogin('admin@agrichain.in', 'Admin')}
                disabled={loading}
                className="px-3 py-1.5 bg-white text-navy-900 hover:bg-gray-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-sm"
              >
                {instantLoginRole === 'Admin' ? 'Entering...' : '1-Click Admin'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleManualSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Password</label>
                  <span className="text-xs text-gray-400">Default: demo123</span>
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
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading && !instantLoginRole ? (
                  <span className="inline-block animate-pulse">Authenticating...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" /> Sign In
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Role Logins */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                1-Click Persona Logins (Instant Access)
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.filter((acc) => acc.role !== 'Admin').map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleInstantLogin(acc.email, acc.role)}
                    disabled={loading}
                    className="text-left p-2.5 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50/50 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-gray-900 group-hover:text-primary-800">
                        {acc.role}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">1-click</span>
                    </div>
                    <span className="text-xs text-gray-600 truncate mt-1">{acc.name}</span>
                    <span className="text-[11px] text-gray-400 font-mono truncate">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>

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
