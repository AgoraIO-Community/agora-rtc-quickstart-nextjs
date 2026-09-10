import { describe, expect, it, vi } from 'vitest';
import { requestRtcToken } from '@/lib/token-client';

const ROOM_ID = '550e8400-e29b-41d4-a716-446655440000';
const USER_ACCOUNT = 'rtc1.QWxpY2U.0123456789abcdef';

describe('RTC token client', () => {
  it('requests an initial token with a display name', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        appId: 'app-id',
        roomId: ROOM_ID,
        userAccount: USER_ACCOUNT,
        token: 'token',
        expiresIn: 3600,
      }),
    });

    await requestRtcToken(ROOM_ID, { displayName: 'Alice' }, fetcher as never);

    expect(fetcher).toHaveBeenCalledWith('/api/token', expect.objectContaining({
      body: JSON.stringify({ roomId: ROOM_ID, displayName: 'Alice' }),
    }));
  });

  it('requests renewal with the same user account', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        appId: 'app-id',
        roomId: ROOM_ID,
        userAccount: USER_ACCOUNT,
        token: 'renewed-token',
        expiresIn: 3600,
      }),
    });

    await requestRtcToken(ROOM_ID, { userAccount: USER_ACCOUNT }, fetcher as never);

    expect(fetcher).toHaveBeenCalledWith('/api/token', expect.objectContaining({
      body: JSON.stringify({ roomId: ROOM_ID, userAccount: USER_ACCOUNT }),
    }));
  });
});
