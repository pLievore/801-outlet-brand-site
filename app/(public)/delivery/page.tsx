import Link from 'next/link';
import {
  Armchair,
  Home,
  MapPin,
  PackageCheck,
  PhoneCall,
  Recycle,
  Sparkles,
  Truck,
} from 'lucide-react';

import { env } from '../../../src/config/env';
import { FadeIn, FadeMount, StaggerGrid, StaggerItem } from '../../components/motion';
import { ButtonLink } from '../../components/ui/button';
import { Container } from '../../components/ui/container';

export const metadata = {
  title: 'Delivery Information — 801 Outlet',
  description:
    'Fast and reliable furniture delivery across Utah, Wyoming, Idaho and Nevada. Learn about our delivery process, coverage areas, fees and scheduling options.',
};

const STATES = ['Utah', 'Wyoming', 'Idaho', 'Nevada'];

const PROCESS_STEPS = [
  {
    title: 'Place your order',
    description:
      'Browse our collection and complete your purchase. Fast delivery items are marked clearly.',
    icon: PackageCheck,
  },
  {
    title: 'We contact you',
    description:
      "Within 24–48 hours we'll reach out by phone or email to confirm your address and preferred dates.",
    icon: PhoneCall,
  },
  {
    title: 'Schedule delivery',
    description:
      "We'll find a delivery window that fits your schedule. Most deliveries happen Monday–Friday.",
    icon: Truck,
  },
  {
    title: 'Receive your furniture',
    description:
      'Our team brings your furniture home, handles placement, and removes the packaging.',
    icon: Armchair,
  },
];

