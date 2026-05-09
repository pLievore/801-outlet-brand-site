import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { requireAdmin } from '../../src/lib/admin';
import { AdminSidebar } from './components/sidebar';

export const metadata: Metadata = {
  title: 'Admin — 801 Outlet',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const pathname = h.get('x-pathname') ?? '';

  // Login page is inside the admin directory but must NOT be auth-guarded
  // (guarding it causes ERR_TOO_MANY_REDIRECTS)
  if (pathname === '/admin/login') {
    return (
      <div className="bg-neutral-950 min-h-screen">{children}</div>
    );
  }

  const admin = await requireAdmin();

  return (
    <div className="flex h-dvh overflow-hidden bg-neutral-900 text-neutral-100">
      <AdminSidebar adminName={admin.full_name ?? admin.email} />
      {/* pt-14 on mobile offsets the fixed top bar; lg:pt-0 removes it on desktop */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
