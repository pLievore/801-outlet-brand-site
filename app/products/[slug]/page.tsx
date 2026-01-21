import Link from 'next/link';
import { getProductBySlug } from '../../../src/data/products';
import type { Product } from '../../../src/data/products';

type PageProps = { params: { slug: string } };

export default function ProductDetailPage({ params }: PageProps) {
  const p = getProductBySlug(params.slug) as Product | undefined;

  if (!p) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Link className="mt-4 inline-block text-sm text-[rgb(var(--accent))]" href="/products">
          Back to products →
        </Link>
      </div>
    );
  }

  // TODO: troque pelo número real (US)
  const PHONE_E164 = '+1 385 201 6328';
  const phoneHref = `tel:${PHONE_E164.replace(/[^+\d]/g, '')}`;

  const btnBase =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold ' +
    'transition will-change-transform focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]';

  const btnLift = 'hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0';

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Link
        className="text-xs font-semibold tracking-[0.18em] text-[rgb(var(--muted))]"
        href="/products"
      >
        ← BACK TO CATALOG
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* LEFT: Gallery */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white">
            <div className="relative aspect-4/3 bg-neutral-100">
              <img
                src={p.images[0]?.src}
                alt={p.images[0]?.alt || p.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {p.images.length > 1 ? (
            <div className="grid grid-cols-2 gap-3">
              {p.images.slice(0, 4).map(
                (img: { src: string; alt: string }) => (
                  <div
                    key={img.src}
                    className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-white transition hover:-translate-y-[1px] hover:shadow-sm"
                  >
                    <div className="relative aspect-4/3 bg-neutral-100">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : null}
        </div>

        {/* RIGHT: Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{p.title}</h1>

          <div className="mt-3 flex items-end gap-3">
            <div className="text-2xl font-semibold">${p.price}</div>
            {p.compareAtPrice ? (
              <div className="text-sm text-[rgb(var(--muted))] line-through">${p.compareAtPrice}</div>
            ) : null}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-[rgb(var(--muted))]">
            {p.shortDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1">
              {p.fastDelivery ? 'Fast delivery' : 'Scheduled delivery'}
            </span>
            <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1">
              {p.inStock ? 'In stock' : 'Out of stock'}
            </span>
            <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1">
              Utah only
            </span>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              className={btnBase + ' bg-[rgb(var(--fg))] text-white hover:opacity-95 ' + btnLift}
              href={phoneHref}
            >
              Call Now
            </a>

            <a
              className={
                btnBase +
                ' border border-[rgb(var(--border))] bg-white text-[rgb(var(--fg))] hover:bg-neutral-50 ' +
                btnLift
              }
              href={p.shopifyUrl}
              target="_blank"
              rel="noreferrer"
            >
              Buy on Shopify
            </a>
          </div>

          <div className="mt-8 rounded-2xl border border-[rgb(var(--border))] bg-white p-5">
            <div className="text-sm font-semibold">Details</div>

            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {p.specs.material ? (
                <div>
                  <dt className="text-xs text-[rgb(var(--muted))]">Material</dt>
                  <dd className="font-medium">{p.specs.material}</dd>
                </div>
              ) : null}

              {p.specs.color ? (
                <div>
                  <dt className="text-xs text-[rgb(var(--muted))]">Color</dt>
                  <dd className="font-medium">{p.specs.color}</dd>
                </div>
              ) : null}

              {p.specs.dimensions ? (
                <div>
                  <dt className="text-xs text-[rgb(var(--muted))]">Dimensions</dt>
                  <dd className="font-medium">{p.specs.dimensions}</dd>
                </div>
              ) : null}

              {p.specs.seating ? (
                <div>
                  <dt className="text-xs text-[rgb(var(--muted))]">Seating</dt>
                  <dd className="font-medium">{p.specs.seating}</dd>
                </div>
              ) : null}

              {p.specs.condition ? (
                <div>
                  <dt className="text-xs text-[rgb(var(--muted))]">Condition</dt>
                  <dd className="font-medium">{p.specs.condition}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-4 text-xs text-[rgb(var(--muted))]">
              Delivery is available in Utah only. After purchase, we’ll confirm a delivery window.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
