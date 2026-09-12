import { NextResponse } from 'next/server';
import {
  deleteLead,
  getLeads,
  saveOrUpdateLead,
  updateLeadStatus,
} from '../../../src/lib/leads/store';
import type { LeadStatus, LeadSyncPayload } from '../../../src/lib/leads/types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const leads = await getLeads();
    return NextResponse.json({ leads });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeadSyncPayload;
    if (!body?.contact || typeof body.contact !== 'string') {
      return NextResponse.json(
        { error: 'Contact information required' },
        { status: 400 }
      );
    }

    const clean = body.contact.trim();
    const isEmail = clean.includes('@');
    const isPhone = clean.replace(/\D/g, '').length >= 10;

    if (!isEmail && !isPhone) {
      return NextResponse.json(
        { error: 'Valid email or 10-digit phone required' },
        { status: 400 }
      );
    }

    const lead = await saveOrUpdateLead({
      contact: clean,
      channel: isEmail ? 'email' : 'phone',
      views: body.views,
      cart: body.cart,
      coupon: body.coupon,
    });

    return NextResponse.json({ ok: true, lead });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save lead' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      status?: LeadStatus;
      note?: string;
    };

    if (!body?.id || !body?.status) {
      return NextResponse.json(
        { error: 'Lead id and status are required' },
        { status: 400 }
      );
    }

    const updated = await updateLeadStatus(body.id, body.status, body.note);
    if (!updated) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead: updated });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Lead id is required' },
        { status: 400 }
      );
    }

    await deleteLead(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
