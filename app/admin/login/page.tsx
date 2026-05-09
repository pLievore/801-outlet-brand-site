'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '../../../src/lib/supabase/browser';

function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/admin';
  const error = params.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(
    error === 'unauthorized' ? 'Your account does not have admin access.' : null
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const supabase = getSupabaseBrowser();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setErr(signInError.message);
      setLoading(false);
      return;
    }

    // Hard navigate so middleware re-runs and reads the new auth cookie
    window.location.href = next;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold text-white">801 Outlet</div>
          <div className="mt-1 text-sm text-neutral-400">Admin panel</div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur"
        >
          <h1 className="text-base font-semibold text-white">Sign in</h1>

          {err ? (
            <div className="mt-4 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-400">
              {err}
            </div>
          ) : null}

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-400" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-xs font-medium text-neutral-400"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
