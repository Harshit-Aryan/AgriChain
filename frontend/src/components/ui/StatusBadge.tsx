import clsx from 'clsx';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  OPEN: 'bg-blue-100 text-blue-800',
  MATCHING: 'bg-purple-100 text-purple-800',
  MATCHED: 'bg-indigo-100 text-indigo-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-orange-100 text-orange-800',
  READY_FOR_PICKUP: 'bg-cyan-100 text-cyan-800',
  IN_TRANSIT: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  AVAILABLE: 'bg-green-100 text-green-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  FULFILLED: 'bg-green-100 text-green-800',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={clsx('badge', statusColors[status] || 'bg-gray-100 text-gray-800')}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
