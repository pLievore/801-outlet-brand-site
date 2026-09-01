'use client';

/**
 * "Choose from Drive" — the photos of a piece live in a Google Drive folder
 * shared by the operation, and downloading them just to upload them again is
 * the kind of chore that stops getting done.
 *
 * The operator signs in with their own Google account and picks files (or a
 * whole folder) with Google's own picker. Nothing about the server changes:
 * the bytes come back as `File` objects and go through exactly the same resize
 * and staged-upload path as a photo chosen from disk, so no Google token ever
 * reaches our backend.
 *
 * The scope is `drive.file`, which grants access only to what the operator
 * actually picked — not to their Drive.
 */

import { useState } from 'react';
import { FolderOpen, Loader2 } from 'lucide-react';

// Read literally, not through `src/config/env`: Next inlines `NEXT_PUBLIC_*`
// at build time only where it can see the full name in the source.
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const PROJECT_NUMBER = process.env.NEXT_PUBLIC_GOOGLE_PROJECT_NUMBER;

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const ACCEPTED = /^image\/(jpeg|png|webp)$/;

/** Configured only when all three values are present — see ENV.md. */
export const drivePickerConfigured = Boolean(
  CLIENT_ID && API_KEY && PROJECT_NUMBER
);

type PickedDoc = {
  id: string;
  name?: string;
  mimeType?: string;
};

type DriveFile = { id: string; name: string; mimeType: string };

/* eslint-disable @typescript-eslint/no-explicit-any -- Google ships no types
   for gapi/picker, and pulling a package in for three call sites is worse. */
declare global {
  interface Window {
    gapi?: any;
    google?: any;
  }
}

const scripts = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const existing = scripts.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const element = document.createElement('script');
    element.src = src;
    element.async = true;
    element.onload = () => resolve();
    element.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(element);
  });

  scripts.set(src, promise);
  return promise;
}

async function loadPicker(): Promise<void> {
  await loadScript('https://apis.google.com/js/api.js');
  await new Promise<void>((resolve, reject) => {
    window.gapi.load('picker', {
      callback: () => resolve(),
      onerror: () => reject(new Error('Could not load the Google Picker')),
    });
  });
}

let cachedToken: { value: string; expiresAt: number } | null = null;

/**
 * A token for the current operator. Kept in memory only — it dies with the
 * tab, and is never sent to our server.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  await loadScript('https://accounts.google.com/gsi/client');

  return new Promise<string>((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (response: any) => {
        if (response.error || !response.access_token) {
          reject(new Error('Google sign-in was cancelled.'));
          return;
        }
        cachedToken = {
          value: response.access_token,
          expiresAt: Date.now() + Number(response.expires_in ?? 3600) * 1000,
        };
        resolve(response.access_token);
      },
    });

    client.requestAccessToken({ prompt: cachedToken ? '' : 'consent' });
  });
}

type PickerResult = { action: string; docs: PickedDoc[] };

function openPicker(token: string): Promise<PickerResult> {
  return new Promise((resolve) => {
    const picker = window.google.picker;

    const view = new picker.DocsView(picker.ViewId.DOCS_IMAGES)
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true);

    const builder = new picker.PickerBuilder()
      .setDeveloperKey(API_KEY)
      // Required for `drive.file`: ties the picked files to this Cloud project,
      // which must be the same one that issued the client ID.
      .setAppId(PROJECT_NUMBER)
      .setOAuthToken(token)
      // Declared rather than inferred. Left to guess, the picker derived a
      // parent of `<origin>/favicon.ico` and addressed its reply there: the
      // dialog opened detached and the selection came back to nothing.
      .setOrigin(window.location.origin)
      .addView(view)
      .enableFeature(picker.Feature.MULTISELECT_ENABLED)
      .setCallback((data: any) => {
        // Logged so a picker that goes quiet leaves evidence behind: without
        // it, "nothing happened" is all anyone can report.
        console.info('[drive-picker] callback', data?.action, data);

        // Every action except "loaded" ends the picker. Waiting only for PICKED
        // and CANCEL left the promise pending on anything else, and a pending
        // promise here is invisible: the button simply did nothing.
        if (data.action && data.action !== 'loaded') {
          resolve({
            action: String(data.action),
            docs: (data.docs ?? []) as PickedDoc[],
          });
        }
      });

    // A folder shared by someone else lives under "Shared with me". The view is
    // added defensively: if this build of the picker does not expose it, the
    // operator can still reach the folder through a shortcut in My Drive.
    try {
      const shared = new picker.DocsView(picker.ViewId.DOCS_IMAGES)
        .setOwnedByMe(false)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(true)
        .setLabel('Shared with me');
      builder.addView(shared);
    } catch {
      // Nothing to do — the default view remains.
    }

    builder.build().setVisible(true);
  });
}

async function driveRequest(url: string, token: string): Promise<any> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Drive answered ${response.status}`);
  }
  return response.json();
}

/** The images directly inside a picked folder. */
async function listFolder(
  folderId: string,
  token: string
): Promise<DriveFile[]> {
  const query = encodeURIComponent(
    `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`
  );
  const data = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?q=${query}` +
      '&fields=files(id,name,mimeType)&pageSize=100&orderBy=name' +
      '&supportsAllDrives=true&includeItemsFromAllDrives=true',
    token
  );
  return (data.files ?? []) as DriveFile[];
}

async function downloadFile(file: DriveFile, token: string): Promise<File> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) {
    throw new Error(`Could not download ${file.name}`);
  }
  const blob = await response.blob();
  return new File([blob], file.name, {
    type: blob.type || file.mimeType,
  });
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';
const SHORTCUT_MIME = 'application/vnd.google-apps.shortcut';

/** Follows a shortcut to the file or folder it points at. */
async function resolveShortcut(
  shortcutId: string,
  token: string
): Promise<DriveFile | null> {
  try {
    const data = await driveRequest(
      `https://www.googleapis.com/drive/v3/files/${shortcutId}` +
        '?fields=id,name,mimeType,shortcutDetails&supportsAllDrives=true',
      token
    );
    const target = data.shortcutDetails;
    if (!target?.targetId) return null;
    return {
      id: target.targetId,
      name: data.name ?? target.targetId,
      mimeType: target.targetMimeType ?? '',
    };
  } catch {
    return null;
  }
}

