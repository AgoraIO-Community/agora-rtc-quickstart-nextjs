import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { RoomExperience } from '@/components/room-experience';
import { createLocalMedia } from '@/lib/media-devices';

vi.mock('agora-rtc-sdk-ng', () => ({ default: {} }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { priority: _priority, ...imageProps } = props;
    void _priority;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...imageProps} alt={String(props.alt ?? '')} />;
  },
}));

vi.mock('@/lib/media-devices', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/media-devices')>();
  return { ...original, createLocalMedia: vi.fn() };
});

vi.mock('@/lib/token-client', () => ({
  requestRtcToken: vi.fn(),
}));

afterEach(() => cleanup());

describe('RoomExperience', () => {
  it('does not request camera or microphone access before Join Call', () => {
    render(<RoomExperience roomId="550e8400-e29b-41d4-a716-446655440000" />);

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(createLocalMedia).not.toHaveBeenCalled();
  });

});
