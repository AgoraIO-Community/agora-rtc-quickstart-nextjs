import { ChannelExperience } from '@/components/channel-experience';

export function ChannelExperienceLoader({ channelName }: { channelName: string }) {
  return <ChannelExperience channelName={channelName} />;
}
