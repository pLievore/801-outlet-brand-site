export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-5 py-14">
      <div className="h-4 w-40 rounded-full bg-neutral-200" />
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="aspect-4/3 rounded-3xl bg-neutral-200" />
        <div>
          <div className="h-4 w-28 rounded-full bg-neutral-200" />
          <div className="mt-4 h-12 w-full rounded-2xl bg-neutral-200" />
          <div className="mt-5 h-8 w-32 rounded-full bg-neutral-200" />
          <div className="mt-8 h-40 rounded-2xl bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}
