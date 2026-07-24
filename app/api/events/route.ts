import { NextResponse } from 'next/server';

import {
  FUNNEL_STEPS,
  isFunnelStorageConfigured,
  recordFunnelStep,
  type FunnelStep,
} from '../../../src/lib/analytics/funnel';

export const runtime = 'nodejs';

const ALLOWED = new Set<string>(FUNNEL_STEPS);

/**
 * First-party funnel beacon. Accepts one known step name and increments a
 * daily counter; the body carries nothing else, and nothing about the visitor
 * is stored. Always answers 204 so a storage outage never surfaces in the UI.
 */
export async function POST(request: Request) {
  if (!isFunnelStorageConfigured()) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const body = (await request.json()) as { step?: unknown };
    if (typeof body.step !== 'string' || !ALLOWED.has(body.step)) {
      return new NextResponse(null, { status: 204 });
    }
    await recordFunnelStep(body.step as FunnelStep);
  } catch {
    // Beacons are best-effort by design.
  }

  return new NextResponse(null, { status: 204 });
}
