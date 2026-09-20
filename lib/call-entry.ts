import { isValidChannelName } from '@/lib/channel-name';
import { isValidDisplayName, normalizeDisplayName } from '@/lib/rtc-identity';

export const CALL_ENTRY_SECONDS = 120;
export const callPath = (channel: string) => `/channel/${channel}/call`;
export const entryCookieName = (id: string) => `rtc-entry-${id}`;
export const isEntryId = (id: unknown): id is string => typeof id === 'string' && /^[0-9a-f]{32}$/.test(id);

export function readCallEntry(value: string | undefined, channel: string, now = Date.now()): string | null {
  try {
    const data = JSON.parse(value ?? '') as { channelName?: unknown; displayName?: unknown; expiresAt?: unknown };
    if (!isValidChannelName(channel) || data.channelName !== channel || !isValidDisplayName(data.displayName) ||
        typeof data.expiresAt !== 'number' || !Number.isFinite(data.expiresAt) || data.expiresAt <= now ||
        data.expiresAt > now + CALL_ENTRY_SECONDS * 1000) return null;
    return normalizeDisplayName(data.displayName);
  } catch { return null; }
}
