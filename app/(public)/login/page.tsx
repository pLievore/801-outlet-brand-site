import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Check, UserRound } from 'lucide-react';

import { isCustomerSignedIn } from '../../../src/lib/shopify/customer/session';
import { isCustomerAccountConfigured } from '../../../src/lib/shopify/customer/config';
import { buttonStyles } from '../../components/ui/button';
import { Container } from '../../components/ui/container';

export const metadata: Metadata = {
  title: 'Sign in or create an account — 801 Outlet',
  description: 'Access your 801 Outlet account, profile and order history.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isCustomerSignedIn()) redirect('/account');

  const { error } = await searchParams;
  const configured = isCustomerAccountConfigured();

  return (
    <main>
      <Container size="narrow" className="py-16 md:py-24">
        <div className="mx-auto max-w-md rounded-3xl border border-[rgb(var(--border))] bg-white p-8 text-center md:p-10">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-[rgb(var(--sage-soft))] text-[rgb(var(--sage-ink))]">
            <UserRound aria-hidden="true" className="size-6" />
          </span>
          <h1 className="mt-5 font-display text-3xl tracking-tight md:text-4xl">
            Sign in or <span className="italic">create an account</span>
          </h1>
          {/* The page used to be headed "Your account" and talk only about
              signing in, which reads as a door for people who already have a
              key. There is no separate sign-up: entering an email for the
              first time is what creates the account, and saying so is the
              whole difference between a new customer starting and leaving. */}
          <p className="mt-3 text-sm leading-6 text-[rgb(var(--muted))]">
            New here? There is nothing to fill in. Enter your email, we send a
            six-digit code, and your account is created the first time you use
            it — no password to choose or remember.
          </p>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent-soft))] px-4 py-3 text-sm"
            >
              We could not sign you in. Please try again.
            </p>
          ) : null}

          {configured ? (
            <a
              href="/api/auth/login"
              className={buttonStyles({
                variant: 'primary',
                size: 'lg',
                className: 'mt-6 w-full',
              })}
            >
              Continue with email
            </a>
          ) : (
            <p className="mt-6 text-sm text-[rgb(var(--muted))]">
              Sign-in is temporarily unavailable. Please try again later.
            </p>
          )}

          {configured ? (
            <ul className="mt-7 space-y-2.5 border-t border-[rgb(var(--border))] pt-6 text-left text-sm text-[rgb(var(--muted))]">
              <li className="flex gap-2.5">
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[rgb(var(--sage-ink))]"
                />
                Follow your orders and delivery from anywhere.
              </li>
              <li className="flex gap-2.5">
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[rgb(var(--sage-ink))]"
                />
                Check out faster — your details come back next time.
              </li>
              <li className="flex gap-2.5">
                <Check
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[rgb(var(--sage-ink))]"
                />
                Your account lives with Shopify, alongside the checkout.
              </li>
            </ul>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
