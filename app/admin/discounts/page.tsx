import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, ExternalLink, KeyRound, Plus } from 'lucide-react';

import { getAdminDiscounts } from '../../../src/lib/shopify-admin/discounts';
import { PageHeader, Panel, StatCard } from '../_components/ui';
import { buttonStyles } from '../../components/ui/button';
import { DiscountListClient } from './discount-list-client';

export const metadata: Metadata = { title: 'Discounts — 801 Outlet Panel' };
export const dynamic = 'force-dynamic';

const SHOPIFY_DISCOUNTS_URL = 'https://admin.shopify.com/store/xwn9c1-m8/discounts';

export default async function AdminDiscountsPage() {
  const result = await getAdminDiscounts(50);
  const discounts = result.discounts;

  const totalCoupons = discounts.length;
  const activeCoupons = discounts.filter((d) => d.status === 'ACTIVE').length;
  const totalUses = discounts.reduce((acc, d) => acc + d.usageCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="OPERATION"
        title="Discounts &"
        titleAccent="coupons"
        subtitle="Manage promotional codes, expiration dates, and usage limits synced with Shopify."
        actions={
          <div className="flex items-center gap-2">
            <a
              href={SHOPIFY_DISCOUNTS_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[rgb(var(--border-strong))] bg-white px-4 text-xs font-semibold transition hover:border-[rgb(var(--fg))]"
            >
              Shopify Discounts <ExternalLink className="size-3.5" />
            </a>
            <Link
              href="/admin/discounts/new"
              className={buttonStyles({
                variant: 'primary',
                size: 'sm',
                className: 'gap-1.5',
              })}
            >
              <Plus className="size-4" /> Create coupon
            </Link>
          </div>
        }
      />

      {result.missingScope ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-5 text-amber-950">
          <div className="flex items-start gap-3">
            <KeyRound className="size-5 shrink-0 text-amber-700 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold">Shopify App Permission Required</h2>
              <p className="mt-1 text-xs leading-relaxed text-amber-900">
                To create, list, and delete discount codes directly from this custom panel, your Shopify app credentials require the{' '}
                <code className="rounded bg-amber-200/80 px-1 py-0.5 font-mono text-[11px] font-bold">write_discounts</code> access scope.
              </p>
              <div className="mt-3 text-xs leading-relaxed text-amber-900">
                <span className="font-semibold">Quick setup step:</span>
                <ol className="mt-1 list-decimal list-inside space-y-1">
                  <li>Open Shopify Partner Dashboard &gt; Apps &gt; <span className="font-semibold">801-outlet-panel</span> &gt; Configuration.</li>
                  <li>Under Admin API access scopes, check <span className="font-semibold">write_discounts</span> (and <span className="font-semibold">read_discounts</span>).</li>
                  <li>Run <code className="rounded bg-amber-200/80 px-1 py-0.5 font-mono text-[11px]">npm run panel:token</code> to update your local and Vercel access token.</li>
                </ol>
              </div>
              <p className="mt-3 text-xs text-amber-800">
                Note: Shoppers on the public storefront can already apply discounts in the cart without requiring admin credentials!
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {result.error && !result.missingScope ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>Error loading coupons from Shopify: {result.error}</span>
        </div>
      ) : null}

      {/* Stats summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Coupons"
          value={String(totalCoupons)}
          sub="Configured in Shopify"
          accent
        />
        <StatCard
          title="Active Now"
          value={String(activeCoupons)}
          sub="Available for checkout"
        />
        <StatCard
          title="Total Redemptions"
          value={String(totalUses)}
          sub="Times applied by buyers"
        />
      </div>

      <Panel title="All promotional coupons">
        <DiscountListClient discounts={discounts} />
      </Panel>
    </div>
  );
}
