import {
  Bar,
  HeaderSkeleton,
  ListSkeleton,
  LoadingAnnouncement,
  StatRowSkeleton,
} from '../_components/skeleton';

export default function LoadingFunnel() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton actions={0} />
      <StatRowSkeleton />
      <div
        aria-hidden="true"
        className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5"
      >
        <Bar className="h-4 w-48" />
        <Bar className="mt-5 h-52 w-full" />
      </div>
      <ListSkeleton rows={5} />
      <LoadingAnnouncement>Loading the funnel.</LoadingAnnouncement>
    </div>
  );
}
