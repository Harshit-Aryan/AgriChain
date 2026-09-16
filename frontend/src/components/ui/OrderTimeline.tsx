import clsx from 'clsx';
import { Check } from 'lucide-react';

const STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'READY_FOR_PICKUP',
  'IN_TRANSIT',
  'DELIVERED',
  'COMPLETED',
];

export function OrderTimeline({ currentStatus, history }: { currentStatus: string; history?: { status: string; note?: string; createdAt: string }[] }) {
  const currentIdx = STATUSES.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {STATUSES.map((status, idx) => {
        const isComplete = idx <= currentIdx;
        const isCurrent = status === currentStatus;
        const entry = history?.find((h) => h.status === status);

        return (
          <div key={status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2',
                  isComplete ? 'bg-primary-700 border-primary-700 text-white' : 'bg-white border-gray-300 text-gray-400',
                  isCurrent && 'ring-4 ring-primary-100',
                )}
              >
                {isComplete ? <Check className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
              </div>
              {idx < STATUSES.length - 1 && (
                <div className={clsx('w-0.5 h-10', isComplete ? 'bg-primary-600' : 'bg-gray-200')} />
              )}
            </div>
            <div className="pb-8">
              <p className={clsx('font-medium text-sm', isComplete ? 'text-gray-900' : 'text-gray-400')}>
                {status.replace(/_/g, ' ')}
              </p>
              {entry && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {entry.note} — {new Date(entry.createdAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
