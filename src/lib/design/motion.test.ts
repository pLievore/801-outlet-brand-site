import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Guard: anything that animates has to honour `prefers-reduced-motion`.
 *
 * `app/globals.css` collapses CSS animations and transitions for anyone who
 * asked for less movement, and it is easy to assume that covers the site. It
 * does not: Motion drives transforms from JavaScript, where a media query in a
 * stylesheet never reaches. Three components were animating straight through
 * the preference — the product gallery scaling open to full screen among them,
 * which is the exact movement the setting exists to avoid.
 *
 * Importing the hook is not proof that every transition uses it, but it is the
 * cheap half: it fails the moment someone adds an animated component and does
 * not think about this at all.
 */

const APP = path.join(process.cwd(), 'app');

function tsxFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return tsxFiles(full);
    return entry.isFile() && entry.name.endsWith('.tsx') ? [full] : [];
  });
}

test('every component that animates reads the reduced-motion preference', () => {
  const offenders = tsxFiles(APP).filter((file) => {
    const source = readFileSync(file, 'utf8');
    if (!source.includes("from 'framer-motion'")) return false;
    return !source.includes('useReducedMotion');
  });

  assert.deepEqual(
    offenders.map((file) => path.relative(process.cwd(), file)),
    [],
    'these animate without consulting prefers-reduced-motion'
  );
});
