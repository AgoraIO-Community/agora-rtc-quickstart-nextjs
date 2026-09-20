import { isValidDisplayName } from '@/lib/rtc-identity';

const key = (channel: string) => `rtc-return:${channel}`;
export function saveCallReturn(channel: string, displayName: string, error?: string) {
  try { sessionStorage.setItem(key(channel), JSON.stringify({ displayName, error })); } catch { /* Storage is optional. */ }
}
export function takeCallReturn(channel: string): { displayName: string; error?: string } | null {
  try {
    const value = sessionStorage.getItem(key(channel));
    sessionStorage.removeItem(key(channel));
    const data = JSON.parse(value ?? 'null');
    return data && isValidDisplayName(data.displayName)
      ? { displayName: data.displayName, error: typeof data.error === 'string' ? data.error : undefined } : null;
  } catch { return null; }
}
