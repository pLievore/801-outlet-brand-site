import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { UserRound } from 'lucide-react';

import { isCustomerSignedIn } from '../../../src/lib/shopify/customer/session';
import { isCustomerAccountConfigured } from '../../../src/lib/shopify/customer/config';
import { buttonStyles } from '../../components/ui/button';
import { Container } from '../../components/ui/container';

export const metadata: Metadata = {
  title: 'Sign in — 801 Outlet',
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
            Your <span className="italic">account</span>
          </h1>
          <p className="mt-3 text-sm leading-6 text-[rgb(var(--muted))]">
            Sign in with a one-time code sent to your email. No password needed
            — your account is protected by Shopify.
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
              Continue to sign in
            </a>
          ) : (
            <p className="mt-6 text-sm text-[rgb(var(--muted))]">
              Sign-in is temporarily unavailable. Please try again later.
            </p>
          )}
        </div>
      </Container>
    </main>
  );
}
