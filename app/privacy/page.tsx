import Link from 'next/link';
import { env } from '../../src/config/env';

export const metadata = {
  title: 'Privacy Policy — 801 Outlet',
  description:
    'Privacy policy for 801 Outlet. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  const phoneHref = env.getPhoneHref();

  return (
    <main>
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-14">
        <div>
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            801 OUTLET • PRIVACY
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Privacy policy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))]">
            Your privacy is important to us. This policy explains how we collect, use, and protect
            your personal information when you visit our website and use our services.
          </p>
          <div className="mt-4 text-xs text-[rgb(var(--muted))]">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Information We Collect */}
        <div className="mt-10">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            INFORMATION COLLECTION
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Information we collect
          </h2>

          <div className="mt-6 space-y-6">
            {[
              {
                title: 'Information you provide',
                description:
                  'When you contact us, place an order, or interact with our services, we may collect your name, email address, phone number, delivery address, and payment information.',
              },
              {
                title: 'Automatically collected information',
                description:
                  'When you visit our website, we automatically collect certain information such as your IP address, browser type, device information, pages visited, and the time and date of your visit.',
              },
              {
                title: 'Cookies and tracking',
                description:
                  'We use cookies and similar technologies to improve your experience, analyze site usage, and provide personalized content. You can control cookies through your browser settings.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:shadow-sm"
              >
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[rgb(var(--muted))]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How We Use Information */}
        <div className="mt-12">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            INFORMATION USE
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            How we use your information
          </h2>

          <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
            <p className="mb-4 text-sm leading-relaxed text-[rgb(var(--muted))]">
              We use the information we collect to:
            </p>
            <ul className="space-y-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>Process and fulfill your orders and deliver products</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>Communicate with you about your orders and our services</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>Provide customer support and respond to inquiries</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>Improve our website, products, and services</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>Send marketing communications (with your consent)</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>Comply with legal obligations and protect our rights</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Information Sharing */}
        <div className="mt-12">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            INFORMATION SHARING
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            How we share your information
          </h2>

          <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
            <p className="mb-4 text-sm leading-relaxed text-[rgb(var(--muted))]">
              We do not sell your personal information. We may share your information only in the
              following circumstances:
            </p>
            <ul className="space-y-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>
                  <strong className="font-semibold text-[rgb(var(--fg))]">Service providers:</strong>{' '}
                  With trusted third-party service providers who help us operate our business, such as
                  payment processors, shipping companies, and analytics providers.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>
                  <strong className="font-semibold text-[rgb(var(--fg))]">Legal requirements:</strong>{' '}
                  When required by law or to protect our rights, property, or safety, or that of others.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                <span>
                  <strong className="font-semibold text-[rgb(var(--fg))]">Business transfers:</strong>{' '}
                  In connection with any merger, sale of assets, or acquisition of our business.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Data Security */}
        <div className="mt-12">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            DATA SECURITY
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            How we protect your information
          </h2>

          <div className="mt-6 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm leading-relaxed text-[rgb(var(--muted))]">
                  We implement appropriate technical and organizational measures to protect your
                  personal information against unauthorized access, alteration, disclosure, or
                  destruction. However, no method of transmission over the internet or electronic
                  storage is 100% secure. While we strive to use commercially acceptable means to
                  protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Rights */}
        <div className="mt-12">
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            YOUR RIGHTS
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Your privacy rights
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                title: 'Access',
                description: 'Request access to your personal information we hold.',
              },
              {
                title: 'Correction',
                description: 'Request correction of inaccurate or incomplete information.',
              },
              {
                title: 'Deletion',
                description: 'Request deletion of your personal information, subject to legal requirements.',
              },
              {
                title: 'Opt-out',
                description: 'Opt out of marketing communications at any time.',
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

          <div className="mt-6 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6">
            <p className="text-sm leading-relaxed text-[rgb(var(--muted))]">
              To exercise any of these rights, please{' '}
              <a
                href={phoneHref}
                className="font-semibold text-[rgb(var(--accent))] hover:opacity-80"
              >
                contact us
              </a>
              {' '}or{' '}
              <Link
                href="/contact"
                className="font-semibold text-[rgb(var(--accent))] hover:opacity-80"
              >
                send us a message
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Third-Party Links */}
        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Third-party links</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            Our website may contain links to third-party websites, including our Shopify store. We
            are not responsible for the privacy practices or content of these external sites. We
            encourage you to review the privacy policies of any third-party sites you visit.
          </p>
        </div>

        {/* Changes to Policy */}
        <div className="mt-8 rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
          <h2 className="text-lg font-semibold">Changes to this policy</h2>
          <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
            We may update this privacy policy from time to time. We will notify you of any changes
            by posting the new policy on this page and updating the "Last updated" date. We
            encourage you to review this policy periodically.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-8 md:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Questions about privacy?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
              If you have any questions or concerns about this privacy policy or our data practices,
              please don't hesitate to get in touch.
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
