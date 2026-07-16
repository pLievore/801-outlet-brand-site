/**
 * One-time operator tool (D-013): installs the 801-outlet-panel app on the
 * store via OAuth and writes the offline Admin API token DIRECTLY into
 * .env.local as SHOPIFY_ADMIN_ACCESS_TOKEN. The token is never printed.
 *
 * Requires in .env.local: SHOPIFY_PANEL_CLIENT_ID, SHOPIFY_PANEL_CLIENT_SECRET.
 * The app's Redirect URLs must include: http://localhost:53134/callback
 *
 * Run: npm run panel:token
 */
import { createServer } from 'node:http';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { exec } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SHOP_DOMAIN = '801-outlet.myshopify.com';
const PORT = 53134;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES =
  'read_products,write_products,read_inventory,write_inventory,read_locations,read_orders,read_customers';
const ENV_FILE = join(process.cwd(), '.env.local');

const clientId = process.env.SHOPIFY_PANEL_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_PANEL_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error(
    'Missing SHOPIFY_PANEL_CLIENT_ID / SHOPIFY_PANEL_CLIENT_SECRET in .env.local'
  );
  process.exit(1);
}

const state = randomBytes(24).toString('base64url');

function validHmac(params: URLSearchParams): boolean {
  const received = params.get('hmac');
  if (!received) return false;
  const message = [...params.entries()]
    .filter(([key]) => key !== 'hmac')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  const digest = createHmac('sha256', clientSecret!).update(message).digest('hex');
  const a = Buffer.from(digest);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

function saveTokenToEnv(token: string) {
  let content = readFileSync(ENV_FILE, 'utf8');
  if (/^SHOPIFY_ADMIN_ACCESS_TOKEN=.*$/m.test(content)) {
    content = content.replace(
      /^SHOPIFY_ADMIN_ACCESS_TOKEN=.*$/m,
      `SHOPIFY_ADMIN_ACCESS_TOKEN=${token}`
    );
  } else {
    content += `\nSHOPIFY_ADMIN_ACCESS_TOKEN=${token}\n`;
  }
  writeFileSync(ENV_FILE, content);
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', REDIRECT_URI);
  if (url.pathname !== '/callback') {
    response.writeHead(404).end();
    return;
  }

  const params = url.searchParams;
  if (
    params.get('state') !== state ||
    params.get('shop') !== SHOP_DOMAIN ||
    !params.get('code') ||
    !validHmac(params)
  ) {
    response.writeHead(400).end('Invalid callback. Check the terminal.');
    console.error('Callback validation failed. Try again.');
    server.close();
    return;
  }

  const tokenResponse = await fetch(
    `https://${SHOP_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: params.get('code'),
      }),
    }
  );

  if (!tokenResponse.ok) {
    response.writeHead(502).end('Token exchange failed. Check the terminal.');
    console.error('Token exchange failed with status', tokenResponse.status);
    server.close();
    return;
  }

  const { access_token, scope } = (await tokenResponse.json()) as {
    access_token: string;
    scope: string;
  };

  saveTokenToEnv(access_token);

  response
    .writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    .end('Done! Token saved to .env.local. You can close this tab.');

  console.log('\nApp installed. Granted scopes:', scope);
  console.log('SHOPIFY_ADMIN_ACCESS_TOKEN was written to .env.local.');
  console.log('(The token itself is not displayed anywhere.)');
  server.close();
});

server.listen(PORT, () => {
  const authorize = new URL(`https://${SHOP_DOMAIN}/admin/oauth/authorize`);
  authorize.searchParams.set('client_id', clientId!);
  authorize.searchParams.set('scope', SCOPES);
  authorize.searchParams.set('redirect_uri', REDIRECT_URI);
  authorize.searchParams.set('state', state);

  console.log('Opening browser for install approval…');
  console.log('If it does not open, visit:\n' + authorize.toString());
  exec(`start "" "${authorize.toString()}"`);
});
