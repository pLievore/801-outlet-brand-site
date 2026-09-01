import {
  HeaderSkeleton,
  LoadingAnnouncement,
  StatRowSkeleton,
} from '../_components/skeleton';
import { Bar } from '../_components/skeleton';

export default function LoadingSales() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton actions={0} />
      <StatRowSkeleton />
      <div
        aria-hidden="true"
        className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5"
      >
        <Bar className="h-4 w-40" />
        <Bar className="mt-5 h-64 w-full" />
      </div>
      <LoadingAnnouncement>Loading sales.</LoadingAnnouncement>
    </div>
  );
}
