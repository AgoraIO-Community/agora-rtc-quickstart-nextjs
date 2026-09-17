'use client';

import dynamic from 'next/dynamic';
import { useRef, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { BrandFooter } from '@/components/brand-footer';
import { MediaPlaybackGuard } from '@/components/media-playback-guard';

const RoomExperience = dynamic(
  async () => {
    const [{ RoomExperience }, { AgoraRTCProvider, default: AgoraRTC }] = await Promise.all([
      import('@/components/room-experience'),
      import('agora-rtc-react'),
    ]);
    function Provider({ children }: { children: ReactNode }) {
      // The client must survive Strict Mode's simulated remount; useMemo recreates it.
      /* eslint-disable react-hooks/refs */
      const client = useRef<ReturnType<typeof AgoraRTC.createClient> | null>(null);
      if (!client.current) client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      const rtcClient = client.current;
      /* eslint-enable react-hooks/refs */
      return <AgoraRTCProvider client={rtcClient}>{children}</AgoraRTCProvider>;
    }
    return { default: ({ roomId }: { roomId: string }) => <Provider><RoomExperience roomId={roomId} /></Provider> };
  },
  {
    ssr: false,
    loading: () => (
      <main className="relative flex min-h-dvh items-center justify-center bg-background px-4 text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading RTC client" />
        <BrandFooter />
      </main>
    ),
  },
);

export function RoomExperienceLoader({ roomId }: { roomId: string }) {
  return (
    <>
      <MediaPlaybackGuard />
      <RoomExperience roomId={roomId} />
    </>
  );
}
