import { requireAdmin } from '../../../src/lib/admin';
import { supabaseAdmin } from '../../../src/lib/supabase/admin';
import { InviteAdminForm, RemoveAdminButton } from './admin-users-manager';

export const revalidate = 0;

export default async function SettingsPage() {
  const admin = await requireAdmin();

  const { data: admins } = await supabaseAdmin
    .from('admin_users')
    .select('id, email, full_name, role, created_at')
    .order('created_at');

  return (
    <div className="px-6 py-8 space-y-8 max-w-3xl">
      <h1 className="text-xl font-bold text-white">Settings</h1>

      {/* Store info (read-only for now) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Store</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-neutral-400 mb-1">Name</div>
            <div className="text-white">801 Outlet</div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-1">Region</div>
            <div className="text-white">Utah, USA</div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-1">Currency</div>
            <div className="text-white">USD</div>
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-1">Delivery scope</div>
            <div className="text-white">Utah only</div>
          </div>
        </div>
      </div>

      {/* Admin users */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white">Admin users</h2>
        <div className="divide-y divide-white/5">
          {(admins ?? []).map((a) => (
            <div key={a.id} className="flex items-center justify-between py-3">
              <div>
                <div className="text-sm text-white">{a.full_name ?? '—'}</div>
                <div className="text-xs text-neutral-400">{a.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-neutral-300 capitalize">
                  {a.role}
                </span>
                <RemoveAdminButton adminId={a.id} email={a.email} />
              </div>
            </div>
          ))}
        </div>

        {/* Invite form */}
        <div className="border-t border-white/10 pt-5 space-y-2">
          <p className="text-xs font-medium text-neutral-400">Invite new admin</p>
          <InviteAdminForm />
        </div>
      </div>

      {/* Current session */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-2">
        <h2 className="text-sm font-semibold text-white">Your account</h2>
        <p className="text-sm text-neutral-300">
          Signed in as <span className="text-white font-medium">{admin.email}</span>
        </p>
        <p className="text-xs text-neutral-500">Role: <span className="capitalize">{admin.role}</span></p>
      </div>

      {/* Environment */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-2">
        <h2 className="text-sm font-semibold text-white">Environment</h2>
        <div className="space-y-1 text-sm">
          {[
            ['NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL],
            ['Supabase URL', process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/https?:\/\//, '').split('.')[0] + '.supabase.co'],
            ['Square environment', process.env.SQUARE_ENVIRONMENT ?? 'sandbox'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-neutral-400">{label}</span>
              <span className="text-white font-mono text-xs">{value ?? '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
