export default function CollectionLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-5 py-14">
      <div className="h-4 w-28 rounded-full bg-neutral-200" />
      <div className="mt-6 h-72 rounded-3xl bg-neutral-200" />
      <div className="mt-14 h-8 w-64 rounded-full bg-neutral-200" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-80 rounded-2xl bg-neutral-200" />
        ))}
      </div>
    </div>
  );
}
