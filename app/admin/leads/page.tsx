import type { Metadata } from 'next';
import { getLeads } from '../../../src/lib/leads/store';
import { PageHeader } from '../_components/ui';
import { LeadListClient } from './lead-list-client';

export const metadata: Metadata = {
  title: 'Leads Intelligence · 801 Outlet Admin',
};

export const revalidate = 0; // Fresh leads data on every request

export default async function AdminLeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SALES & PROSPECTS"
        title="Leads &"
        titleAccent="intelligence"
        subtitle="Track interested shoppers, sofas viewed, active carts, and trigger 1-click sales follow-ups."
      />

      <LeadListClient initialLeads={leads} />
    </div>
  );
}
