import Link from 'next/link';
import { env } from '../../src/config/env';

export const metadata = {
  title: 'About Us — 801 Outlet',
  description:
    'Learn about 801 Outlet — your trusted source for premium furniture at outlet prices in Utah.',
};

export default function AboutPage() {
  const phoneHref = env.getPhoneHref();

  return (
    <main>
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-14">
        <div>
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            801 OUTLET • ABOUT
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Premium comfort. Outlet prices.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))]">
            We re Utah s destination for premium furniture deals. Offering curated collections of
            sofas, beds, recliners, and more — all at outlet prices, delivered directly to your
            home.
          </p>
        </div>

        {/* Mission */}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Our mission</h2>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                We believe everyone deserves premium furniture without the premium price tag. Thats
                why we source high-quality pieces directly and pass the savings on to you. Clean
                design, modern aesthetics, and reliable quality — thats the 801 Outlet promise.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-8">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            OUR VALUES
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            What we stand for
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Quality */}
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:-translate-y-[1px] hover:shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))]">
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
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Quality</h3>
              <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
                Every piece we offer meets our standards for durability, comfort, and design. No
                compromises.
              </p>
            </div>

            {/* Value */}
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:-translate-y-[1px] hover:shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))]">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Value</h3>
              <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
                Outlet pricing means you get premium furniture at a fraction of retail prices.
                Real savings, real quality.
              </p>
            </div>

            {/* Service */}
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:-translate-y-[1px] hover:shadow-sm">
              <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))]">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold">Service</h3>
              <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
                From browsing to delivery, we re here to help. Personal service, reliable delivery,
                and ongoing support.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mt-12">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            WHY CHOOSE US
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            What makes us different
          </h2>

          <div className="mt-8 space-y-6">
            {[
              {
                title: 'Utah-focused',
                description:
                  'We specialize in serving Utah customers. This means faster delivery, local expertise, and personalized service tailored to your needs.',
              },
              {
                title: 'Curated selection',
                description:
                  'Every product is handpicked for quality and style. No overwhelming catalogs — just great pieces that fit modern lifestyles.',
              },
              {
                title: 'Direct savings',
                description:
                  'By working directly with manufacturers and distributors, we cut out the middleman and pass savings directly to you.',
              },
              {
                title: 'Honest pricing',
                description:
                  'What you see is what you get. No hidden fees, no surprises. Clear pricing with transparent delivery terms.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex gap-4 rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:shadow-sm"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent))]/10">
                  <div className="size-2 rounded-full bg-[rgb(var(--accent))]" />
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

        {/* What We Offer */}
        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">What we offer</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            Our collection focuses on the essentials of comfortable living. Each category is curated
            with attention to both style and practicality.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Sofas', desc: 'Modern comfort for your living space' },
              { name: 'Sectionals', desc: 'Spacious seating for family time' },
              { name: 'Recliners', desc: 'Relaxation at its finest' },
              { name: 'Beds', desc: 'Restful nights start here' },
            ].map((item) => (
              <div
                key={item.name}
                className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4 transition hover:-translate-y-[1px] hover:shadow-sm"
              >
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-8 md:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Ready to transform your space?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
              Browse our curated collection of premium furniture at outlet prices. Fast delivery
              available throughout Utah.
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
                Get in touch
              </a>
            </div>

            <div className="mt-6 text-xs text-[rgb(var(--muted))]">
              Have questions?{' '}
              <a
                href={phoneHref}
                className="font-semibold text-[rgb(var(--accent))] hover:opacity-80"
              >
                Call us
              </a>
              {' '}or{' '}
              <Link
                href="/contact"
                className="font-semibold text-[rgb(var(--accent))] hover:opacity-80"
              >
                send us a message
              </Link>
              .
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
