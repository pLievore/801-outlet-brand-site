import Link from 'next/link';
import { env } from '../../src/config/env';

export const metadata = {
  title: 'Delivery Information — 801 Outlet',
  description:
    'Fast and reliable furniture delivery across Utah. Learn about our delivery process, coverage areas, and scheduling options.',
};

export default function DeliveryPage() {
  const phoneHref = env.getPhoneHref();

  return (
    <main>
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-14">
        <div>
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            801 OUTLET • DELIVERY
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Utah delivery service
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))]">
            We deliver premium furniture directly to your home across Utah. Fast delivery available
            for select items, or scheduled delivery at your convenience.
          </p>
        </div>

        {/* Coverage Area */}
        <div className="mt-10 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent))]/10">
              <svg
                className="size-5 text-[rgb(var(--accent))]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Utah-only delivery</h2>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                We currently serve the entire state of Utah. Delivery is available to residential
                addresses including homes, apartments, and condominiums. After you complete your
                purchase, well contact you within 24-48 hours to confirm your address and schedule
                a delivery window that works for you.
              </p>
            </div>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="mt-8">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            DELIVERY OPTIONS
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Choose your delivery speed
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Fast Delivery */}
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:-translate-y-[1px] hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-[rgb(var(--accent))]" />
                    <h3 className="text-sm font-semibold">Fast Delivery</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
                    Available for select items in stock. Typically delivered within 3-5 business
                    days. Perfect for when you need your furniture quickly.
                  </p>
                  <div className="mt-4">
                    <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1 text-[11px] font-semibold text-[rgb(var(--fg))]">
                      In-stock items only
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduled Delivery */}
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:-translate-y-[1px] hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-[rgb(var(--muted))]" />
                    <h3 className="text-sm font-semibold">Scheduled Delivery</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
                    Standard delivery option for all items. Well contact you after purchase to
                    schedule a convenient delivery window. Usually 7-14 business days.
                  </p>
                  <div className="mt-4">
                    <span className="rounded-full border border-[rgb(var(--border))] bg-white px-3 py-1 text-[11px] font-semibold text-[rgb(var(--fg))]">
                      All items
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process */}
        <div className="mt-12">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            HOW IT WORKS
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Simple delivery process
          </h2>

          <div className="mt-8 space-y-6">
            {[
              {
                step: '1',
                title: 'Place your order',
                description:
                  'Browse our collection and complete your purchase on Shopify. Fast delivery items will be marked clearly.',
              },
              {
                step: '2',
                title: 'We contact you',
                description:
                  'Within 24-48 hours, well reach out via phone or email to confirm your delivery address and preferred dates.',
              },
              {
                step: '3',
                title: 'Schedule delivery',
                description:
                  'Well work with you to find a delivery window that fits your schedule. Most deliveries happen Monday-Friday.',
              },
              {
                step: '4',
                title: 'Receive your furniture',
                description:
                  'Our delivery team will bring your furniture to your home, handle placement, and remove packaging materials.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-4 rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:shadow-sm"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] text-sm font-semibold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[rgb(var(--muted))]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Info */}
        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Important information</h2>

          <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-[rgb(var(--muted))]">Delivery fee</dt>
              <dd className="mt-1 text-sm font-medium">Included in Utah</dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-[rgb(var(--muted))]">Delivery hours</dt>
              <dd className="mt-1 text-sm font-medium">Monday - Friday, 9 AM - 6 PM</dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-[rgb(var(--muted))]">Setup included</dt>
              <dd className="mt-1 text-sm font-medium">Basic placement and unpacking</dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-[rgb(var(--muted))]">Special requests</dt>
              <dd className="mt-1 text-sm font-medium">Contact us to discuss</dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-[rgb(var(--muted))]">Stairs/elevators</dt>
              <dd className="mt-1 text-sm font-medium">Up to 2 flights included</dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-[rgb(var(--muted))]">Removal service</dt>
              <dd className="mt-1 text-sm font-medium">Old furniture removal available</dd>
            </div>
          </dl>
        </div>

        {/* CTA Section */}
        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-8 md:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Ready to order?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
              Browse our collection and place your order. Well handle the rest and get your
              furniture delivered to your Utah home.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0"
              >
                Browse products
              </Link>

              <a
                href={phoneHref}
                className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--border))] bg-white px-6 py-3 text-sm font-semibold text-[rgb(var(--fg))] transition hover:-translate-y-[1px] hover:bg-neutral-50 hover:shadow-sm active:translate-y-0"
              >
                Call us
              </a>
            </div>

            <div className="mt-6 text-xs text-[rgb(var(--muted))]">
              Questions about delivery?{' '}
              <a
                href={phoneHref}
                className="font-semibold text-[rgb(var(--accent))] hover:opacity-80"
              >
                Give us a call
              </a>
              {' '}or{' '}
              <Link
                href="/contact"
                className="font-semibold text-[rgb(var(--accent))] hover:opacity-80"
              >
                contact us
              </Link>
              .
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
