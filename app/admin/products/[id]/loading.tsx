import {
  Bar,
  HeaderSkeleton,
  LoadingAnnouncement,
} from '../../_components/skeleton';

/** Mirrors the editor: details, price and stock, then the photo grid. */
export default function LoadingProduct() {
  return (
    <div className="space-y-6">
      <HeaderSkeleton actions={1} />
      {[0, 1].map((section) => (
        <div
          key={section}
          aria-hidden="true"
          className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-6"
        >
          <Bar className="h-4 w-32" />
          <Bar className="mt-4 h-11 w-full" />
          <Bar className="mt-3 h-24 w-full" />
        </div>
      ))}
      <div
        aria-hidden="true"
        className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5 md:p-6"
      >
        <Bar className="h-4 w-24" />
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Bar key={index} className="aspect-square w-full rounded-2xl" />
          ))}
        </div>
      </div>
      <LoadingAnnouncement>Loading the product.</LoadingAnnouncement>
    </div>
  );
}
