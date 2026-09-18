import { notFound } from 'next/navigation';
import { ChannelExperienceLoader } from '@/components/channel-experience-loader';
import { isValidChannelName } from '@/lib/channel-name';

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ channelName: string }>;
}) {
  const { channelName } = await params;
  if (!isValidChannelName(channelName)) notFound();

  return <ChannelExperienceLoader channelName={channelName} />;
}
