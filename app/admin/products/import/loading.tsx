import {
  Bar,
  HeaderSkeleton,
  ListSkeleton,
  LoadingAnnouncement,
} from '../../_components/skeleton';

export default function LoadingImport() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton actions={1} />
      <Bar className="h-28 w-full rounded-3xl" />
      <ListSkeleton rows={4} />
      <LoadingAnnouncement>Loading the spreadsheet import.</LoadingAnnouncement>
    </div>
  );
}
