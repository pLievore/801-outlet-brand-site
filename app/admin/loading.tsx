import {
  HeaderSkeleton,
  ListSkeleton,
  LoadingAnnouncement,
  StatRowSkeleton,
} from './_components/skeleton';

export default function LoadingOverview() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton actions={0} />
      <StatRowSkeleton />
      <ListSkeleton rows={5} />
      <LoadingAnnouncement>Loading the panel.</LoadingAnnouncement>
    </div>
  );
}
