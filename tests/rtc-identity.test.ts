import { describe, expect, it } from 'vitest';
import {
  createRtcUserAccount,
  getDisplayNameFromRtcUserAccount,
  isValidDisplayName,
  isValidRtcUserAccount,
  normalizeDisplayName,
} from '@/lib/rtc-identity';

describe('RTC participant identity', () => {
  it('normalizes and validates user-entered display names', () => {
    expect(normalizeDisplayName('  Alice  ')).toBe('Alice');
    expect(isValidDisplayName('Alice')).toBe(true);
    expect(isValidDisplayName('王小明')).toBe(true);
    expect(isValidDisplayName('   ')).toBe(false);
    expect(isValidDisplayName('a'.repeat(33))).toBe(false);
  });

  it('creates unique ASCII accounts that preserve the display name', () => {
    const first = createRtcUserAccount('王小明');
    const second = createRtcUserAccount('王小明');

    expect(first).not.toBe(second);
    expect(first).toMatch(/^[\x20-\x7e]+$/);
    expect(isValidRtcUserAccount(first)).toBe(true);
    expect(getDisplayNameFromRtcUserAccount(first)).toBe('王小明');
  });

  it('rejects malformed accounts instead of exposing their raw value as a name', () => {
    expect(isValidRtcUserAccount('王小明')).toBe(false);
    expect(getDisplayNameFromRtcUserAccount('participant-42')).toBeNull();
  });
});
