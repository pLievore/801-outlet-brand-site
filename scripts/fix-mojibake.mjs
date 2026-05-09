// One-off cleanup: replace double-encoded UTF-8 (mojibake) sequences with
// their correct Unicode characters across the (public) pages.
//
// Mojibake formed when UTF-8 bytes of a char are re-interpreted as Windows-1252
// and re-encoded as UTF-8. We undo the specific patterns that appear in this codebase.
//
// Run: node scripts/fix-mojibake.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FILES = [
  'app/(public)/page.tsx',
  'app/(public)/checkout/success/page.tsx',
  'app/(public)/account/orders/page.tsx',
  'app/(public)/login/page.tsx',
  'app/(public)/checkout/page.tsx',
  'app/(public)/account/profile/page.tsx',
  'app/(public)/cart/cart-view.tsx',
  'app/(public)/about/page.tsx',
  'app/(public)/contact/contact-form.tsx',
  'app/(public)/delivery/page.tsx',
  'app/(public)/privacy/page.tsx',
  'app/(public)/products/page.tsx',
  'app/(public)/terms/page.tsx',
];

const C = String.fromCharCode;

// Mojibake patterns built programmatically (source file stays ASCII-safe).
// Each entry: [mojibake-3char-or-2char-string, correct-unicode-char]
const REPLACEMENTS = [
  // Three-byte UTF-8 originals (curly punctuation, dashes, arrows, bullets)
  [C(0xe2) + C(0x20ac) + C(0x2122), '’'], // '
  [C(0xe2) + C(0x20ac) + C(0x02dc), '‘'], // '
  [C(0xe2) + C(0x20ac) + C(0x0153), '“'], // "
  [C(0xe2) + C(0x20ac) + C(0x201d), '—'], // —
  [C(0xe2) + C(0x20ac) + C(0x201c), '–'], // –
  [C(0xe2) + C(0x20ac) + C(0x00a6), '…'], // …
  [C(0xe2) + C(0x20ac) + C(0x00a2), '•'], // •
  [C(0xe2) + C(0x2020) + C(0x2019), '→'], // →
  [C(0xe2) + C(0x2020) + C(0x2018), '←'], // ←
  [C(0xe2) + C(0x2020) + C(0x0090), '←'], // ← (CP1252 maps 0x90 to U+0090 control char)
  [C(0xe2) + C(0x2020) + C(0x009f), '←'], // ← (alt mapping)
  // Two-byte UTF-8 originals (Latin accented letters, ×)
  [C(0xc3) + C(0xa9), 'é'], // é
  [C(0xc3) + C(0xa1), 'á'], // á
  [C(0xc3) + C(0xa2), 'â'], // â
  [C(0xc3) + C(0xa3), 'ã'], // ã
  [C(0xc3) + C(0xa0), 'à'], // à
  [C(0xc3) + C(0xa7), 'ç'], // ç
  [C(0xc3) + C(0xa8), 'è'], // è
  [C(0xc3) + C(0xaa), 'ê'], // ê
  [C(0xc3) + C(0xab), 'ë'], // ë
  [C(0xc3) + C(0xad), 'í'], // í
  [C(0xc3) + C(0xae), 'î'], // î
  [C(0xc3) + C(0xb3), 'ó'], // ó
  [C(0xc3) + C(0xb4), 'ô'], // ô
  [C(0xc3) + C(0xb5), 'õ'], // õ
  [C(0xc3) + C(0xba), 'ú'], // ú
  [C(0xc3) + C(0xbc), 'ü'], // ü
  [C(0xc3) + C(0x97), '×'], // ×
];

let totalFixed = 0;
for (const rel of FILES) {
  const path = resolve(rel);
  let content;
  try {
    content = readFileSync(path, 'utf8');
  } catch (e) {
    console.warn('skip ' + rel + ': ' + e.message);
    continue;
  }
  const orig = content;
  for (const [from, to] of REPLACEMENTS) {
    content = content.split(from).join(to);
  }
  if (content !== orig) {
    writeFileSync(path, content, 'utf8');
    totalFixed++;
    console.log('fixed: ' + rel);
  }
}
console.log('Done. ' + totalFixed + ' files updated.');
