'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '../../../../src/lib/supabase/browser';

export default function AccountProfilePage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const supabase = getSupabaseBrowser();

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      setPasswordMsg(error.message);
    } else {
      setPasswordMsg('Password updated successfully.');
      setNewPassword('');
    }
  }

  const inputCls =
    'w-full rounded-xl border border-[rgb(var(--border))] bg-white px-4 py-3 text-sm ' +
    'placeholder:text-[rgb(var(--muted))] focus:border-[rgb(var(--accent))] focus:outline-none ' +
    'focus:ring-1 focus:ring-[rgb(var(--accent))]';
  const labelCls = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]';

  return (
    <main className="mx-auto max-w-xl px-5 py-14">
      <div className="text-xs font-semibold tracking-[0.22em] text-[rgb(var(--muted))]">
        801 OUTLET • MY ACCOUNT
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">Profile</h1>
      <div className="mt-2 text-sm text-[rgb(var(--muted))]">
        <Link href="/account" className="hover:underline">← Account</Link>
      </div>

      {/* Change password */}
      <section className="mt-8 rounded-2xl border border-[rgb(var(--border))] bg-white p-6">
        <h2 className="mb-4 text-base font-semibold">Change password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
          <div>
            <label htmlFor="newPassword" className={labelCls}>New password</label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={inputCls}
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          {passwordMsg && (
            <p
              role={passwordMsg.includes('successfully') ? 'status' : 'alert'}
              className={`rounded-xl px-4 py-3 text-sm ${
                passwordMsg.includes('successfully')
                  ? 'border border-green-200 bg-green-50 text-green-700'
                  : 'border border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {passwordMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={passwordLoading}
            className="rounded-full bg-[rgb(var(--fg))] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-sm disabled:opacity-50 disabled:translate-y-0"
          >
            {passwordLoading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </section>

      {/* Sign out */}
      <section className="mt-6 rounded-2xl border border-[rgb(var(--border))] bg-white p-6">
        <h2 className="mb-2 text-base font-semibold">Sign out</h2>
        <p className="mb-4 text-sm text-[rgb(var(--muted))]">
          You&apos;ll need to sign in again to view your orders.
        </p>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="rounded-full border border-[rgb(var(--border))] px-5 py-2.5 text-sm font-semibold transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </section>
    </main>
  );
}
