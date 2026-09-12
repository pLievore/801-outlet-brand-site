'use server';

import { revalidatePath } from 'next/cache';
import { hasValidPanelSession } from '../../../src/lib/panel/session';
import {
  deleteLead,
  updateLeadStatus,
} from '../../../src/lib/leads/store';
import type { LeadStatus } from '../../../src/lib/leads/types';

type ActionResult = { ok: boolean; error?: string };

export async function updateLeadStatusAction(
  id: string,
  status: LeadStatus,
  note?: string
): Promise<ActionResult> {
  const authed = await hasValidPanelSession();
  if (!authed) {
    return { ok: false, error: 'Unauthorized panel session.' };
  }

  if (!id || !status) {
    return { ok: false, error: 'Lead id and status are required.' };
  }

  const updated = await updateLeadStatus(id, status, note);
  if (!updated) {
    return { ok: false, error: 'Lead not found.' };
  }

  revalidatePath('/admin/leads');
  return { ok: true };
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  const authed = await hasValidPanelSession();
  if (!authed) {
    return { ok: false, error: 'Unauthorized panel session.' };
  }

  if (!id) {
    return { ok: false, error: 'Lead id is required.' };
  }

  const deleted = await deleteLead(id);
  if (!deleted) {
    return { ok: false, error: 'Failed to delete lead.' };
  }

  revalidatePath('/admin/leads');
  return { ok: true };
}
