import { notFound } from 'next/navigation';
import { RoomExperienceLoader } from '@/components/room-experience-loader';
import { isValidRoomId } from '@/lib/room-id';

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  if (!isValidRoomId(roomId)) notFound();

  return <RoomExperienceLoader roomId={roomId} />;
}
