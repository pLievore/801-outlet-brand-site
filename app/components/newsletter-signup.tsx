'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done'>('idle');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (state !== 'idle' || !email.trim()) return;
    setState('submitting');
    // Placeholder: hook up to Resend / Mailchimp / etc. later.
    window.setTimeout(() => {
      setState('done');
      setEmail('');
    }, 600);
  };

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(var(--muted))]">
        Stay close
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
        Quiet emails. New arrivals, occasional sales, never spam.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-5 flex max-w-md flex-col gap-2 sm:flex-row"
        noValidate
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={state !== 'idle'}
          className="flex-1 rounded-full border border-[rgb(var(--border))] bg-white px-5 py-3 text-sm transition placeholder:text-[rgb(var(--muted))] focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
        />
        <motion.button
          type="submit"
          disabled={state !== 'idle'}
          whileTap={{ scale: 0.97 }}
          className="rounded-full bg-[rgb(var(--fg))] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[rgb(var(--fg))]/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state === 'submitting' ? 'Subscribing…' : 'Subscribe'}
        </motion.button>
      </form>

      <AnimatePresence>
        {state === 'done' && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 text-xs font-medium text-[rgb(var(--accent))]"
            role="status"
          >
            ✓ You&apos;re on the list. Talk soon.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
