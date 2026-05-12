import type { Group } from '@/types';
import { groupStatusLabel } from './helpers';

export function GroupStatusBadge({ status }: { status: Group['approvalStatus'] }) {
  const styles = [
    'bg-amber-100 text-amber-700 border-amber-300',
    'bg-emerald-100 text-emerald-700 border-emerald-300',
    'bg-red-100 text-red-700 border-red-300',
  ];
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {groupStatusLabel(status)}
    </span>
  );
}
