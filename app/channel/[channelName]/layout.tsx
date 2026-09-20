import type { ReactNode } from 'react';
import { MediaPlaybackGuard } from '@/components/media-playback-guard';

export default function ChannelLayout({ children }: { children: ReactNode }) {
  return <><MediaPlaybackGuard />{children}</>;
}
