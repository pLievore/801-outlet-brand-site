import Link from 'next/link';
import { env } from '../../../src/config/env';

export const metadata = {
  title: 'Terms of Service — 801 Outlet',
  description:
    'Terms of service for 801 Outlet. Read the terms governing the use of our website and services.',
};

export default function TermsPage() {
  const phoneHref = env.getPhoneHref();

  return (
    <main>
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-14">
        <div>
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            801 OUTLET • TERMS
          </div>
          <h1 className="mt-3 font-display text-4xl font-medium tracking-tight md:text-6xl">
            Terms of service
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))]">
            These terms govern your use of the 801 Outlet website and services. By accessing the
            site, you agree to be bound by these terms.
          </p>
          <div className="mt-4 text-xs text-[rgb(var(--muted))]">
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Acceptance */}
        <div className="mt-10 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Acceptance of terms</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            By using this website, you confirm that you accept these terms of service and agree to
            comply with them. If you do not agree, you must not use our site or services.
          </p>
        </div>

        {/* Use of Site */}
        <div className="mt-8">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            USE OF THE SITE
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            How you may use our site
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                title: 'Permitted use',
                description:
                  'You may browse our catalog, place orders through this site, and contact us for information. Use must be lawful and personal.',
              },
              {
                title: 'Prohibited conduct',
                description:
                  'You may not misuse the site, attempt to gain unauthorized access, copy our content for commercial purposes, or interfere with site operation.',
              },
              {
                title: 'Account responsibility',
                description:
                  'If you contact us with personal details, you are responsible for the accuracy of the information provided and any communications you initiate.',
              },
              {
                title: 'Age requirement',
                description:
                  'You must be at least 18 years old, or the age of majority in your jurisdiction, to make a purchase or enter into a contract with us.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:-translate-y-[1px] hover:shadow-sm"
              >
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Orders & Payments */}
        <div className="mt-12">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            ORDERS & PAYMENTS
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Orders, pricing, and payment
          </h2>

          <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
            <ul className="space-y-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>
                  Payments are processed by Square, our payment provider. By placing an order you
                  also accept Square's terms and privacy policy.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>
                  Prices, availability, and promotional offers shown on the site may change without
                  notice. The price applied is the one displayed at checkout.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>
                  We reserve the right to refuse or cancel any order at our discretion, including
                  in cases of pricing errors or suspected fraud.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>
                  Product images are illustrative; minor variations in color, texture, or finish
                  may occur.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Delivery */}
        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Delivery</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            Delivery is available within Utah only. After purchase, we'll contact you to confirm
            address details and schedule a delivery window. Estimated timelines are approximate and
            not guaranteed.{' '}
            <Link
              href="/delivery"
              className="font-semibold text-[rgb(var(--accent))] hover:opacity-80"
            >
              See full delivery details
            </Link>
            .
          </p>
        </div>

        {/* Intellectual Property */}
        <div className="mt-8 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Intellectual property</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            The 801 Outlet name, logo, design, and content on this site are owned by 801 Outlet or
            its licensors and protected by intellectual property laws. You may not reproduce,
            distribute, or use them for commercial purposes without written permission.
          </p>
        </div>

        {/* Disclaimers */}
        <div className="mt-8 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Disclaimers</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            The site and its content are provided on an "as is" and "as available" basis without
            warranties of any kind, whether express or implied. We do not warrant that the site
            will be uninterrupted, error-free, or free of harmful components.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div className="mt-8 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Limitation of liability</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            To the fullest extent permitted by law, 801 Outlet shall not be liable for any
            indirect, incidental, consequential, or punitive damages arising from your use of the
            site or services. Our total liability for any claim is limited to the amount you paid
            for the relevant product, if any.
          </p>
        </div>

        {/* Third-Party Links */}
        <div className="mt-8 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Third-party links</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            Our site uses third-party services such as Square (payments) and may link to other
            external sites. We are not responsible for the content, terms, or practices of those
            services. Your interactions with them are governed by their own terms.
          </p>
        </div>

        {/* Changes */}
        <div className="mt-8 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Changes to these terms</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            We may update these terms from time to time. Updates take effect when posted on this
            page along with a revised "Last updated" date. Continued use of the site after changes
            constitutes acceptance of the new terms.
          </p>
        </div>

        {/* Governing Law */}
        <div className="mt-8 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Governing law</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            These terms are governed by the laws of the State of Utah, USA, without regard to its
            conflict of law principles. Any disputes will be resolved in the courts located in
            Utah.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-8 md:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Questions about these terms?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
              If you have any questions about these terms of service, please get in touch.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={phoneHref}
                className="inline-flex items-center justify-center rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0"
              >
                Call us
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-[rgb(var(--border))] bg-white px-6 py-3 text-sm font-semibold text-[rgb(var(--fg))] transition hover:-translate-y-[1px] hover:bg-neutral-50 hover:shadow-sm active:translate-y-0"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