export default function DeliveryPage() {
  const phoneHref = env.getPhoneHref();

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-[rgb(var(--border))] bg-[rgb(var(--sage-soft))]">
        <Container size="narrow" className="py-16 text-center md:py-24">
          <FadeMount delay={0.05}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--sage-ink))]">
              <Truck aria-hidden="true" className="size-4" />
              Utah · Wyoming · Idaho · Nevada
            </span>
          </FadeMount>
          <FadeMount delay={0.12}>
            <h1 className="font-display mt-6 text-5xl leading-none tracking-tight md:text-7xl">
              From our floor
              <br />
              <span className="italic text-[rgb(var(--sage-ink))]">to your door.</span>
            </h1>
          </FadeMount>
          <FadeMount delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[rgb(var(--muted))] md:text-lg">
              We deliver across Utah — and to Wyoming, Idaho and Nevada for an
              additional distance-based charge. Curbside drop-off or full
              inside-home setup, you pick.
            </p>
          </FadeMount>
        </Container>
      </section>

      <Container className="py-14 md:py-20">
        {/* Pricing */}
        <FadeIn>
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              DELIVERY FEE · SALT LAKE CITY AREA
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
              Simple, honest <span className="italic">pricing</span>
            </h2>
          </div>
        </FadeIn>

        <StaggerGrid className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          <StaggerItem>
            <div className="flex h-full flex-col rounded-3xl border border-[rgb(var(--border))] bg-white p-8 transition hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--muted))]">
                <MapPin aria-hidden="true" className="size-4" />
                Curbside
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl tracking-tight">$60</span>
                <span className="text-sm text-[rgb(var(--muted))]">flat</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-[rgb(var(--muted))]">
                We bring your furniture right to your doorstep or garage —
                perfect if you have helping hands at home.
              </p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="relative flex h-full flex-col rounded-3xl bg-[rgb(var(--sage-ink))] p-8 text-white transition hover:-translate-y-[2px] hover:shadow-[0_14px_38px_rgba(62,82,64,0.35)]">
              <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                Most popular
              </span>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                <Home aria-hidden="true" className="size-4" />
                Inside home setup
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl tracking-tight">$120</span>
                <span className="text-sm text-white/70">flat</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/80">
                We carry everything inside, place each piece in the room you
                choose and take the packaging with us.
              </p>
            </div>
          </StaggerItem>
        </StaggerGrid>

        <FadeIn>
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-6 text-[rgb(var(--muted))]">
            Flat rates cover the Salt Lake City area up to{' '}
            <span className="font-semibold text-[rgb(var(--fg))]">40 miles</span>.
            Beyond that we add{' '}
            <span className="font-semibold text-[rgb(var(--fg))]">$3 per extra mile</span>{' '}
            — Wyoming, Idaho and Nevada are quoted the same way, based on
            distance.
          </p>
        </FadeIn>

        {/* Coverage */}
        <FadeIn>
          <div className="mt-14 grid overflow-hidden rounded-3xl border border-[rgb(var(--border))] bg-white lg:grid-cols-2">
            <div className="p-8 md:p-12">
              <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
                COVERAGE
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
                Where we <span className="italic">deliver</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[rgb(var(--muted))]">
                The entire state of Utah, plus Wyoming, Idaho and Nevada for an
                additional distance-based charge. Homes, apartments and
                condominiums are all welcome.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {STATES.map((state) => (
                  <span
                    key={state}
                    className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-1.5 text-xs font-semibold"
                  >
                    {state}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-center gap-5 border-t border-[rgb(var(--border))] bg-[rgb(var(--surface-muted))] p-8 md:p-12 lg:border-l lg:border-t-0">
              <div className="flex items-start gap-3">
                <Sparkles
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-[rgb(var(--accent))]"
                />
                <p className="text-sm leading-6">
                  <span className="font-semibold">Special requests</span>
                  <br />
                  <span className="text-[rgb(var(--muted))]">
                    Something out of the ordinary? Contact us and we&apos;ll
                    work it out together.
                  </span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Recycle
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-[rgb(var(--sage-ink))]"
                />
                <p className="text-sm leading-6">
                  <span className="font-semibold">Old furniture removal</span>
                  <br />
                  <span className="text-[rgb(var(--muted))]">
                    We can haul away your old piece when the new one arrives —
                    ask when scheduling.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Speed options */}
        <FadeIn>
          <div className="mt-14 text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              DELIVERY OPTIONS
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
              Choose your <span className="italic">speed</span>
            </h2>
          </div>
        </FadeIn>

        <StaggerGrid className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          <StaggerItem>
            <div className="flex h-full flex-col rounded-3xl border border-[rgb(var(--border))] bg-white p-7 transition hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)]">
              <span className="font-display text-3xl italic text-[rgb(var(--accent))]">
                3–5
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--muted))]">
                business days
              </span>
              <h3 className="mt-4 text-base font-semibold">Fast delivery</h3>
              <p className="mt-1.5 text-sm leading-6 text-[rgb(var(--muted))]">
                Available for select in-stock items — perfect when you need your
                furniture quickly.
              </p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="flex h-full flex-col rounded-3xl border border-[rgb(var(--border))] bg-white p-7 transition hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)]">
              <span className="font-display text-3xl italic text-[rgb(var(--sage-ink))]">
                7–14
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--muted))]">
                business days
              </span>
              <h3 className="mt-4 text-base font-semibold">Scheduled delivery</h3>
              <p className="mt-1.5 text-sm leading-6 text-[rgb(var(--muted))]">
                Standard option for every item — we&apos;ll agree on a window
                that works for you after purchase.
              </p>
            </div>
          </StaggerItem>
        </StaggerGrid>

        {/* Process timeline */}
        <FadeIn>
          <div className="mt-14 text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              HOW IT WORKS
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
              Four steps, <span className="italic">zero stress</span>
            </h2>
          </div>
        </FadeIn>

        <StaggerGrid className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS_STEPS.map((step, index) => (
            <StaggerItem key={step.title}>
              <div className="relative flex h-full flex-col rounded-3xl border border-[rgb(var(--border))] bg-white p-6 transition hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)]">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-full bg-[rgb(var(--sage-soft))] text-[rgb(var(--sage-ink))]">
                    <step.icon aria-hidden="true" className="size-5" />
                  </span>
                  <span className="font-display text-3xl italic text-[rgb(var(--border-strong))]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[rgb(var(--muted))]">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </Container>

      {/* CTA */}
      <FadeIn>
        <section className="border-t border-[rgb(var(--border))] bg-[rgb(var(--sage-soft))]">
          <Container size="narrow" className="py-16 text-center md:py-20">
            <h2 className="font-display text-4xl leading-tight tracking-tight text-[rgb(var(--sage-ink))] md:text-5xl">
              Ready to <span className="italic">order</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[rgb(var(--sage-ink))]">
              Browse our collection and place your order — we&apos;ll handle the
              rest and bring it to your door.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/products" variant="primary" size="lg">
                Browse products
              </ButtonLink>
              <ButtonLink href={phoneHref} variant="secondary" size="lg">
                Call (801) 854-6060
              </ButtonLink>
            </div>
            <p className="mt-6 text-xs text-[rgb(var(--sage-ink))]/80">
              Questions about delivery?{' '}
              <Link href="/contact" className="font-semibold underline underline-offset-4">
                Send us a message
              </Link>
              .
            </p>
          </Container>
        </section>
      </FadeIn>
    </main>
  );
}
