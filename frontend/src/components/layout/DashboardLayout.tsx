'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  LayoutDashboard, Package, ShoppingCart, Truck, BarChart3,
  LogOut, Menu, X, Leaf, Users, TrendingUp, MapPin, IndianRupee,
} from 'lucide-react';
import { getUser, clearAuth, User } from '@/lib/api';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  FARMER: [
    { href: '/dashboard/farmer', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/dashboard/farmer/listings', label: 'My Listings', icon: <Package className="w-5 h-5" /> },
    { href: '/dashboard/farmer/demands', label: 'Buyer Demands', icon: <ShoppingCart className="w-5 h-5" /> },
    { href: '/dashboard/farmer/matching', label: 'AI Matching', icon: <TrendingUp className="w-5 h-5" /> },
    { href: '/dashboard/farmer/orders', label: 'Orders', icon: <Truck className="w-5 h-5" /> },
    { href: '/dashboard/farmer/earnings', label: 'Earnings', icon: <IndianRupee className="w-5 h-5" /> },
  ],
  FPO: [
    { href: '/dashboard/fpo', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/dashboard/farmer/listings', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
    { href: '/dashboard/farmer/demands', label: 'Buyer Demands', icon: <ShoppingCart className="w-5 h-5" /> },
    { href: '/dashboard/farmer/matching', label: 'AI Matching', icon: <TrendingUp className="w-5 h-5" /> },
    { href: '/dashboard/farmer/orders', label: 'Orders', icon: <Truck className="w-5 h-5" /> },
    { href: '/dashboard/farmer/earnings', label: 'Earnings', icon: <IndianRupee className="w-5 h-5" /> },
  ],
  BUYER: [
    { href: '/dashboard/buyer', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/dashboard/buyer/demands', label: 'My Demands', icon: <ShoppingCart className="w-5 h-5" /> },
    { href: '/dashboard/buyer/create-demand', label: 'Create Demand', icon: <Package className="w-5 h-5" /> },
    { href: '/dashboard/buyer/supply', label: 'Available Supply', icon: <Leaf className="w-5 h-5" /> },
    { href: '/dashboard/buyer/orders', label: 'Orders', icon: <Truck className="w-5 h-5" /> },
    { href: '/dashboard/forecast', label: 'Demand Forecast', icon: <BarChart3 className="w-5 h-5" /> },
  ],
  LOGISTICS: [
    { href: '/dashboard/logistics', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: '/dashboard/logistics/jobs', label: 'Available Jobs', icon: <Package className="w-5 h-5" /> },
    { href: '/dashboard/logistics/my-jobs', label: 'My Jobs', icon: <Truck className="w-5 h-5" /> },
    { href: '/dashboard/logistics/routes', label: 'Route Map', icon: <MapPin className="w-5 h-5" /> },
  ],
  ADMIN: [
    { href: '/dashboard/admin', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { href: '/dashboard/forecast', label: 'Forecasting', icon: <TrendingUp className="w-5 h-5" /> },
    { href: '/dashboard/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUserState] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push('/login');
      return;
    }
    setUserState(u);
  }, [router]);

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!user) return null;

  const navItems = NAV_BY_ROLE[user.role] || [];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy-900 text-white flex flex-col transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-primary-400" />
            <div>
              <p className="font-bold text-lg leading-tight">AgriChain</p>
              <p className="text-xs text-gray-400">Demand-to-Delivery</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-primary-700 text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-900">AgriChain</span>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
