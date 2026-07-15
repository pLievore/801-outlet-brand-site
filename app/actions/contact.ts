'use server';

import { headers } from 'next/headers';
import { Resend } from 'resend';

export type ContactFormResult = {
  ok: boolean;
  /** Buyer-facing error message when ok is false. */
  error?: string;
};

const CONTACT_RECIPIENT = 'support@801outlet.com';
const GENERIC_ERROR =
  'We could not send your message right now. Please try again or email us directly.';

const MAX_SUBMISSIONS_PER_WINDOW = 5;
const WINDOW_MS = 60 * 60 * 1000;

// Best-effort limiter: per serverless instance, complements the honeypot.
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

export async function sendContactMessageAction(
  input: unknown
): Promise<ContactFormResult> {
  if (typeof input !== 'object' || input === null) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const raw = input as Record<string, unknown>;
  const field = (name: string) =>
    typeof raw[name] === 'string' ? (raw[name] as string) : '';

  // Honeypot: real users never fill this hidden field.
  if (field('company').trim() !== '') {
    // Pretend success so bots learn nothing.
    return { ok: true };
  }

  const name = sanitizeLine(field('name'), 100);
  const email = sanitizeLine(field('email'), 200);
  const phone = sanitizeLine(field('phone'), 40);
  const subject = sanitizeLine(field('subject'), 150);
  const message = field('message').trim().slice(0, 5000);

  if (!name || !EMAIL_PATTERN.test(email) || message.length < 10) {
    return {
      ok: false,
      error:
        'Please fill in your name, a valid email address and a message of at least 10 characters.',
    };
  }

  const headerList = await headers();
  const clientKey =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientKey)) {
    return {
      ok: false,
      error: 'Too many messages in a short time. Please try again later.',
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.error('[contact] email provider is not configured');
    return { ok: false, error: GENERIC_ERROR };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: CONTACT_RECIPIENT,
      replyTo: email,
      subject: `[Website contact] ${subject || 'New message'} — ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        subject ? `Subject: ${subject}` : null,
        '',
        message,
      ]
        .filter((line): line is string => line !== null)
        .join('\n'),
    });

    if (error) {
      console.error('[contact] send failed', { code: error.name });
      return { ok: false, error: GENERIC_ERROR };
    }

    return { ok: true };
  } catch {
    console.error('[contact] send failed', { code: 'exception' });
    return { ok: false, error: GENERIC_ERROR };
  }
}
