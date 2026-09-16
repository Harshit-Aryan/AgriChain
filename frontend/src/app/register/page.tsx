'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Leaf, User, ShoppingCart, Truck, Users, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, setAuth } from '@/lib/api';

const ROLES = [
  {
    id: 'BUYER',
    title: 'Institutional Buyer',
    desc: 'Restaurants, supermarket chains, food processors, exporters',
    icon: ShoppingCart,
  },
  {
    id: 'FARMER',
    title: 'Farmer Producer',
    desc: 'Individual progressive farmers selling harvest directly',
    icon: User,
  },
  {
    id: 'FPO',
    title: 'FPO Aggregator',
    desc: 'Farmer Producer Organization managing bulk cluster supply',
    icon: Users,
  },
  {
    id: 'LOGISTICS',
    title: 'Logistics Provider',
    desc: 'Cold chain carriers and regional transport fleets',
    icon: Truck,
  },
];

const PREFILL_SAMPLES: Record<string, any> = {
  BUYER: {
    name: 'Rohit Sharma',
    email: 'buyer.rohit@sample.in',
    password: 'password123',
    company: 'FreshBazaar Hypermarkets',
    buyerType: 'SUPERMARKET',
    location: 'Mumbai',
    phone: '9820123456',
  },
  FARMER: {
    name: 'Anand Shinde',
    email: 'farmer.anand@sample.in',
    password: 'password123',
    farmName: 'Shinde Organic Orchards',
    location: 'Nashik',
    state: 'Maharashtra',
    district: 'Nashik',
    phone: '9820234567',
  },
  FPO: {
    name: 'Narmada Valley Farmers',
    email: 'fpo.narmada@sample.in',
    password: 'password123',
    fpoName: 'Narmada Agro Producer Co.',
    location: 'Pune',
    state: 'Maharashtra',
    phone: '9820345678',
  },
  LOGISTICS: {
    name: 'Kailash Logistics',
    email: 'logistics.kailash@sample.in',
    password: 'password123',
    company: 'Kailash Cold Fleet Logistics',
    location: 'Mumbai',
    costPerKm: 30,
    phone: '9820456789',
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('BUYER');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: 'Mumbai',
    company: '',
    farmName: '',
    fpoName: '',
    buyerType: 'RESTAURANT',
    costPerKm: 25,
    state: 'Maharashtra',
    district: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handlePreFill = () => {
    const sample = PREFILL_SAMPLES[selectedRole];
    if (sample) {
      const uniqueEmail = sample.email.replace('@', `${Math.floor(Math.random() * 900 + 100)}@`);
      setForm({
        ...form,
        ...sample,
        email: uniqueEmail,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: selectedRole,
        phone: form.phone || undefined,
        location: form.location || undefined,
        state: form.state || undefined,
        district: form.district || undefined,
      };

      if (selectedRole === 'BUYER') {
        payload.company = form.company || form.name;
        payload.buyerType = form.buyerType || 'RESTAURANT';
      } else if (selectedRole === 'FARMER') {
        payload.farmName = form.farmName || `${form.name}'s Farm`;
      } else if (selectedRole === 'FPO') {
        payload.fpoName = form.fpoName || `${form.name} FPO`;
      } else if (selectedRole === 'LOGISTICS') {
        payload.company = form.company || `${form.name} Logistics`;
        payload.costPerKm = Number(form.costPerKm) || 25;
      }

      const { token, user } = await api.auth.register(payload);
      setAuth(token, user);

      const redirects: Record<string, string> = {
        FARMER: '/dashboard/farmer',
        FPO: '/dashboard/fpo',
        BUYER: '/dashboard/buyer',
        LOGISTICS: '/dashboard/logistics',
        ADMIN: '/dashboard/admin',
      };

      router.push(redirects[user.role] || '/dashboard/buyer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <Leaf className="w-8 h-8 text-primary-700" />
            <span className="font-bold text-2xl text-navy-900">AgriChain</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the smart demand-to-delivery agricultural network. Already registered?{' '}
            <Link href="/login" className="font-semibold text-primary-700 hover:text-primary-800">
              Sign in
            </Link>
          </p>
        </div>

        <div className="card p-8 shadow-sm">
          {/* Step 1: Select Role */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Step 1: Choose Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const isSelected = selectedRole === r.id;
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-primary-700 bg-primary-50/60 ring-2 ring-primary-700/20 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>
                        {r.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{r.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Demo Pre-Fill Action */}
          <div className="mb-6 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-lg flex items-center justify-between">
            <span className="text-xs text-gray-600">Testing the SIH demo? Auto-populate sample details:</span>
            <button
              type="button"
              onClick={handlePreFill}
              className="text-xs font-semibold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded border border-gray-200 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Pre-fill Sample Data
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 2: Form Details */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Vikram Mehta"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="e.g. vikram@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Password * (Min 6 chars)</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="e.g. 9820123456"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Primary Operating City / Hub *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Mumbai, Pune, Nashik"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">State</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Maharashtra"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>
            </div>

            {/* Dynamic Role-Specific Fields */}
            {selectedRole === 'BUYER' && (
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-900">Buyer Profile Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Organization / Company Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. SpiceRoute Restaurant Chain"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Buyer Classification</label>
                    <select
                      className="input"
                      value={form.buyerType}
                      onChange={(e) => setForm({ ...form, buyerType: e.target.value })}
                    >
                      <option value="RESTAURANT">Restaurant / Cloud Kitchen</option>
                      <option value="SUPERMARKET">Supermarket / Retail Chain</option>
                      <option value="WHOLESALER">Wholesale Distributor</option>
                      <option value="PROCESSOR">Food Processing Unit</option>
                      <option value="EXPORTER">Agricultural Exporter</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'FARMER' && (
              <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-green-900">Farm Producer Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Farm / Holding Name</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Patil Organic Farms"
                      value={form.farmName}
                      onChange={(e) => setForm({ ...form, farmName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">District / Taluka</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Dindori, Nashik"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'FPO' && (
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">FPO Organization Details</p>
                <div>
                  <label className="label">Registered FPO Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Nashik Sunrise Farmers Producer Co."
                    value={form.fpoName}
                    onChange={(e) => setForm({ ...form, fpoName: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {selectedRole === 'LOGISTICS' && (
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">Fleet Provider Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Transport / Fleet Enterprise</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Raj Cold Chain Transport"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Base Cost (₹ / km)</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="28"
                      value={form.costPerKm}
                      onChange={(e) => setForm({ ...form, costPerKm: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary w-full py-3 text-base font-semibold shadow-sm flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-block animate-pulse">Creating Account & Initializing Profile...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Complete Registration & Open Dashboard
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
