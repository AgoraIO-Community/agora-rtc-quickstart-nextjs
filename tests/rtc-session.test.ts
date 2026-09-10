import { describe, expect, it, vi } from 'vitest';
import { RtcSession } from '@/lib/rtc-session';
import type { LocalMedia } from '@/lib/media-devices';
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

function setup() {
  const handlers = new Map<string, (...args: never[]) => unknown>();
  const order: string[] = [];
  const client = {
    remoteUsers: [],
    on: vi.fn((event: string, handler: (...args: never[]) => unknown) => {
      order.push(`on:${event}`);
      handlers.set(event, handler);
    }),
    off: vi.fn((event: string) => order.push(`off:${event}`)),
    join: vi.fn(async () => {
      order.push('join');
      return 42;
    }),
    publish: vi.fn(async () => order.push('publish')),
    subscribe: vi.fn(async () => order.push('subscribe')),
    unpublish: vi.fn(async () => order.push('unpublish')),
    renewToken: vi.fn(async () => order.push('renew')),
    leave: vi.fn(async () => order.push('leave')),
  };
  const sdk = { createClient: vi.fn(() => client) };
  const microphone = {
    stop: vi.fn(() => order.push('mic-stop')),
    close: vi.fn(() => order.push('mic-close')),
  };
  const camera = {
    stop: vi.fn(() => order.push('camera-stop')),
    close: vi.fn(() => order.push('camera-close')),
  };
  const onRemoteUsers = vi.fn();
  const onLocalMedia = vi.fn();
  const onConnectionState = vi.fn();
  const onError = vi.fn();
  const renewToken = vi.fn().mockResolvedValue('renewed-token');
  const media = {
    microphone: microphone as unknown as IMicrophoneAudioTrack,
    camera: camera as unknown as ICameraVideoTrack,
    errors: {},
  };
  const createMedia = vi.fn<() => Promise<LocalMedia>>(async () => {
    order.push('create-media');
    return media;
  });

  const session = new RtcSession({
    sdk: sdk as never,
    roomId: '550e8400-e29b-41d4-a716-446655440000',
    appId: 'app-id',
    userAccount: 'rtc1.QWxpY2U.0123456789abcdef',
    token: 'initial-token',
    createMedia,
    renewToken,
    onLocalMedia,
    onRemoteUsers,
    onConnectionState,
    onError,
  });

  return {
    session,
    client: client as unknown as IAgoraRTCClient,
    handlers,
    order,
    microphone,
    camera,
    renewToken,
    createMedia,
    onLocalMedia,
    onRemoteUsers,
    onConnectionState,
    onError,
  };
}

describe('RtcSession', () => {
  it('joins before creating and publishing available local tracks', async () => {
    const { session, client, order, microphone, camera, onLocalMedia } = setup();

    await session.join();

    const joinIndex = order.indexOf('join');
    expect(order.filter((item) => item.startsWith('on:')).length).toBeGreaterThan(0);
    expect(order.findIndex((item) => item.startsWith('on:'))).toBeLessThan(joinIndex);
    expect(client.join).toHaveBeenCalledWith(
      'app-id',
      expect.any(String),
      'initial-token',
      'rtc1.QWxpY2U.0123456789abcdef',
    );
    expect(order.indexOf('join')).toBeLessThan(order.indexOf('create-media'));
    expect(order.indexOf('create-media')).toBeLessThan(order.indexOf('publish'));
    expect(onLocalMedia).toHaveBeenCalled();
    expect(client.publish).toHaveBeenCalledWith([microphone, camera]);
  });

  it('subscribes and plays audio and reports video separately', async () => {
    const { session, client, handlers, onRemoteUsers } = setup();
    await session.join();
    const audioTrack = { play: vi.fn() };
    const videoTrack = { play: vi.fn() };
    const user = { uid: 7, audioTrack, videoTrack } as unknown as IAgoraRTCRemoteUser;

    await handlers.get('user-published')?.(user as never, 'audio' as never);
    await handlers.get('user-published')?.(user as never, 'video' as never);

    expect(client.subscribe).toHaveBeenNthCalledWith(1, user, 'audio');
    expect(client.subscribe).toHaveBeenNthCalledWith(2, user, 'video');
    expect(audioTrack.play).toHaveBeenCalled();
    expect(onRemoteUsers).toHaveBeenCalled();
  });

  it('renews with the same room and user account', async () => {
    const { session, client, handlers, renewToken } = setup();
    await session.join();

    await handlers.get('token-privilege-will-expire')?.();

    expect(renewToken).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000',
      'rtc1.QWxpY2U.0123456789abcdef',
    );
    expect(client.renewToken).toHaveBeenCalledWith('renewed-token');
  });

  it('does not route SDK quality exceptions to the application error UI', async () => {
    const { session, client, onError } = setup();

    await session.join();

    expect(client.on).not.toHaveBeenCalledWith('exception', expect.any(Function));
    expect(onError).not.toHaveBeenCalled();
  });

  it('cleans up once in unpublish, stop/close, leave order', async () => {
    const { session, order } = setup();
    await session.join();

    await Promise.all([session.cleanup(), session.cleanup()]);

    expect(order.filter((item) => item === 'unpublish')).toHaveLength(1);
    expect(order.indexOf('unpublish')).toBeLessThan(order.indexOf('mic-stop'));
    expect(order.indexOf('mic-stop')).toBeLessThan(order.indexOf('mic-close'));
    expect(order.indexOf('camera-stop')).toBeLessThan(order.indexOf('camera-close'));
    expect(order.indexOf('camera-close')).toBeLessThan(order.indexOf('leave'));
  });

  it('leaves the new session when no local media is available', async () => {
    const { session, client, createMedia, order } = setup();
    createMedia.mockResolvedValueOnce({
      microphone: null,
      camera: null,
      errors: {
        microphone: 'Microphone is unavailable.',
        camera: 'Camera is unavailable.',
      },
    });

    await expect(session.join()).rejects.toThrow('No camera or microphone is available.');

    expect(client.publish).not.toHaveBeenCalled();
    expect(order).toContain('leave');
  });
});
