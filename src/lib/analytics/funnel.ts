import 'server-only';

/**
 * Site funnel counters (D-017).
 *
 * Storage is a Redis instance provisioned through Vercel (Upstash). Only
 * aggregate counts are kept — one integer per day per step, never an
 * identifier, IP or anything tied to a person, so the storefront needs no
 * tracking cookie and no consent banner.
 */

export const FUNNEL_STEPS = [
  'session',
  'product_view',
  'add_to_cart',
  'checkout_start',
] as const;

export type FunnelStep = (typeof FUNNEL_STEPS)[number];

export const FUNNEL_STEP_LABEL: Record<FunnelStep | 'purchase', string> = {
  session: 'Visits',
  product_view: 'Product views',
  add_to_cart: 'Added to cart',
  checkout_start: 'Checkout started',
  purchase: 'Orders placed',
};

/** Counters expire after ~13 months so the store never grows unbounded. */
const COUNTER_TTL_SECONDS = 400 * 24 * 60 * 60;

type RedisConfig = { url: string; token: string };

function redisConfig(): RedisConfig | null {
  // Vercel's Upstash integration exposes KV_*; a direct Upstash project uses
  // UPSTASH_*. Accept either so provisioning either way just works.
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '';
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '';
  if (!url || !token) return null;
  return { url, token };
}

export function isFunnelStorageConfigured(): boolean {
  return redisConfig() !== null;
}

async function redisCommand<T>(command: string[]): Promise<T | null> {
  const config = redisConfig();
  if (!config) return null;

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
    signal: AbortSignal.timeout(4000),
  });

  if (!response.ok) {
    throw new Error(`Redis command failed with status ${response.status}`);
  }
  const payload = (await response.json()) as { result: T };
  return payload.result;
}

async function redisPipeline<T>(commands: string[][]): Promise<T[] | null> {
  const config = redisConfig();
  if (!config) return null;

  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    throw new Error(`Redis pipeline failed with status ${response.status}`);
  }
  const payload = (await response.json()) as Array<{ result: T }>;
  return payload.map((entry) => entry.result);
}

/** YYYY-MM-DD in the store's timezone, matching the sales dashboards. */
export function funnelDateKey(
  instant: Date = new Date(),
  timeZone = 'America/Denver'
): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

function counterKey(step: FunnelStep, date: string): string {
  return `funnel:${date}:${step}`;
}

export async function recordFunnelStep(step: FunnelStep): Promise<void> {
  const key = counterKey(step, funnelDateKey());
  await redisPipeline([
    ['INCR', key],
    ['EXPIRE', key, String(COUNTER_TTL_SECONDS)],
  ]);
}

export type FunnelDailyRow = {
  date: string;
  counts: Record<FunnelStep, number>;
};

/** Daily counters for the last N days, oldest first. */
export async function getFunnelCounts(days: number): Promise<FunnelDailyRow[]> {
  const dates = Array.from({ length: days }, (_, index) =>
    funnelDateKey(new Date(Date.now() - (days - 1 - index) * 86400000))
  );

  const keys = dates.flatMap((date) =>
    FUNNEL_STEPS.map((step) => counterKey(step, date))
  );
  if (keys.length === 0) return [];

  const values = await redisCommand<Array<string | null>>(['MGET', ...keys]);
  if (!values) return [];

  return dates.map((date, dayIndex) => {
    const counts = {} as Record<FunnelStep, number>;
    FUNNEL_STEPS.forEach((step, stepIndex) => {
      const raw = values[dayIndex * FUNNEL_STEPS.length + stepIndex];
      counts[step] = raw ? Number(raw) : 0;
    });
    return { date, counts };
  });
}
