import Link from 'next/link';

import { env } from '../../../src/config/env';
import { SUPPORT_EMAIL } from '../../../src/lib/content/store';
import {
  PolicyCallout,
  PolicyCard,
  PolicyHero,
  PolicySection,
  PolicySteps,
} from '../../components/policy';

export const metadata = {
  title: 'Return Policy — 801 Outlet',
  description:
    'All sales at 801 Outlet are final. Here is how we help you choose with confidence before you buy — dimensions, showroom visits, photos on request and inspection at delivery.',
};

const BEFORE_YOU_BUY = [
  {
    title: 'Measure your space',
    description:
      'Check your doorways, stairwells and the wall the piece is going against. Dimensions are on the product page, and we will confirm them for you if you ask.',
  },
  {
    title: 'See it in person',
    description:
      'Our showroom is open for walk-ins on weekends and by appointment on weekdays. Nothing beats sitting on it first.',
  },
  {
    title: 'Ask us anything',
    description:
      'Call or text for extra photos, video, fabric details or anything the listing does not answer. We would rather talk it through than have you guess.',
  },
];

export default function ReturnsPage() {
  const phoneHref = env.getPhoneHref();
  const smsHref = env.getSmsHref();

  return (
    <main>
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-14">
        <PolicyHero
          eyebrow="801 OUTLET • RETURNS"
          title="All sales are final"
          intro="Outlet pricing works because every piece is sold once, at the lowest price we can offer. That means we do not accept returns or exchanges — so we put real effort into making sure you know exactly what you are buying first."
        />

        <PolicySection eyebrow="THE POLICY" title="What final sale means">
          <PolicyCallout title="No returns, exchanges or refunds">
            Once a purchase is complete, it cannot be returned, exchanged or
            refunded. This applies to every item we sell, whether it is
            delivered or picked up at the showroom. Please read this policy in
            full before you order — if anything is unclear, ask us first.
          </PolicyCallout>
          <PolicyCard title="Why we work this way">
            We are an outlet. Our prices come from buying overstock and
            closeouts and moving them quickly, which only works if a piece sells
            once. Rather than build the cost of returns into every price tag, we
            keep prices low and invest in helping you choose correctly.
          </PolicyCard>
          <PolicyCard title="Manufacturer warranties">
            Some pieces carry a warranty from the manufacturer. Where one
            exists, it is provided by the maker and handled directly with them —
            ask us and we will point you to the paperwork for your item.
          </PolicyCard>
        </PolicySection>

        <PolicySection eyebrow="BEFORE YOU BUY" title="Choose with confidence">
          <PolicySteps steps={BEFORE_YOU_BUY} />
        </PolicySection>

        <PolicySection eyebrow="AT HANDOVER" title="Inspect before you accept">
          <PolicyCard title="On delivery">
            Look the piece over while our team is still with you. Raise anything
            you see on the spot — that is the moment when we can still act,
            before the crew leaves.
          </PolicyCard>
          <PolicyCard title="At pickup">
            Inspect your furniture at the showroom before loading it. Once it
            leaves with you, it is in your care, including anything that happens
            in transit. Full details are in our{' '}
            <Link className="font-semibold text-[rgb(var(--fg))] hover:underline" href="/pickup">
              pickup policy
            </Link>
            .
          </PolicyCard>
          <PolicyCard title="Items sold as-is">
            Clearance and floor models are sold as-is. Their condition is
            described and discounted up front, and we will always walk you
            through any wear before you buy.
          </PolicyCard>
        </PolicySection>

        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Not sure yet? Ask before you buy.</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            Questions are free and we are happy to answer them. Call{' '}
            <a className="font-semibold text-[rgb(var(--fg))] hover:underline" href={phoneHref}>
              (801) 854-6060
            </a>
            ,{' '}
            <a className="font-semibold text-[rgb(var(--fg))] hover:underline" href={smsHref}>
              send us a text
            </a>
            , email{' '}
            <a
              className="font-semibold text-[rgb(var(--fg))] hover:underline"
              href={`mailto:${SUPPORT_EMAIL}`}
            >
              {SUPPORT_EMAIL}
            </a>{' '}
            or{' '}
            <Link className="font-semibold text-[rgb(var(--fg))] hover:underline" href="/showroom">
              book a showroom visit
            </Link>{' '}
            and see it in person.
          </p>
        </div>
      </section>
    </main>
  );
}
