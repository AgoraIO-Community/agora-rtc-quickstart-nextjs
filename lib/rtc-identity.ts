const ACCOUNT_PREFIX = 'rtc1';
const DISPLAY_NAME_MAX_CHARACTERS = 32;
const ACCOUNT_PATTERN = /^rtc1\.([A-Za-z0-9_-]+)\.([0-9a-f]{16})$/;

export function normalizeDisplayName(value: string): string {
  return value.trim();
}

export function isValidDisplayName(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const normalized = normalizeDisplayName(value);
  return (
    normalized.length > 0 &&
    Array.from(normalized).length <= DISPLAY_NAME_MAX_CHARACTERS
  );
}

export function createRtcUserAccount(displayName: string): string {
  const normalized = normalizeDisplayName(displayName);
  if (!isValidDisplayName(normalized)) {
    throw new Error('Display name must contain 1 to 32 characters.');
  }

  const randomBytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(randomBytes);
  const suffix = Array.from(randomBytes, (value) => value.toString(16).padStart(2, '0')).join('');

  return `${ACCOUNT_PREFIX}.${encodeBase64Url(normalized)}.${suffix}`;
}

export function isValidRtcUserAccount(value: unknown): value is string {
  return typeof value === 'string' && getDisplayNameFromRtcUserAccount(value) !== null;
}

export function getDisplayNameFromRtcUserAccount(value: string | number): string | null {
  if (typeof value !== 'string') return null;
  const match = ACCOUNT_PATTERN.exec(value);
  if (!match) return null;

  try {
    const displayName = decodeBase64Url(match[1]);
    return isValidDisplayName(displayName) && normalizeDisplayName(displayName) === displayName
      ? displayName
      : null;
  } catch {
    return null;
  }
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function decodeBase64Url(value: string): string {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
