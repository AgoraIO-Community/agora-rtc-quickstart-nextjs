import { describe, expect, it } from 'vitest';
import { createRoomId, isValidRoomId } from '@/lib/room-id';

describe('room identifiers', () => {
  it('creates canonical lowercase UUID room IDs', () => {
    const roomId = createRoomId();
    expect(isValidRoomId(roomId)).toBe(true);
    expect(roomId).toBe(roomId.toLowerCase());
  });

  it('rejects malformed or uppercase room IDs', () => {
    expect(isValidRoomId('not-a-room')).toBe(false);
    expect(isValidRoomId('550E8400-E29B-41D4-A716-446655440000')).toBe(false);
  });
});
