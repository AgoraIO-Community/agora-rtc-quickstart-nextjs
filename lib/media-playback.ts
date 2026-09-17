const INTERRUPTED_BY_NEW_LOAD = 'The play() request was interrupted by a new load request.';

export function isExpectedMediaPlaybackInterruption(reason: unknown): boolean {
  if (!reason || typeof reason !== 'object') return false;

  const { name, message } = reason as { name?: unknown; message?: unknown };
  return name === 'AbortError' &&
    typeof message === 'string' &&
    message.includes(INTERRUPTED_BY_NEW_LOAD);
}
