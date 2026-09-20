'use client';

import { ChannelExperience } from '@/components/channel-experience';
import { MediaPlaybackGuard } from '@/components/media-playback-guard';

export function ChannelExperienceLoader({ channelName }: { channelName: string }) {
  return (
    <>
      <MediaPlaybackGuard />
      <ChannelExperience channelName={channelName} />
    </>
  );
}
