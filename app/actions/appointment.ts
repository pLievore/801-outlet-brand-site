'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';

import {
  formatSlotForHumans,
  isSlotAvailable,
} from '../../src/lib/content/booking';

export type AppointmentResult = {
  ok: boolean;
  error?: string;
  /** Human-readable slot, echoed back for the success message. */
  confirmedFor?: string;
};

const BOOKING_RECIPIENT = 'support@801outlet.com';
const FALLBACK_ERROR =
  'We could not save your request right now. Please text or call (801) 854-6060 and we will book it for you.';

const MAX_SUBMISSIONS_PER_WINDOW = 5;
const WINDOW_MS = 60 * 60 * 1000;
const submissionLog = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (submissionLog.get(key) ?? []).filter(
    (time) => now - time < WINDOW_MS
  );
  submissionLog.set(key, recent);
  if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) return true;
  recent.push(now);
  return false;
}

function sanitizeLine(value: string, maxLength: number): string {
  return value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:00$/;

export async function requestAppointmentAction(
  input: unknown
): Promise<AppointmentResult> {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: FALLBACK_ERROR };
  }

  const raw = input as Record<string, unknown>;
  const field = (name: string) =>
    typeof raw[name] === 'string' ? (raw[name] as string) : '';

  // Honeypot: real visitors never fill this hidden field.
  if (field('company').trim() !== '') return { ok: true };

  const name = sanitizeLine(field('name'), 100);
  const email = sanitizeLine(field('email'), 200);
  const phone = sanitizeLine(field('phone'), 40);
  const notes = field('notes').trim().slice(0, 1000);
  const date = sanitizeLine(field('date'), 10);
  const time = sanitizeLine(field('time'), 5);

  if (!name || !EMAIL_PATTERN.test(email) || phone.length < 7) {
    return {
      ok: false,
      error: 'Please fill in your name, a valid email and a phone number.',
    };
  }
  if (!DATE_PATTERN.test(date) || !TIME_PATTERN.test(time)) {
    return { ok: false, error: 'Please pick a day and a time for your visit.' };
  }
  if (!isSlotAvailable(date, time)) {
    return {
      ok: false,
      error:
        'That time is no longer available. Please pick another slot from the list.',
    };
  }

  const headerList = await headers();
  const clientKey =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientKey)) {
    return {
      ok: false,
      error: 'Too many requests in a short time. Please try again later.',
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.error('[appointment] email provider is not configured');
    return { ok: false, error: FALLBACK_ERROR };
  }

  const slotLabel = formatSlotForHumans(date, time);

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to: BOOKING_RECIPIENT,
      replyTo: email,
      subject: `[Showroom appointment] ${slotLabel} — ${name}`,
      text: [
        'New showroom appointment request',
        '',
        `When:  ${slotLabel}`,
        `Name:  ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        notes ? '' : null,
        notes ? `Notes: ${notes}` : null,
        '',
        'Confirm with the customer by text or phone call.',
      ]
        .filter((line): line is string => line !== null)
        .join('\n'),
    });

    if (error) {
      console.error('[appointment] send failed', { code: error.name });
      return { ok: false, error: FALLBACK_ERROR };
    }

    // Customer copy is best-effort: the request is already with the team.
    const customerCopy = await resend.emails.send({
      from,
      to: email,
      replyTo: BOOKING_RECIPIENT,
      subject: `Your showroom visit — ${slotLabel}`,
      text: [
        `Hi ${name},`,
        '',
        `Thanks for booking a visit to the 801 Outlet showroom.`,
        '',
        `When:  ${slotLabel}`,
        'Where: 2251 South 400 East, South Salt Lake, UT 84115',
        '',
        'Our team will confirm by text message or phone call. Need to change',
        'or cancel? Just reply to this email or text (801) 854-6060.',
        '',
        '— 801 Outlet',
      ].join('\n'),
    });
    if (customerCopy.error) {
      console.error('[appointment] customer copy failed', {
        code: customerCopy.error.name,
      });
    }

    return { ok: true, confirmedFor: slotLabel };
  } catch {
    console.error('[appointment] send failed', { code: 'exception' });
    return { ok: false, error: FALLBACK_ERROR };
  }
}
