import Link from 'next/link';
import {
  Armchair,
  ArrowUpDown,
  CalendarDays,
  Home,
  MapPin,
  PackageCheck,
  PhoneCall,
  Recycle,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react';

import { env } from '../../../src/config/env';
import {
  DELIVERY_RADIUS,
  DELIVERY_SCHEDULE,
  DELIVERY_STATES,
  DELIVERY_TIERS,
  EXPRESS_DELIVERY,
  SOFA_REMOVAL,
  formatDeliveryPrice,
} from '../../../src/lib/content/delivery';
import { FadeIn, FadeMount, StaggerGrid, StaggerItem } from '../../components/motion';
import { ButtonLink } from '../../components/ui/button';
import { Container } from '../../components/ui/container';

export const metadata = {
  title: 'Delivery Information — 801 Outlet',
  description:
    'Fast and reliable furniture delivery across Utah, Wyoming, Idaho and Nevada. Learn about our delivery process, coverage areas, fees and scheduling options.',
};

/** Presentation only — the prices and rules live in `src/lib/content/delivery`. */
const TIER_ICONS = {
  curbside: MapPin,
  'inside-home': Home,
  upstairs: ArrowUpDown,
} as const;

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
      'Standard deliveries go out Monday or Tuesday of the following week. Need it sooner? Add express at checkout.',
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

        <StaggerGrid className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
          {DELIVERY_TIERS.map((tier) => {
            const Icon = TIER_ICONS[tier.id as keyof typeof TIER_ICONS];

            return (
              <StaggerItem key={tier.id}>
                <div
                  className={
                    tier.featured
                      ? 'relative flex h-full flex-col rounded-3xl bg-[rgb(var(--sage-ink))] p-8 text-white transition hover:-translate-y-[2px] hover:shadow-[0_14px_38px_rgba(62,82,64,0.35)]'
                      : 'flex h-full flex-col rounded-3xl border border-[rgb(var(--border))] bg-white p-8 transition hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)]'
                  }
                >
                  {tier.featured ? (
                    <span className="absolute right-6 top-6 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em]">
                      Most popular
                    </span>
                  ) : null}
                  <div
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${
                      tier.featured ? 'text-white/70' : 'text-[rgb(var(--muted))]'
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {tier.name}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-6xl tracking-tight">
                      {formatDeliveryPrice(tier.priceCents)}
                    </span>
                    <span
                      className={
                        tier.featured ? 'text-sm text-white/70' : 'text-sm text-[rgb(var(--muted))]'
                      }
                    >
                      flat
                    </span>
                  </div>
                  <p
                    className={`mt-4 text-sm leading-6 ${
                      tier.featured ? 'text-white/80' : 'text-[rgb(var(--muted))]'
                    }`}
                  >
                    {tier.summary}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGrid>

        <FadeIn>
          <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-6 text-[rgb(var(--muted))]">
            Flat rates cover the Salt Lake City area up to{' '}
            <span className="font-semibold text-[rgb(var(--fg))]">
              {DELIVERY_RADIUS.flatRateMiles} miles
            </span>
            . Beyond that we add{' '}
            <span className="font-semibold text-[rgb(var(--fg))]">
              {formatDeliveryPrice(DELIVERY_RADIUS.extraMileCents)} per extra mile
            </span>{' '}
            — {DELIVERY_RADIUS.extendedStates.join(', ')} are quoted the same way,
            based on distance.
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
                {DELIVERY_STATES.map((state) => (
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
                  <span className="font-semibold">
                    Sofa removal from{' '}
                    {formatDeliveryPrice(SOFA_REMOVAL.startingAtCents)}
                  </span>
                  <br />
                  <span className="text-[rgb(var(--muted))]">
                    We can haul away your old piece when the new one arrives. The
                    price depends on the item, so we quote it before booking —
                    just ask when we call.
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
              <span className="flex size-11 items-center justify-center rounded-full bg-[rgb(var(--sage-soft))] text-[rgb(var(--sage-ink))]">
                <CalendarDays aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold">Standard delivery</h3>
              <p className="mt-1.5 text-sm leading-6 text-[rgb(var(--muted))]">
                Included in every rate above. We run our delivery route{' '}
                <span className="font-semibold text-[rgb(var(--fg))]">
                  {DELIVERY_SCHEDULE.days.toLowerCase()} of {DELIVERY_SCHEDULE.window}
                </span>{' '}
                and confirm your window when we call.
              </p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="flex h-full flex-col rounded-3xl border border-[rgb(var(--border))] bg-white p-7 transition hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)]">
              <span className="flex size-11 items-center justify-center rounded-full bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]">
                <Zap aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold">
                Express delivery
                <span className="ml-2 rounded-full bg-[rgb(var(--accent))]/10 px-2.5 py-1 text-xs font-bold text-[rgb(var(--accent))]">
                  +{formatDeliveryPrice(EXPRESS_DELIVERY.surchargeCents)}
                </span>
              </h3>
              <p className="mt-1.5 text-sm leading-6 text-[rgb(var(--muted))]">
                In a hurry? Add express at checkout and we deliver within{' '}
                <span className="font-semibold text-[rgb(var(--fg))]">
                  {EXPRESS_DELIVERY.windowHours} hours
                </span>
                , on top of any delivery option.
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
