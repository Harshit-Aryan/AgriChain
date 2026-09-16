import { ArrowDown } from 'lucide-react';

interface Supplier {
  name: string;
  type: string;
  quantity: number;
}

export function ConsolidationTree({ buyer, suppliers }: { buyer: string; suppliers: Supplier[] }) {
  const total = suppliers.reduce((s, sup) => s + sup.quantity, 0);

  return (
    <div className="card p-6">
      <div className="text-center">
        <div className="inline-block px-4 py-2 bg-navy-800 text-white rounded-lg font-semibold text-sm">
          BUYER: {buyer}
        </div>
      </div>

      <div className="flex justify-center my-3">
        <ArrowDown className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {suppliers.map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-primary-600" />
            <div>
              <p className="font-medium text-sm text-gray-900">{s.name}</p>
              <p className="text-xs text-gray-500">{s.type} — {(s.quantity / 1000).toFixed(1)}T</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center my-3">
        <ArrowDown className="w-5 h-5 text-gray-400" />
      </div>

      <div className="text-center">
        <div className="inline-block px-6 py-3 bg-primary-700 text-white rounded-lg font-semibold">
          CONSOLIDATED ORDER — {(total / 1000).toFixed(1)}T
        </div>
      </div>

      <div className="flex justify-center my-3">
        <ArrowDown className="w-5 h-5 text-gray-400" />
      </div>

      <div className="text-center">
        <div className="inline-block px-4 py-2 bg-navy-800 text-white rounded-lg font-semibold text-sm">
          DELIVERY TO {buyer}
        </div>
      </div>
    </div>
  );
}
