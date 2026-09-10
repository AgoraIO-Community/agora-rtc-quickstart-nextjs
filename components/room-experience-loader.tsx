'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { BrandFooter } from '@/components/brand-footer';

const RoomExperience = dynamic(
  () => import('@/components/room-experience').then((module) => module.RoomExperience),
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
  return <RoomExperience roomId={roomId} />;
}
