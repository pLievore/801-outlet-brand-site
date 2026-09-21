'use client';

import { useState, useTransition } from 'react';

import { cn } from '../../../../src/lib/cn';
import {
  parseCsv,
  toImportRows,
  type ImportRow,
} from '../../../../src/lib/panel/import-csv';
import {
  applyImportAction,
  previewImportAction,
  type ImportPreviewRow,
} from '../actions';

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

  const created = preview?.filter((row) => row.valid && row.action === 'create') ?? [];
  const updated = preview?.filter((row) => row.valid && row.action === 'update') ?? [];
  const changed = [...created, ...updated];
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
          className="rounded-xl border border-[rgb(var(--accent)/0.4)] bg-[rgb(var(--accent-soft))] px-4 py-3 text-sm"
        >
          {error}
        </p>
      ) : null}

      {done !== null ? (
        <p
          role="status"
          className="rounded-xl border border-[rgb(var(--sage)/0.5)] bg-[rgb(var(--sage-soft))] px-4 py-3 text-sm font-semibold text-[rgb(var(--sage-ink))]"
        >
          Import applied: {done} {done === 1 ? 'change' : 'changes'}.
        </p>
      ) : null}

      {preview ? (
        <div className="rounded-3xl border border-[rgb(var(--border))] bg-white p-5">
          <h2 className="text-sm font-bold">Review before applying</h2>
          <p className="mt-1 text-xs text-[rgb(var(--muted))]">
            {created.length} new · {updated.length} updated · {unchanged}{' '}
            unchanged · {invalid.length} invalid
          </p>

          {created.length > 0 ? (
            <p className="mt-3 rounded-xl bg-[rgb(var(--sage-soft))] px-4 py-2.5 text-xs text-[rgb(var(--sage-ink))]">
              New products are created as <strong>drafts</strong>. Add their
              photos and publish them from the products list when they are ready.
            </p>
          ) : null}

          {invalid.length > 0 ? (
            <ul className="mt-4 space-y-1 text-xs text-[rgb(var(--accent))]">
              {invalid.map((row) => (
                <li key={row.key}>
                  <strong>{row.label}</strong>: {row.error}
                </li>
              ))}
            </ul>
          ) : null}

          {changed.length > 0 ? (
            <ul className="mt-4 divide-y divide-[rgb(var(--border))] text-sm">
              {changed.map((row) => (
                <li key={row.key} className="py-2.5">
                  <p className="font-semibold">
                    {row.action === 'create' ? (
                      <span className="mr-2 rounded-full bg-[rgb(var(--sage-ink))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        New
                      </span>
                    ) : null}
                    {row.label}
                  </p>
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
                ? 'bg-[rgb(var(--fg))] text-white hover:bg-[rgb(var(--fg)/0.9)]'
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
