import Link from 'next/link';

import { env } from '../../../src/config/env';
import { MODE_LABEL, SHOWROOM_HOURS } from '../../../src/lib/content/hours';
import { PICKUP_POLICY } from '../../../src/lib/content/policies';
import { STORE_ADDRESS, SUPPORT_EMAIL } from '../../../src/lib/content/store';
import {
  PolicyCallout,
  PolicyCard,
  PolicyHero,
  PolicySection,
  PolicySteps,
} from '../../components/policy';

export const metadata = {
  title: 'Pickup Policy — 801 Outlet',
  description:
    'Pick up your order for free at our South Salt Lake showroom. Hours, what to bring, vehicle requirements and how long we hold your item.',
};

const PICKUP_STEPS = [
  {
    title: 'Order and wait for the call',
    description:
      'Choose pickup at checkout. We contact you as soon as your piece is staged and ready to collect.',
  },
  {
    title: 'Come by the showroom',
    description:
      'Weekends are open for walk-ins; on weekdays let us know when you are coming so the piece is waiting for you.',
  },
  {
    title: 'Inspect and load',
    description:
      'Check the item over with our team, then we help you load it into your vehicle.',
  },
];

export default function PickupPage() {
  const phoneHref = env.getPhoneHref();

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-14">
        <PolicyHero
          eyebrow="801 OUTLET • PICKUP"
          title="Pickup policy"
          intro="Prefer to collect your furniture yourself? Pickup at our South Salt Lake showroom is free, and our team helps you load. Here is what to know before you drive over."
        />

        <PolicySection eyebrow="WHERE & WHEN" title="Collecting your order">
          <PolicyCard title="Our showroom">
            {STORE_ADDRESS.inline}. Pickup is free of charge — there is no
            handling fee for collecting an order in person.
          </PolicyCard>
          <PolicyCard title="Pickup hours">
            <ul className="space-y-1">
              {SHOWROOM_HOURS.map((entry) => (
                <li key={entry.days}>
                  <span className="font-semibold text-[rgb(var(--fg))]">
                    {entry.days}:
                  </span>{' '}
                  {entry.time} · {MODE_LABEL[entry.mode]}
                </li>
              ))}
            </ul>
          </PolicyCard>
          <PolicyCard title={`We hold your order for ${PICKUP_POLICY.holdDays} days`}>
            Space on our floor is limited, so we keep your piece reserved for{' '}
            {PICKUP_POLICY.holdDays} days after we tell you it is ready. Need
            longer? Just call — we can almost always work something out.
          </PolicyCard>
        </PolicySection>

        <PolicySection eyebrow="WHAT TO BRING" title="Before you drive over">
          <PolicyCard title="Order confirmation and photo ID">
            Bring your order confirmation and a photo ID. Sending someone else?
            Let us know their name in advance — we release orders only to the
            buyer or to someone the buyer authorised.
          </PolicyCard>
          <PolicyCard title="A vehicle that fits the piece">
            Every product page lists the dimensions. Measure your vehicle before
            you come: a sofa that does not fit means a second trip. When in
            doubt, call us and we will talk it through.
          </PolicyCard>
          <PolicyCard title="Straps and blankets">
            Our team helps you load, but we cannot secure the load for you.
            Please bring your own tie-down straps and moving blankets.
          </PolicyCard>
        </PolicySection>

        <PolicySection eyebrow="AT THE SHOWROOM" title="Inspection and responsibility">
          <PolicyCallout title="Check the piece before it leaves">
            Look your furniture over with our team before loading. Once it leaves
            the showroom, it is in your care — we cannot cover damage that
            happens in transit or during unloading at home. If you would rather
            we take that risk, choose{' '}
            <Link className="font-semibold underline underline-offset-4" href="/delivery">
              delivery
            </Link>{' '}
            instead and we will bring it in and set it up.
          </PolicyCallout>
          <PolicyCard title="All sales are final">
            Because we cannot accept returns or exchanges, inspecting the piece
            at the showroom is the moment that matters. Take your time — see our{' '}
            <Link className="font-semibold text-[rgb(var(--fg))] hover:underline" href="/returns">
              return policy
            </Link>{' '}
            for the full terms.
          </PolicyCard>
        </PolicySection>

        <PolicySection eyebrow="HOW IT WORKS" title="Three steps">
          <PolicySteps steps={PICKUP_STEPS} />
        </PolicySection>

        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Planning a pickup?</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            Call{' '}
            <a className="font-semibold text-[rgb(var(--fg))] hover:underline" href={phoneHref}>
              (801) 854-6060
            </a>{' '}
            or email{' '}
            <a
              className="font-semibold text-[rgb(var(--fg))] hover:underline"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>{' '}
            and we will have everything staged when you arrive. You can also{' '}
            <Link className="font-semibold text-[rgb(var(--fg))] hover:underline" href="/showroom">
              book a showroom visit
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
