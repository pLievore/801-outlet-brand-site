import { NextResponse } from 'next/server';
import { saveOrUpdateLead } from '../../../src/lib/leads/store';
import type { LeadCart, LeadProductView, LeadSyncPayload } from '../../../src/lib/leads/types';

export const runtime = 'nodejs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDLE_REGEX = /^[a-z0-9-]+$/i;

/**
 * Public lead capture beacon.
 * Only accepts POST for anonymous submission from the storefront (welcome modal, product interest).
 * NEVER returns stored lead data.
 * All administrative reads/updates/deletions must go through authenticated Server Actions in /admin/leads.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    // Prevent payload flooding
    if (rawBody.length > 30_000) {
      return new NextResponse(null, { status: 413 });
    }

    const body = JSON.parse(rawBody) as LeadSyncPayload;
    if (!body?.contact || typeof body.contact !== 'string') {
      return new NextResponse(null, { status: 400 });
    }

    const cleanContact = body.contact.trim().slice(0, 100);
    const isEmail = EMAIL_REGEX.test(cleanContact);
    const digitsOnly = cleanContact.replace(/\D/g, '');
    const isPhone = digitsOnly.length >= 10 && digitsOnly.length <= 15;

    if (!isEmail && !isPhone) {
      return new NextResponse(null, { status: 400 });
    }

    // Sanitize views (max 30 items)
    let sanitizedViews: LeadProductView[] | undefined;
    if (Array.isArray(body.views)) {
      sanitizedViews = body.views
        .slice(0, 30)
        .filter((v) => v && typeof v.handle === 'string' && HANDLE_REGEX.test(v.handle))
        .map((v) => ({
          handle: v.handle.slice(0, 80),
          title: typeof v.title === 'string' ? v.title.slice(0, 120) : v.handle,
          image: typeof v.image === 'string' && v.image.startsWith('http') ? v.image.slice(0, 500) : null,
          price: typeof v.price === 'string' ? v.price.slice(0, 30) : null,
          viewCount: typeof v.viewCount === 'number' && Number.isFinite(v.viewCount)
            ? Math.max(1, Math.min(100, Math.trunc(v.viewCount)))
            : 1,
          firstViewedAt: v.firstViewedAt ?? new Date().toISOString(),
          lastViewedAt: v.lastViewedAt ?? new Date().toISOString(),
        }));
    }

    // Sanitize cart
    let sanitizedCart: LeadCart | null = null;
    if (body.cart && typeof body.cart === 'object') {
      const items = Array.isArray(body.cart.items)
        ? body.cart.items.slice(0, 20).map((item) => ({
            title: typeof item.title === 'string' ? item.title.slice(0, 100) : '',
            variantTitle: typeof item.variantTitle === 'string' ? item.variantTitle.slice(0, 60) : undefined,
            quantity: typeof item.quantity === 'number' && Number.isFinite(item.quantity)
              ? Math.max(1, Math.min(50, Math.trunc(item.quantity)))
              : 1,
            price: typeof item.price === 'string' ? item.price.slice(0, 30) : '0',
          }))
        : [];

      sanitizedCart = {
        hasItems: Boolean(body.cart.hasItems),
        totalQuantity: typeof body.cart.totalQuantity === 'number' ? Math.max(0, Math.min(100, body.cart.totalQuantity)) : items.length,
        totalAmount: typeof body.cart.totalAmount === 'string' ? body.cart.totalAmount.slice(0, 30) : '0',
        items,
        discountCode: typeof body.cart.discountCode === 'string' ? body.cart.discountCode.slice(0, 30) : null,
      };
    }

    await saveOrUpdateLead({
      contact: isEmail ? cleanContact.toLowerCase() : digitsOnly,
      channel: isEmail ? 'email' : 'phone',
      views: sanitizedViews,
      cart: sanitizedCart,
      coupon: typeof body.coupon === 'string' ? body.coupon.slice(0, 30) : undefined,
    });

    // Best-effort response with no leak of internal data
    return NextResponse.json({ ok: true });
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}

/** Reject all read and administrative HTTP methods on the public endpoint */
export function GET() {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}

export function PATCH() {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}

export function DELETE() {
  return new NextResponse('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}
