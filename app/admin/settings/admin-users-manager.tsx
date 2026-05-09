'use client';

import { useActionState } from 'react';
import { useTransition } from 'react';
import { inviteAdmin, removeAdmin } from './actions';

// ─── Invite form ──────────────────────────────────────────────────────────────

export function InviteAdminForm() {
  const [state, formAction, pending] = useActionState(inviteAdmin, null);

  return (
    <form action={formAction} className="space-y-3">
      {state?.error && (
        <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-2.5 text-sm text-green-400">
          {state.success}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email address"
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
        <input
          name="full_name"
          type="text"
          placeholder="Full name (optional)"
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
        <select
          name="role"
          className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-400 disabled:opacity-50 transition"
      >
        {pending ? 'Inviting…' : 'Invite admin'}
      </button>
    </form>
  );
}

// ─── Remove button ────────────────────────────────────────────────────────────

export function RemoveAdminButton({ adminId, email }: { adminId: string; email: string }) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!confirm(`Remove ${email} as admin?`)) return;
    startTransition(async () => {
      const result = await removeAdmin(adminId);
      if (result.error) alert(result.error);
    });
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition"
    >
      {isPending ? 'Removing…' : 'Remove'}
    </button>
  );
}
