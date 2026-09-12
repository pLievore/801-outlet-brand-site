import {
  HeaderSkeleton,
  ListSkeleton,
  LoadingAnnouncement,
} from '../_components/skeleton';

export default function LoadingOrders() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton actions={0} />
      <ListSkeleton rows={8} />
      <LoadingAnnouncement>Loading orders.</LoadingAnnouncement>
    </div>
  );
}