export function DrivePickerButton({
  onPick,
  max,
  disabled,
  className,
}: {
  onPick: (files: File[]) => void;
  max: number;
  disabled?: boolean;
  className?: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!drivePickerConfigured) return null;

  async function choose() {
    setError(null);
    setBusy('Opening Drive…');

    try {
      const token = await getAccessToken();
      await loadPicker();

      setBusy(null);
      const { action, docs: picked } = await openPicker(token);

      if (action === 'cancel') return;
      if (picked.length === 0) {
        setError(
          action === 'picked'
            ? 'Drive returned nothing for that selection. Open the folder and select the photos inside it.'
            : `The picker closed with "${action}" and no selection.`
        );
        return;
      }

      setBusy('Reading the folder…');
      const wanted: DriveFile[] = [];
      for (const doc of picked) {
        // A folder added to My Drive as a shortcut is picked as a shortcut, not
        // as the folder — following it is what makes "add a shortcut" work.
        if (doc.mimeType === SHORTCUT_MIME) {
          const target = await resolveShortcut(doc.id, token);
          if (target) {
            if (target.mimeType === FOLDER_MIME) {
              wanted.push(...(await listFolder(target.id, token)));
            } else {
              wanted.push(target);
            }
            continue;
          }
        }

        if (doc.mimeType === FOLDER_MIME) {
          // Picking a folder is the fast path when photos are filed one folder
          // per piece. Whether the scope reaches inside is decided by Google,
          // so a refusal is reported as guidance rather than as a failure.
          try {
            wanted.push(...(await listFolder(doc.id, token)));
          } catch {
            throw new Error(
              `Drive would not open "${doc.name ?? 'that folder'}". Open the folder in the picker and select the photos inside it instead.`
            );
          }
        } else {
          wanted.push({
            id: doc.id,
            name: doc.name ?? `${doc.id}.jpg`,
            mimeType: doc.mimeType ?? 'image/jpeg',
          });
        }
      }

      const usable = wanted.filter((file) => ACCEPTED.test(file.mimeType));
      const skipped = wanted.length - usable.length;
      const batch = usable.slice(0, max);

      const files: File[] = [];
      for (let index = 0; index < batch.length; index += 1) {
        setBusy(`Downloading photo ${index + 1} of ${batch.length}…`);
        files.push(await downloadFile(batch[index], token));
      }

      if (files.length === 0) {
        // Naming the types is the difference between "it did nothing" and a
        // problem someone can act on.
        const types = [...new Set(wanted.map((file) => file.mimeType))]
          .filter(Boolean)
          .join(', ');
        setError(
          skipped > 0
            ? `Nothing usable: only JPEG, PNG and WebP work, and Drive reported ${types || 'no type'}. A photo straight off an iPhone is usually HEIC — export it as JPEG first.`
            : 'Drive returned no files for that selection. If you picked a folder, open it and select the photos inside instead.'
        );
        return;
      }

      onPick(files);

      if (skipped > 0) {
        setError(
          `${skipped} file${skipped === 1 ? '' : 's'} skipped — only JPEG, PNG and WebP can be used.`
        );
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not read from Drive.'
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void choose()}
        disabled={disabled || busy !== null}
        className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[rgb(var(--border-strong))] px-4 text-xs font-semibold transition hover:border-[rgb(var(--fg))] disabled:opacity-60"
      >
        {busy ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <FolderOpen aria-hidden="true" className="size-4" />
        )}
        {busy ?? 'Choose from Drive'}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-red-600" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}
