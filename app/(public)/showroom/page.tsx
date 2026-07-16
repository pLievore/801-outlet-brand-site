import type { Metadata } from 'next';
import { CalendarDays, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';

import { ButtonLink } from '../../components/ui/button';
import { Container } from '../../components/ui/container';

export const metadata: Metadata = {
  title: 'Showroom | 801 Outlet',
  description:
    'Visit the 801 Outlet showroom in South Salt Lake by appointment.',
};

export default function ShowroomPage() {
  return (
    <main>
      <section className="border-b border-[rgb(var(--border))] bg-[rgb(var(--sage-soft))] py-16 md:py-24">
        <Container size="narrow" className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--sage-ink))]">
            <CalendarDays aria-hidden="true" className="size-4" />
            By appointment only
          </span>
          <h1 className="font-display mt-6 text-5xl leading-none tracking-tight md:text-7xl">
            See it. Feel it.
            <br />
            <span className="italic text-[rgb(var(--sage-ink))]">Make it yours.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[rgb(var(--muted))] md:text-lg">
            Schedule a personal showroom visit to explore available pieces and get
            help finding the right fit for your home.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="sms:+18018546060?&body=Hi%20801%20Outlet%2C%20I%27d%20like%20to%20schedule%20a%20showroom%20appointment."
              variant="sage"
              size="lg"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              Text (801) 854-6060
            </ButtonLink>
            <ButtonLink href="tel:+18018546060" variant="secondary" size="lg">
              <Phone aria-hidden="true" className="size-4" />
              Call (801) 854-6060
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-[rgb(var(--muted))]">
            Appointments are confirmed by text message or phone call. Prefer
            WhatsApp? We&apos;re on it too:{' '}
            <a
              className="font-semibold text-[rgb(var(--sage-ink))] hover:underline"
              href="https://wa.me/18018546060?text=Hi%20801%20Outlet%2C%20I%27d%20like%20to%20schedule%20a%20showroom%20appointment."
              target="_blank"
              rel="noreferrer"
            >
              (801) 854-6060
            </a>
            .
          </p>
        </Container>
      </section>

      <Container size="narrow" className="py-14 md:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-7">
            <Clock aria-hidden="true" className="size-6 text-[rgb(var(--sage-ink))]" />
            <h2 className="mt-5 text-lg font-bold">Hours</h2>
            <dl className="mt-3 space-y-2 text-sm leading-6 text-[rgb(var(--muted))]">
              <div className="flex justify-between gap-4">
                <dt>Mon – Fri</dt>
                <dd className="text-right font-semibold text-[rgb(var(--fg))]">
                  10 AM – 8 PM
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Saturday</dt>
                <dd className="text-right font-semibold text-[rgb(var(--fg))]">
                  10 AM – 8 PM
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Sunday</dt>
                <dd className="text-right font-semibold text-[rgb(var(--fg))]">
                  12 PM – 6 PM
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-5 text-[rgb(var(--muted))]">
              Mon – Sat by appointment · Sunday open for walk-ins
            </p>
          </div>

          <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-7">
            <MapPin aria-hidden="true" className="size-6 text-[rgb(var(--accent))]" />
            <h2 className="mt-5 text-lg font-bold">South Salt Lake showroom</h2>
            <p className="mt-3 text-sm leading-6 text-[rgb(var(--muted))]">
              2251 South 400 East
              <br />
              South Salt Lake, UT 84115
            </p>
            <a
              className="mt-5 inline-flex text-sm font-bold text-[rgb(var(--accent))] hover:underline"
              href="https://www.google.com/maps/search/?api=1&query=2251+South+400+East+South+Salt+Lake+UT+84115"
              target="_blank"
              rel="noreferrer"
            >
              Get directions
            </a>
          </div>

          <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-7">
            <CalendarDays aria-hidden="true" className="size-6 text-[rgb(var(--sage-ink))]" />
            <h2 className="mt-5 text-lg font-bold">Plan your visit</h2>
            <p className="mt-3 text-sm leading-6 text-[rgb(var(--muted))]">
              Appointments help us confirm availability and give you dedicated
              assistance. Text or call us before visiting — we confirm every
              appointment by message or phone.
            </p>
            <a
              className="mt-5 inline-flex text-sm font-bold text-[rgb(var(--sage-ink))] hover:underline"
              href="mailto:support@801outlet.com?subject=Showroom%20appointment"
            >
              support@801outlet.com
            </a>
          </div>
        </div>
      </Container>
    </main>
  );
}
