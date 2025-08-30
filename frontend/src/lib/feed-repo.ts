// Client-side mock repository for feed-related data.
// Later, replace implementations with real backend API calls.

export type MonsterFeed = Record<string, { fed: number }>;

export interface ThingRecord {
  thingId?: string;
  thingType?: string;
  didForget?: boolean;
  [key: string]: unknown;
}

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

const STORAGE_KEYS = {
  feedInventory: 'feedInventory',
  monsterFeed: 'monsterFeed',
  thingsRecords: 'thingsRecords',
  dailyFeedClaimedAt: 'dailyFeedClaimedAt',
} as const;

export async function getFeedInventory(): Promise<number> {
  if (!isBrowser()) return 0;
  const raw = localStorage.getItem(STORAGE_KEYS.feedInventory);
  return Number.parseInt(raw || '0');
}

export async function setFeedInventory(value: number): Promise<void> {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.feedInventory, value.toString());
}

export async function getMonsterFeed(): Promise<MonsterFeed> {
  if (!isBrowser()) return {};
  const raw = localStorage.getItem(STORAGE_KEYS.monsterFeed);
  try {
    return raw ? (JSON.parse(raw) as MonsterFeed) : {};
  } catch {
    return {};
  }
}

export async function setMonsterFeed(feed: MonsterFeed): Promise<void> {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.monsterFeed, JSON.stringify(feed));
}

export async function getThingsRecords<T = ThingRecord>(): Promise<T[]> {
  if (!isBrowser()) return [] as T[];
  const raw = localStorage.getItem(STORAGE_KEYS.thingsRecords);
  try {
    return raw ? (JSON.parse(raw) as T[]) : ([] as T[]);
  } catch {
    return [] as T[];
  }
}

export async function setThingsRecords<T = ThingRecord>(records: T[]): Promise<void> {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.thingsRecords, JSON.stringify(records));
}

export async function getDailyFeedClaimedAt(): Promise<string | null> {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEYS.dailyFeedClaimedAt);
}

export async function setDailyFeedClaimedAt(isoDate: string): Promise<void> {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.dailyFeedClaimedAt, isoDate);
}

export function getTodayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface AggregatedMonster {
  thingId: string;
  thingType: string;
  encounterCount: number;
}

export function aggregateMonstersFromThings(records: ThingRecord[]): AggregatedMonster[] {
  const forgetRecords = (records || []).filter(r => r && (r as ThingRecord).didForget === true);
  const map = new Map<string, AggregatedMonster>();
  for (const r of forgetRecords) {
    const thingId = (r.thingId as string) || '';
    if (!thingId || thingId === 'none') continue;
    if (!map.has(thingId)) {
      map.set(thingId, {
        thingId,
        thingType: (r.thingType as string) || '',
        encounterCount: 0,
      });
    }
    const m = map.get(thingId)!;
    m.encounterCount += 1;
  }
  return Array.from(map.values());
}


