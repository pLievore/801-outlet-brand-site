import type { Metadata } from 'next';
import { CalendarDays, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';

import { ButtonLink } from '../../components/ui/button';
import { Container } from '../../components/ui/container';
import { MODE_LABEL, SHOWROOM_HOURS } from '../../../src/lib/content/hours';
import { getBookingDays } from '../../../src/lib/content/booking';
import { AppointmentForm } from './appointment-form';
import { ShowroomVideo } from './showroom-video';

export const metadata: Metadata = {
  title: 'Showroom | 801 Outlet',
  description:
    'Visit the 801 Outlet showroom in South Salt Lake — book a weekday appointment online, or walk in on weekends.',
};

// Slots depend on the current time in store timezone; refresh every 15 min.
export const revalidate = 900;

export default function ShowroomPage() {
  const bookingDays = getBookingDays();
  return (
    <main>
      <section className="border-b border-[rgb(var(--border))] bg-[rgb(var(--sage-soft))] py-16 md:py-24">
        <Container size="narrow" className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--sage-ink))]">
            <CalendarDays aria-hidden="true" className="size-4" />
            Weekdays by appointment · weekends walk-in
          </span>
          <h1 className="font-display mt-6 text-5xl leading-none tracking-tight md:text-7xl">
            See it. Feel it.
            <br />
            <span className="italic text-[rgb(var(--sage-ink))]">Make it yours.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[rgb(var(--muted))] md:text-lg">
            Book a personal visit on weekdays, or just stop by on Saturday and
            Sunday — no appointment needed.
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
            Weekday appointments are confirmed by text message or phone call.
            Prefer WhatsApp? We&apos;re on it too:{' '}
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

      <Container size="narrow" className="pt-14 md:pt-20">
        <div className="text-center">
          <h2 className="font-display text-3xl tracking-tight md:text-4xl">
            Take a look <span className="italic">inside</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[rgb(var(--muted))]">
            A quick tour of what you&apos;ll find at our South Salt Lake
            showroom.
          </p>
        </div>
        <div className="mt-7">
          <ShowroomVideo />
        </div>
      </Container>

      <Container size="narrow" className="py-14 md:py-20">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-7">
            <Clock aria-hidden="true" className="size-6 text-[rgb(var(--sage-ink))]" />
            <h2 className="mt-5 text-lg font-bold">Hours</h2>
            <dl className="mt-4 space-y-3">
              {SHOWROOM_HOURS.map((entry) => (
                <div key={entry.days} className="flex flex-col gap-0.5">
                  <dt className="text-sm font-semibold">{entry.days}</dt>
                  <dd className="text-sm text-[rgb(var(--muted))]">
                    {entry.time} ·{' '}
                    <span
                      className={
                        entry.mode === 'walk-in'
                          ? 'font-semibold text-[rgb(var(--sage-ink))]'
                          : undefined
                      }
                    >
                      {MODE_LABEL[entry.mode].toLowerCase()}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <a
              className="mt-5 inline-flex text-sm font-bold text-[rgb(var(--sage-ink))] hover:underline"
              href="mailto:support@801outlet.com?subject=Showroom%20appointment"
            >
              support@801outlet.com
            </a>
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
        </div>

        <div id="plan-your-visit" className="mt-14 scroll-mt-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--sage-soft))] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--sage-ink))]">
            <CalendarDays aria-hidden="true" className="size-4" />
            Plan your visit
          </span>
          <h2 className="mt-4 font-display text-3xl tracking-tight">
            Book a weekday <span className="italic">appointment</span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[rgb(var(--muted))]">
            Pick a date and time and we&apos;ll confirm it by text message or
            phone call. Saturday and Sunday don&apos;t need an appointment —
            just walk in.
          </p>
          <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-white p-6 md:p-8">
            <AppointmentForm days={bookingDays} />
          </div>
        </div>
      </Container>
    </main>
  );
}
