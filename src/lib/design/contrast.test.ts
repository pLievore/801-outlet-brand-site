import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  PANEL_CHART,
  PANEL_MARKER,
  PANEL_SURFACE,
} from './panel-palette';

/**
 * WCAG 2.2 contrast guard for the design tokens in app/globals.css.
 *
 * Tokens are parsed from the stylesheet itself so this test cannot drift
 * from what the browser actually renders. Pairs cover the combinations the
 * shell and primitives actually use: body text, secondary text, buttons,
 * announcement bar, footer card, focus ring, badges and input borders.
 */

type Rgb = [number, number, number];

const stylesheet = readFileSync(
  path.join(process.cwd(), 'app', 'globals.css'),
  'utf8'
);

function token(name: string): Rgb {
  const match = stylesheet.match(
    new RegExp(`--${name}:\\s*(\\d{1,3})\\s+(\\d{1,3})\\s+(\\d{1,3})\\s*;`)
  );
  assert.ok(match, `token --${name} not found in app/globals.css`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (value: number) => {
    const scaled = value / 255;
    return scaled <= 0.04045
      ? scaled / 12.92
      : Math.pow((scaled + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x
  );
  return (lighter + 0.05) / (darker + 0.05);
}

const white: Rgb = [255, 255, 255];

const textPairs: Array<[string, Rgb, Rgb]> = [
  ['fg on bg (body text)', token('fg'), token('bg')],
  ['fg on surface', token('fg'), token('surface')],
  ['fg on surface-muted (ghost hover)', token('fg'), token('surface-muted')],
  ['muted on bg (secondary text)', token('muted'), token('bg')],
  ['muted on surface', token('muted'), token('surface')],
  ['white on fg (primary button)', white, token('fg')],
  ['white on sage-ink (sage button, announcement bar)', white, token('sage-ink')],
  ['sage-ink on sage-soft (footer card)', token('sage-ink'), token('sage-soft')],
  ['sage-ink on bg', token('sage-ink'), token('bg')],
  ['accent on surface (accent text/links)', token('accent'), token('surface')],
  ['accent on accent-soft (promo badge)', token('accent'), token('accent-soft')],
];

const nonTextPairs: Array<[string, Rgb, Rgb]> = [
  ['accent focus ring on bg', token('accent'), token('bg')],
  ['accent focus ring on surface', token('accent'), token('surface')],
  ['border-strong input boundary on surface', token('border-strong'), token('surface')],
  ['border-strong input boundary on bg', token('border-strong'), token('bg')],
];

test('text token pairs meet WCAG 2.2 AA (4.5:1)', () => {
  for (const [name, foreground, background] of textPairs) {
    const ratio = contrastRatio(foreground, background);
    assert.ok(
      ratio >= 4.5,
      `${name}: ${ratio.toFixed(2)}:1 is below the 4.5:1 AA minimum`
    );
  }
});

test('non-text UI token pairs meet WCAG 2.2 (3:1)', () => {
  for (const [name, foreground, background] of nonTextPairs) {
    const ratio = contrastRatio(foreground, background);
    assert.ok(
      ratio >= 3,
      `${name}: ${ratio.toFixed(2)}:1 is below the 3:1 non-text minimum`
    );
  }
});

/* ── Panel ────────────────────────────────────────────────────────────────
 * The admin sidebar is dark and its text is white at several opacities. None
 * of it was ever measured: the guard above only covered the storefront, and
 * the panel's colours were loose hex inside components. They are tokens now,
 * so they can be held to the same bar.
 */

/** White at `alpha` over an opaque background, as the browser composites it. */
function overlayWhite(background: Rgb, alpha: number): Rgb {
  return background.map((channel) =>
    Math.round(channel * (1 - alpha) + 255 * alpha)
  ) as Rgb;
}

function parseHex(hex: string): Rgb {
  const match = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  assert.ok(match, `${hex} is not a six-digit hex colour`);
  return [
    parseInt(match[1], 16),
    parseInt(match[2], 16),
    parseInt(match[3], 16),
  ];
}

const panelTextPairs: Array<[string, Rgb, Rgb]> = [
  ['white on panel (nav label, headings)', white, token('panel')],
  [
    'white/55 on panel (inactive nav item)',
    overlayWhite(token('panel'), 0.55),
    token('panel'),
  ],
  [
    'white/50 on panel ("Admin panel" subtitle)',
    overlayWhite(token('panel'), 0.5),
    token('panel'),
  ],
  [
    'panel-marker on panel (active icon, operator initials)',
    token('panel-marker'),
    token('panel'),
  ],
  // Both were below the bar and were raised: the group titles and "Signed in"
  // sat at 4.45:1 and 3.84:1, small 10px text at that. 0.65 is the step that
  // clears AA with room, and this pins it so nobody dims them back.
  [
    'white/65 on panel ("Signed in")',
    overlayWhite(token('panel'), 0.65),
    token('panel'),
  ],
  [
    'white/65 on panel (sidebar group titles)',
    overlayWhite(token('panel'), 0.65),
    token('panel'),
  ],
];

test('panel text token pairs meet WCAG 2.2 AA (4.5:1)', () => {
  for (const [name, foreground, background] of panelTextPairs) {
    const ratio = contrastRatio(foreground, background);
    assert.ok(
      ratio >= 4.5,
      `${name}: ${ratio.toFixed(2)}:1 is below the 4.5:1 AA minimum`
    );
  }
});

test('panel non-text pairs meet WCAG 2.2 (3:1)', () => {
  const pairs: Array<[string, Rgb, Rgb]> = [
    ['panel-marker rule on panel', token('panel-marker'), token('panel')],
    ['panel-chart bar on surface', token('panel-chart'), token('surface')],
    // Icons sit beside their own text label, so they are decoration — but they
    // still have to be visible.
    ['white/40 icon on panel', overlayWhite(token('panel'), 0.4), token('panel')],
  ];

  for (const [name, foreground, background] of pairs) {
    const ratio = contrastRatio(foreground, background);
    assert.ok(
      ratio >= 3,
      `${name}: ${ratio.toFixed(2)}:1 is below the 3:1 non-text minimum`
    );
  }
});

test('chart literals still match the tokens they mirror', () => {
  // These reach SVG through attributes, where var() does not resolve, so they
  // are duplicated by necessity. This is what stops the duplicate from drifting.
  assert.deepEqual(parseHex(PANEL_CHART), token('panel-chart'));
  assert.deepEqual(parseHex(PANEL_SURFACE), token('panel'));
  assert.deepEqual(parseHex(PANEL_MARKER), token('panel-marker'));
});
