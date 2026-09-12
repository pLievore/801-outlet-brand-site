'use client';

import type { LeadCart, LeadProductView, LeadSyncPayload } from './types';

const STORAGE_VIEWS_KEY = '801_product_views';
const STORAGE_CONTACT_KEY = '801_lead_contact';
const STORAGE_CHANNEL_KEY = '801_lead_channel';

export function getClientContact(): {
  contact: string;
  channel: 'email' | 'phone';
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const contact = localStorage.getItem(STORAGE_CONTACT_KEY);
    const channel = localStorage.getItem(STORAGE_CHANNEL_KEY) as
      | 'email'
      | 'phone'
      | null;
    if (contact && channel) {
      return { contact, channel };
    }
  } catch {}
  return null;
}

export function saveClientContact(
  contact: string,
  channel: 'email' | 'phone'
) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CONTACT_KEY, contact);
    localStorage.setItem(STORAGE_CHANNEL_KEY, channel);
  } catch {}
}

export function getClientProductViews(): LeadProductView[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_VIEWS_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, LeadProductView>;
    return Object.values(map).sort((a, b) => b.viewCount - a.viewCount);
  } catch {
    return [];
  }
}

export function recordClientProductView(product: {
  handle: string;
  title: string;
  image?: string | null;
  price?: string | null;
}) {
  if (typeof window === 'undefined' || !product.handle) return;
  try {
    const raw = localStorage.getItem(STORAGE_VIEWS_KEY);
    const map: Record<string, LeadProductView> = raw ? JSON.parse(raw) : {};
    const now = new Date().toISOString();

    const existing = map[product.handle];
    if (existing) {
      existing.viewCount += 1;
      existing.lastViewedAt = now;
      if (product.image && !existing.image) existing.image = product.image;
      if (product.price && !existing.price) existing.price = product.price;
    } else {
      map[product.handle] = {
        handle: product.handle,
        title: product.title,
        image: product.image ?? null,
        price: product.price ?? null,
        viewCount: 1,
        firstViewedAt: now,
        lastViewedAt: now,
      };
    }

    localStorage.setItem(STORAGE_VIEWS_KEY, JSON.stringify(map));

    // If contact is already known, trigger a background sync
    const known = getClientContact();
    if (known) {
      void syncLeadToServer(known);
    }
  } catch {}
}

export async function syncLeadToServer(
  contactInfo?: { contact: string; channel: 'email' | 'phone' },
  cart?: LeadCart | null
) {
  if (typeof window === 'undefined') return;

  const info = contactInfo ?? getClientContact();
  if (!info) return;

  const views = getClientProductViews();
  const payload: LeadSyncPayload = {
    contact: info.contact,
    channel: info.channel,
    views,
    cart,
    coupon: 'WELCOME50',
  };

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      });
      navigator.sendBeacon('/api/leads', blob);
      return;
    }
  } catch {}

  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {}
}
