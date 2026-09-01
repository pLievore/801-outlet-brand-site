import {
  HeaderSkeleton,
  ListSkeleton,
  LoadingAnnouncement,
} from '../_components/skeleton';

export default function LoadingProducts() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton actions={3} />
      <ListSkeleton rows={8} withThumb />
      <LoadingAnnouncement>Loading products.</LoadingAnnouncement>
    </div>
  );
}
