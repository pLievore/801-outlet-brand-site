'use client';

import { useState } from 'react';
import Link from 'next/link';
import { env } from '../../src/config/env';

export default function ContactForm() {
  const phoneHref = env.getPhoneHref();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio (aqui você integraria com um serviço de email ou API)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  const contactMethods = [
    {
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
      title: 'Call us',
      description: 'Speak directly with our team',
      action: 'Call now',
      href: phoneHref,
      value: '+1 385 201 6328',
    },
    {
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: 'Email us',
      description: 'Send us a message anytime',
      action: 'Mail to',
      href: 'mailto:info@801outlet.com',
      value: 'info@801outlet.com',
    },
    {
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'Business hours',
      description: 'Monday - Friday, 9 AM - 6 PM',
      action: null,
      href: null,
      value: 'Mountain Time',
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-5 pt-10 pb-14">
        <div>
          <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
            801 OUTLET • CONTACT
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Get in touch
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgb(var(--muted))]">
            Have questions about our products or delivery? Were here to help. Reach out through
            any of the methods below, and well get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {contactMethods.map((method, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[rgb(var(--border))] bg-white p-6 transition hover:-translate-y-[1px] hover:shadow-sm"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]">
                {method.icon}
              </div>
              <h3 className="text-sm font-semibold">{method.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-[rgb(var(--muted))]">
                {method.description}
              </p>
              <div className="mt-4">
                {method.href ? (
                  <a
                    href={method.href}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[rgb(var(--accent))] transition hover:opacity-80"
                  >
                    {method.action} →
                  </a>
                ) : (
                  <div className="text-xs font-medium text-[rgb(var(--fg))]">{method.value}</div>
                )}
              </div>
              {method.value && method.href && (
                <div className="mt-2 text-xs text-[rgb(var(--muted))]">{method.value}</div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form & Info Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
            <h2 className="text-lg font-semibold">Send us a message</h2>
            <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
              Fill out the form below and well get back to you within 24 hours.
            </p>

            {submitted ? (
              <div className="mt-6 rounded-2xl border border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent))]">
                    <svg
                      className="size-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Message sent!</div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      Well get back to you soon.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs font-semibold text-[rgb(var(--fg))]"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-3 text-sm transition focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20"
                    placeholder="Your name"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-xs font-semibold text-[rgb(var(--fg))]"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-3 text-sm transition focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-xs font-semibold text-[rgb(var(--fg))]"
                    >
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-3 text-sm transition focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20"
                      placeholder="+1 (385) 201-6328"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-xs font-semibold text-[rgb(var(--fg))]"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-3 text-sm transition focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20"
                  >
                    <option value="">Select a topic</option>
                    <option value="product">Product inquiry</option>
                    <option value="delivery">Delivery question</option>
                    <option value="order">Order status</option>
                    <option value="general">General question</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-xs font-semibold text-[rgb(var(--fg))]"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-3 text-sm transition focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]/20"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          {/* Additional Info */}
          <div className="space-y-6">
            {/* Quick Help */}
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-8 md:p-10">
              <h2 className="text-lg font-semibold">Frequently asked questions</h2>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                Quick answers to common questions.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  {
                    question: 'How quickly can I receive my order?',
                    answer:
                      'Fast delivery items are typically delivered within 3-5 business days. Standard delivery takes 7-14 business days. We ll contact you after purchase to schedule.',
                  },
                  {
                    question: 'Do you deliver outside Utah?',
                    answer:
                      'Currently, we only deliver within Utah. This allows us to provide the best service and pricing to our local customers.',
                  },
                  {
                    question: 'Can I visit a showroom?',
                    answer:
                      'We operate primarily online with scheduled deliveries. For specific product inquiries, please contact us and we can arrange a viewing if available.',
                  },
                ].map((faq, index) => (
                  <details
                    key={index}
                    className="group rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-4 transition hover:shadow-sm"
                  >
                    <summary className="cursor-pointer text-sm font-semibold text-[rgb(var(--fg))] transition hover:text-[rgb(var(--accent))]">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-xs leading-relaxed text-[rgb(var(--muted))]">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>

              <div className="mt-6">
                <Link
                  href="/delivery"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[rgb(var(--accent))] transition hover:opacity-80"
                >
                  Learn more about delivery →
                </Link>
              </div>
            </div>

            {/* Why Contact Us */}
            <div className="rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-8 md:p-10">
              <h2 className="text-lg font-semibold">Why reach out?</h2>
              <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
                Were here to help with anything you need:
              </p>

              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
                {[
                  'Product specifications and details',
                  'Delivery scheduling and questions',
                  'Order status updates',
                  'Special requests or custom options',
                  'General inquiries about our services',
                ].map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[rgb(var(--accent))]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 rounded-3xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-8 md:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Ready to browse our collection?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
              Explore our curated selection of premium furniture at outlet prices, delivered
              throughout Utah.
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
                Call us now
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
