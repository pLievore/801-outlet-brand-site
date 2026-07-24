import Link from 'next/link';
import {
  BadgeDollarSign,
  Gem,
  HeartHandshake,
  MapPin,
  Sparkles,
} from 'lucide-react';

import { env } from '../../../src/config/env';
import { FadeIn, FadeMount, StaggerGrid, StaggerItem } from '../../components/motion';
import { ButtonLink } from '../../components/ui/button';
import { Container } from '../../components/ui/container';

export const metadata = {
  title: 'About Us — 801 Outlet',
  description:
    'Learn about 801 Outlet — your trusted source for premium furniture at outlet prices in Utah.',
};

const VALUES = [
  {
    title: 'Quality',
    description:
      'Every piece we offer meets our standards for durability, comfort, and design. No compromises.',
    icon: Gem,
  },
  {
    title: 'Value',
    description:
      'Outlet pricing means premium furniture at a fraction of retail. Real savings, real quality.',
    icon: BadgeDollarSign,
  },
  {
    title: 'Service',
    description:
      "From browsing to delivery, we're here to help. Personal service, reliable delivery, ongoing support.",
    icon: HeartHandshake,
  },
];

const DIFFERENTIATORS = [
  {
    title: 'Utah-focused',
    description:
      'We specialize in serving Utah customers — faster delivery, local expertise, and service tailored to you.',
  },
  {
    title: 'Curated selection',
    description:
      'Every product is handpicked for quality and style. No overwhelming catalogs — just great pieces.',
  },
  {
    title: 'Direct savings',
    description:
      'Working directly with manufacturers and distributors, we cut out the middleman and pass savings to you.',
  },
  {
    title: 'Honest pricing',
    description:
      'What you see is what you get. No hidden fees, no surprises — clear pricing and transparent delivery terms.',
  },
];

const CATEGORIES = [
  { name: 'Sofas', desc: 'Modern comfort for your living space', href: '/products?q=Sofa' },
  { name: 'Sectionals', desc: 'Spacious seating for family time', href: '/products?q=Sectional' },
  { name: 'Recliners', desc: 'Relaxation at its finest', href: '/products?q=Recliner' },
  { name: 'Beds', desc: 'Restful nights start here', href: '/products?q=Bed' },
];

export default function AboutPage() {
  const phoneHref = env.getPhoneHref();

  return (
    <main>
      {/* Hero */}
      <section className="border-b border-[rgb(var(--border))] bg-[rgb(var(--accent-soft))]/60">
        <Container size="narrow" className="py-16 text-center md:py-24">
          <FadeMount delay={0.05}>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--accent))]">
              <MapPin aria-hidden="true" className="size-4" />
              South Salt Lake, Utah
            </span>
          </FadeMount>
          <FadeMount delay={0.12}>
            <h1 className="font-display mt-6 text-5xl leading-none tracking-tight md:text-7xl">
              Premium comfort.
              <br />
              <span className="italic text-[rgb(var(--accent))]">Outlet prices.</span>
            </h1>
          </FadeMount>
          <FadeMount delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[rgb(var(--muted))] md:text-lg">
              We&apos;re Utah&apos;s destination for premium furniture deals —
              curated sofas, sectionals, recliners and beds, all at outlet
              prices, delivered to your home.
            </p>
          </FadeMount>
        </Container>
      </section>

      {/* Mission */}
      <FadeIn>
        <Container size="narrow" className="pt-14 text-center md:pt-20">
          <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            OUR MISSION
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight md:text-5xl">
            Everyone deserves premium furniture —{' '}
            <span className="italic text-[rgb(var(--sage-ink))]">
              without the premium price tag.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[rgb(var(--muted))]">
            We source high-quality pieces directly and pass the savings on to
            you. Clean design, modern aesthetics, and reliable quality — that&apos;s
            the 801 Outlet promise.
          </p>
        </Container>
      </FadeIn>

      {/* Values */}
      <Container className="py-14 md:py-20">
        <StaggerGrid className="grid gap-4 md:grid-cols-3">
          {VALUES.map((value) => (
            <StaggerItem key={value.title}>
              <div className="flex h-full flex-col rounded-3xl border border-[rgb(var(--border))] bg-white p-7 transition hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)]">
                <span className="flex size-11 items-center justify-center rounded-full bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))]">
                  <value.icon aria-hidden="true" className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[rgb(var(--muted))]">
                  {value.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* Differentiators */}
        <FadeIn>
          <div className="mt-14 text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              WHY CHOOSE US
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
              What makes us <span className="italic">different</span>
            </h2>
          </div>
        </FadeIn>

        <StaggerGrid className="mt-10 grid gap-4 sm:grid-cols-2">
          {DIFFERENTIATORS.map((item, index) => (
            <StaggerItem key={item.title}>
              <div className="flex h-full gap-5 rounded-3xl border border-[rgb(var(--border))] bg-white p-7 transition hover:-translate-y-[2px] hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)]">
                <span className="font-display text-3xl italic text-[rgb(var(--accent))]">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-[rgb(var(--muted))]">
                    {item.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* What we offer */}
        <FadeIn>
          <div className="mt-14 text-center">
            <p className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
              WHAT WE OFFER
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight md:text-4xl">
              The essentials of <span className="italic">comfortable living</span>
            </h2>
          </div>
        </FadeIn>

        <StaggerGrid className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <StaggerItem key={category.name}>
              <Link
                href={category.href}
                className="group flex h-full flex-col rounded-3xl border border-[rgb(var(--border))] bg-white p-6 transition hover:-translate-y-[2px] hover:border-[rgb(var(--accent))]/50 hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)]"
              >
                <Sparkles
                  aria-hidden="true"
                  className="size-5 text-[rgb(var(--accent))]"
                />
                <span className="mt-5 text-base font-semibold tracking-tight">
                  {category.name}
                </span>
                <span className="mt-1 text-xs text-[rgb(var(--muted))]">
                  {category.desc}
                </span>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[rgb(var(--accent))] transition group-hover:translate-x-0.5">
                  Browse →
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </Container>

      {/* CTA */}
      <FadeIn>
        <section className="border-t border-[rgb(var(--border))] bg-[rgb(var(--sage-soft))]">
          <Container size="narrow" className="py-16 text-center md:py-20">
            <h2 className="font-display text-4xl leading-tight tracking-tight text-[rgb(var(--sage-ink))] md:text-5xl">
              Ready to transform <span className="italic">your space</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[rgb(var(--sage-ink))]">
              Browse our curated collection of premium furniture at outlet
              prices — fast delivery throughout Utah.
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
              Have questions?{' '}
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
