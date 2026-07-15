import { NextResponse, type NextRequest } from 'next/server';

import { buildLogoutUrl } from '../../../../src/lib/shopify/customer/oauth';
import {
  clearCustomerSession,
  getCustomerIdToken,
} from '../../../../src/lib/shopify/customer/session';

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const idToken = await getCustomerIdToken();
  await clearCustomerSession();

  // Also end the session at Shopify so shared devices are fully signed out.
  const target = idToken ? buildLogoutUrl(idToken, origin) : origin;
  return NextResponse.redirect(new URL(target), { status: 303 });
}
