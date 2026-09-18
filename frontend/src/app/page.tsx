import Link from 'next/link';
import { Leaf, ArrowDown, ChevronRight } from 'lucide-react';

const FLOW = [
  'BUYER DEMAND',
  'AI MATCHING',
  'FARMERS / FPOs',
  'ORDER CONSOLIDATION',
  'SMART LOGISTICS',
  'DELIVERY',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-primary-700" />
            <span className="font-bold text-xl text-navy-900">KRISHILINK</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
            <Link href="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-800 rounded-full text-sm font-medium mb-6">
          SIH 2026 Prototype — Demand-Driven Agricultural Supply Chain
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-navy-900 leading-tight">
          From Demand to Delivery.
        </h1>
        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          An AI-powered agricultural supply chain connecting farmers, buyers and logistics in one intelligent network.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="btn-primary px-8 py-3 text-base inline-flex items-center gap-2">
            Explore Platform <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="btn-secondary px-8 py-3 text-base">
            View Demo
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
            How It Works
          </h2>
          <div className="space-y-3">
            {FLOW.map((step, i) => (
              <div key={step}>
                <div className="flex items-center justify-center">
                  <div className="px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm font-semibold text-navy-800 text-sm w-full max-w-xs text-center">
                    {step}
                  </div>
                </div>
                {i < FLOW.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="w-4 h-4 text-primary-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Demand-First System', desc: 'Buyers post requirements. AI finds and consolidates multiple suppliers to fulfill large orders.' },
            { title: 'Smart Logistics', desc: 'Route optimization reduces trips. Multi-pickup consolidation saves estimated logistics costs.' },
            { title: 'Transparent Pricing', desc: 'See exactly how money flows from buyer to farmer. Compare traditional vs platform realization.' },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="font-semibold text-lg text-navy-900">{f.title}</h3>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold">Ready to see the complete demo flow?</h2>
          <p className="mt-2 text-gray-400">Login as Mumbai restaurant buyer and create a 10-tonne tomato demand</p>
          <Link href="/login" className="mt-6 inline-block btn-primary px-8 py-3">
            Start Demo
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-500">
        KRISHILINK — AI-Powered Demand-to-Delivery Agricultural Supply Chain © 2026
      </footer>
    </div>
  );
}
