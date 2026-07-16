'use client';

import { useState, useTransition } from 'react';

import { cn } from '../../../../src/lib/cn';
import {
  applyImportAction,
  previewImportAction,
  type ImportPreviewRow,
  type ImportRow,
} from '../actions';

/** Minimal CSV parser with quoted-field support. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      cell = '';
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value !== '')) rows.push(row);
  return rows;
}

function toImportRows(csv: string[][]): { rows?: ImportRow[]; error?: string } {
  if (csv.length < 2) return { error: 'The file has no data rows.' };

  const header = csv[0].map((cell) => cell.trim().toLowerCase());
  const variantIndex = header.indexOf('variant_id');
  if (variantIndex === -1) {
    return { error: 'Missing required column: variant_id.' };
  }
  const priceIndex = header.indexOf('price');
  const compareIndex = header.indexOf('compare_at_price');
  const quantityIndex = header.indexOf('quantity');
  if (priceIndex === -1 && compareIndex === -1 && quantityIndex === -1) {
    return {
      error:
        'Include at least one of: price, compare_at_price, quantity.',
    };
  }

  const rows: ImportRow[] = [];
  for (const line of csv.slice(1)) {
    const variantId = line[variantIndex]?.trim();
    if (!variantId) continue;
    const row: ImportRow = { variantId };
    if (priceIndex !== -1 && line[priceIndex]?.trim() !== '') {
      row.price = line[priceIndex].trim();
    }
    if (compareIndex !== -1) {
      row.compareAtPrice = line[compareIndex]?.trim() ?? '';
    }
    if (quantityIndex !== -1 && line[quantityIndex]?.trim() !== '') {
      row.quantity = Number(line[quantityIndex].trim());
    }
    rows.push(row);
  }
  return { rows };
}

export function ImportManager() {
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [preview, setPreview] = useState<ImportPreviewRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const onFile = (file: File | undefined) => {
    setError(null);
    setPreview(null);
    setRows(null);
    setDone(null);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const parsed = toImportRows(parseCsv(String(reader.result ?? '')));
      if (parsed.error || !parsed.rows) {
        setError(parsed.error ?? 'Could not read the file.');
        return;
      }
      setRows(parsed.rows);
      startTransition(async () => {
        const result = await previewImportAction(parsed.rows!);
        if (!result.ok || !result.preview) {
          setError(result.error ?? 'Preview failed.');
          return;
        }
        setPreview(result.preview);
      });
    };
    reader.readAsText(file);
  };

  const apply = () => {
    if (!rows) return;
    setError(null);
    startTransition(async () => {
      const result = await applyImportAction(rows);
      if (!result.ok) {
        setError(result.error ?? 'Import failed.');
        return;
      }
      setDone(result.applied ?? 0);
      setPreview(null);
      setRows(null);
    });
  };

  const changed = preview?.filter((row) => row.valid && row.changes.length > 0) ?? [];
  const invalid = preview?.filter((row) => !row.valid) ?? [];
  const unchanged = (preview?.length ?? 0) - changed.length - invalid.length;

  return (
    <div className="max-w-3xl space-y-5">
      <label className="block rounded-3xl border-2 border-dashed border-[rgb(var(--border-strong))] bg-white px-6 py-10 text-center text-sm text-[rgb(var(--muted))] transition hover:border-[rgb(var(--fg))]">
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => onFile(event.target.files?.[0])}
        />
        <span className="font-semibold text-[rgb(var(--fg))]">
          Choose a CSV file
        </span>{' '}
        or drop it here
      </label>

      {pending ? <p className="text-sm text-[rgb(var(--muted))]">Working…</p> : null}

      {error ? (
        <p
          role="alert"
          className="rounded-xl border border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent-soft))] px-4 py-3 text-sm"
        >
          {error}
        </p>
      ) : null}

      {done !== null ? (
        <p
          role="status"
          className="rounded-xl border border-[rgb(var(--sage))]/50 bg-[rgb(var(--sage-soft))] px-4 py-3 text-sm font-semibold text-[rgb(var(--sage-ink))]"
        >
          Import applied: {done} {done === 1 ? 'change' : 'changes'}.
        </p>
      ) : null}

      {preview ? (
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5">
          <h2 className="text-sm font-bold">Review before applying</h2>
          <p className="mt-1 text-xs text-[rgb(var(--muted))]">
            {changed.length} with changes · {unchanged} unchanged ·{' '}
            {invalid.length} invalid
          </p>

          {invalid.length > 0 ? (
            <ul className="mt-4 space-y-1 text-xs text-[rgb(var(--accent))]">
              {invalid.map((row) => (
                <li key={row.variantId}>
                  <strong>{row.label}</strong>: {row.error}
                </li>
              ))}
            </ul>
          ) : null}

          {changed.length > 0 ? (
            <ul className="mt-4 divide-y divide-[rgb(var(--border))] text-sm">
              {changed.map((row) => (
                <li key={row.variantId} className="py-2.5">
                  <p className="font-semibold">{row.label}</p>
                  <p className="text-xs text-[rgb(var(--muted))]">
                    {row.changes.join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[rgb(var(--muted))]">
              Nothing to change — the file matches the store.
            </p>
          )}

          <button
            type="button"
            onClick={apply}
            disabled={pending || changed.length === 0 || invalid.length > 0}
            className={cn(
              'mt-5 min-h-11 rounded-full px-6 text-sm font-semibold transition',
              changed.length > 0 && invalid.length === 0
                ? 'bg-[rgb(var(--fg))] text-white hover:bg-[rgb(var(--fg))]/90'
                : 'border border-[rgb(var(--border))] text-[rgb(var(--muted))]',
              pending && 'opacity-60'
            )}
          >
            {pending ? 'Applying…' : `Apply ${changed.length} ${changed.length === 1 ? 'change' : 'changes'}`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
