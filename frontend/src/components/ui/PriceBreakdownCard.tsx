import { PriceBreakdown } from '@/lib/api';

export function PriceBreakdownCard({ data }: { data: PriceBreakdown }) {
  const pb = data.priceBreakdown;

  return (
    <div className="card p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Transparent Price Breakdown</h3>
        <p className="text-sm text-gray-500 mt-1">Order {data.orderNumber} — {data.totalQuantity.toLocaleString('en-IN')} kg</p>
      </div>

      <div className="space-y-3">
        <PriceRow label="Buyer pays" value={`₹${pb.buyerPaysPerKg}/kg`} highlight />
        <PriceRow label="Less: Logistics (est.)" value={`- ₹${pb.logisticsPerKg.toFixed(2)}/kg`} negative />
        <PriceRow label="Less: Platform fee" value={`- ₹${pb.platformFeePerKg.toFixed(2)}/kg`} negative />
        <div className="border-t pt-3">
          <PriceRow label="Farmer realization (est.)" value={`₹${pb.farmerRealizationPerKg.toFixed(2)}/kg`} highlight green />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Traditional (est.)</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">₹{data.comparison.traditional?.toFixed(2)}/kg</p>
        </div>
        <div className="p-4 bg-primary-50 rounded-lg text-center border border-primary-200">
          <p className="text-xs text-primary-700 uppercase tracking-wide">Platform (est.)</p>
          <p className="text-2xl font-bold text-primary-800 mt-1">₹{data.comparison.platform?.toFixed(2)}/kg</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Estimated difference:</strong> ₹{data.comparison.difference?.toFixed(2)}/kg per kg
        </p>
        <p className="text-xs text-blue-600 mt-1">{data.comparison.label}</p>
      </div>

      {data.isEstimate && (
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          ⚠ All figures are ESTIMATES based on current transaction assumptions, not guaranteed outcomes.
        </p>
      )}
    </div>
  );
}

function PriceRow({ label, value, highlight, negative, green }: { label: string; value: string; highlight?: boolean; negative?: boolean; green?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`font-medium ${green ? 'text-primary-700' : negative ? 'text-red-600' : highlight ? 'text-gray-900' : 'text-gray-700'}`}>
        {value}
      </span>
    </div>
  );
}
