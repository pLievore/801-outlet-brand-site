import 'server-only';
import fs from 'fs';
import path from 'path';
import type {
  LeadCart,
  LeadProductView,
  LeadRecord,
  LeadStatus,
  LeadSyncPayload,
} from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

type RedisConfig = { url: string; token: string };

function redisConfig(): RedisConfig | null {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '';
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? '';
  if (!url || !token) return null;
  return { url, token };
}

async function redisCommand<T>(command: unknown[]): Promise<T | null> {
  const config = redisConfig();
  if (!config) return null;

  try {
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

    if (!response.ok) return null;
    const payload = (await response.json()) as { result: T };
    return payload.result;
  } catch {
    return null;
  }
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Read-only filesystem in some serverless environments
  }
}

function readFileLeads(): LeadRecord[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(LEADS_FILE)) return [];
    const content = fs.readFileSync(LEADS_FILE, 'utf8');
    return JSON.parse(content) as LeadRecord[];
  } catch {
    return [];
  }
}

function writeFileLeads(leads: LeadRecord[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
  } catch {
    // Best-effort for read-only environments
  }
}

function normalizeContact(contact: string): string {
  const clean = contact.trim();
  if (clean.includes('@')) return clean.toLowerCase();
  // Standardize phone
  return clean.replace(/[^\d+]/g, '');
}

function generateLeadId(contact: string): string {
  const normalized = normalizeContact(contact);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return `lead_${Math.abs(hash)}`;
}

export async function getLeads(): Promise<LeadRecord[]> {
  const redis = redisConfig();
  if (redis) {
    try {
      const keys = await redisCommand<string[]>(['KEYS', 'lead:*']);
      if (keys && keys.length > 0) {
        const pipeline = keys.map((key) => ['GET', key]);
        const response = await fetch(`${redis.url}/pipeline`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${redis.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pipeline),
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          const results = (await response.json()) as Array<{
            result: string | null;
          }>;
          const leads: LeadRecord[] = [];
          for (const item of results) {
            if (item?.result) {
              try {
                leads.push(JSON.parse(item.result) as LeadRecord);
              } catch {}
            }
          }
          if (leads.length > 0) {
            return leads.sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
          }
        }
      }
    } catch {}
  }

  // Fallback to file storage
  const fileLeads = readFileLeads();
  return fileLeads.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function saveOrUpdateLead(
  payload: LeadSyncPayload
): Promise<LeadRecord> {
  const contact = normalizeContact(payload.contact);
  const id = generateLeadId(contact);
  const now = new Date().toISOString();

  const allLeads = await getLeads();
  const existing = allLeads.find((l) => l.id === id || l.contact === contact);

  // Merge product views
  const viewsMap = new Map<string, LeadProductView>();
  if (existing?.views) {
    for (const v of existing.views) {
      viewsMap.set(v.handle, { ...v });
    }
  }

  if (payload.views) {
    for (const incoming of payload.views) {
      const current = viewsMap.get(incoming.handle);
      if (current) {
        current.viewCount = Math.max(
          current.viewCount,
          incoming.viewCount ?? 1
        );
        current.lastViewedAt = incoming.lastViewedAt ?? now;
        if (incoming.image && !current.image) current.image = incoming.image;
        if (incoming.price && !current.price) current.price = incoming.price;
      } else {
        viewsMap.set(incoming.handle, {
          handle: incoming.handle,
          title: incoming.title,
          image: incoming.image ?? null,
          price: incoming.price ?? null,
          viewCount: incoming.viewCount ?? 1,
          firstViewedAt: incoming.firstViewedAt ?? now,
          lastViewedAt: incoming.lastViewedAt ?? now,
        });
      }
    }
  }

  const views = Array.from(viewsMap.values()).sort(
    (a, b) => b.viewCount - a.viewCount
  );

  const totalViews = views.reduce((acc, v) => acc + v.viewCount, 0);
  const topProduct = views.length > 0 ? views[0] : null;

  // Merge cart if provided
  let cart: LeadCart | null = existing?.cart ?? null;
  if (payload.cart) {
    cart = { ...payload.cart };
  }

  const record: LeadRecord = {
    id,
    contact,
    channel: payload.channel,
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
    status: existing ? existing.status : 'new',
    topProduct,
    totalViews,
    views,
    cart,
    notes: existing?.notes,
  };

  // Persist to Redis if available
  const redis = redisConfig();
  if (redis) {
    try {
      await redisCommand(['SET', `lead:${id}`, JSON.stringify(record)]);
    } catch {}
  }

  // Persist to File
  const fileLeads = readFileLeads();
  const index = fileLeads.findIndex((l) => l.id === id);
  if (index >= 0) {
    fileLeads[index] = record;
  } else {
    fileLeads.unshift(record);
  }
  writeFileLeads(fileLeads);

  return record;
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  note?: string
): Promise<LeadRecord | null> {
  const allLeads = await getLeads();
  const target = allLeads.find((l) => l.id === id);
  if (!target) return null;

  target.status = status;
  target.updatedAt = new Date().toISOString();
  if (typeof note === 'string') {
    target.notes = note;
  }

  const redis = redisConfig();
  if (redis) {
    try {
      await redisCommand(['SET', `lead:${id}`, JSON.stringify(target)]);
    } catch {}
  }

  const fileLeads = readFileLeads();
  const index = fileLeads.findIndex((l) => l.id === id);
  if (index >= 0) {
    fileLeads[index] = target;
    writeFileLeads(fileLeads);
  }

  return target;
}

export async function deleteLead(id: string): Promise<boolean> {
  const redis = redisConfig();
  if (redis) {
    try {
      await redisCommand(['DEL', `lead:${id}`]);
    } catch {}
  }

  const fileLeads = readFileLeads();
  const filtered = fileLeads.filter((l) => l.id !== id);
  writeFileLeads(filtered);
  return true;
}
