'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '../../../src/lib/supabase/browser';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/account';

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseBrowser();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) { setError(err.message); return; }
        router.push(next);
        router.refresh();
      } else if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (err) { setError(err.message); return; }
        setMessage('Check your email to confirm your account, then sign in.');
        setMode('login');
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/account/reset-password`,
        });
        if (err) { setError(err.message); return; }
        setMessage('Password reset link sent. Check your email.');
      }
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-[rgb(var(--border))] bg-white px-4 py-3 text-sm ' +
    'placeholder:text-[rgb(var(--muted))] focus:border-[rgb(var(--accent))] focus:outline-none ' +
    'focus:ring-1 focus:ring-[rgb(var(--accent))]';
  const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]';

  const titles = { login: 'Sign in', signup: 'Create account', reset: 'Reset password' };

  return (
    <main className="mx-auto max-w-sm px-5 py-20">
      <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        801 OUTLET • ACCOUNT
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">{titles[mode]}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        {mode === 'signup' && (
          <div>
            <label htmlFor="fullName" className={labelCls}>Full name</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              required
              className={inputCls}
              placeholder="Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className={labelCls}>Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className={inputCls}
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {mode !== 'reset' && (
          <div>
            <label htmlFor="password" className={labelCls}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              className={inputCls}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[rgb(var(--fg))] py-3 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm disabled:opacity-50 disabled:translate-y-0"
        >
          {loading ? 'Please wait…' : titles[mode]}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-[rgb(var(--muted))]">
        {mode === 'login' && (
          <>
            <p>
              No account?{' '}
              <button onClick={() => { setMode('signup'); setError(null); setMessage(null); }} className="font-semibold text-[rgb(var(--fg))] hover:underline">
                Create one
              </button>
            </p>
            <p>
              <button onClick={() => { setMode('reset'); setError(null); setMessage(null); }} className="hover:underline">
                Forgot password?
              </button>
            </p>
          </>
        )}
        {(mode === 'signup' || mode === 'reset') && (
          <p>
            <button onClick={() => { setMode('login'); setError(null); setMessage(null); }} className="font-semibold text-[rgb(var(--fg))] hover:underline">
              Back to sign in
            </button>
          </p>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-[rgb(var(--muted))]">
        By signing in you agree to our{' '}
        <Link href="/terms" className="hover:underline">Terms</Link> and{' '}
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>.
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-5 py-20"><div className="h-64 animate-pulse rounded-2xl bg-neutral-100" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
