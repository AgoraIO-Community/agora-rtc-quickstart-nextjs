const CHANNEL_NAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export function createChannelName(): string {
  return globalThis.crypto.randomUUID();
}

export function isValidChannelName(value: unknown): value is string {
  return typeof value === 'string' && CHANNEL_NAME_PATTERN.test(value);
}
