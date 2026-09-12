import {
  Bar,
  HeaderSkeleton,
  LoadingAnnouncement,
} from '../../_components/skeleton';

export default function LoadingNewProduct() {
  return (
    <div className="max-w-3xl space-y-6">
      <HeaderSkeleton actions={0} />
      <div aria-hidden="true" className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index}>
            <Bar className="h-3 w-24" />
            <Bar className="mt-2 h-11 w-full" />
          </div>
        ))}
        <Bar className="h-28 w-full rounded-2xl" />
      </div>
      <LoadingAnnouncement>Loading the form.</LoadingAnnouncement>
    </div>
  );
}
