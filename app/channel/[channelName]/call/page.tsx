import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { CallExperience } from '@/components/call-experience';
import { entryCookieName, isEntryId, readCallEntry } from '@/lib/call-entry';
import { isValidChannelName } from '@/lib/channel-name';

export const dynamic = 'force-dynamic';

export default async function CallPage({ params, searchParams }: {
  params: Promise<{ channelName: string }>;
  searchParams: Promise<{ entry?: string | string[] }>;
}) {
  const { channelName } = await params;
  if (!isValidChannelName(channelName)) notFound();
  const { entry } = await searchParams;
  const name = isEntryId(entry) ? readCallEntry((await cookies()).get(entryCookieName(entry))?.value, channelName) : null;
  if (!name) redirect(`/channel/${channelName}`);
  return <CallExperience channelName={channelName} displayName={name} />;
}
