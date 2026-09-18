'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Video } from 'lucide-react';
import { createChannelName } from '@/lib/channel-name';
import { BrandFooter } from '@/components/brand-footer';
import { Button } from '@/components/ui/button';

export function ChannelHome() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const createChannel = () => {
    setCreating(true);
    router.push(`/channel/${createChannelName()}`);
  };

  return (
    <main className="relative flex h-dvh min-h-screen items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <section className="dark-panel flex w-[min(92vw,26.25rem)] animate-fade-up flex-col items-center rounded-[20px] px-10 py-10 text-center">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#343434] bg-[#1b1b1b] text-primary">
          <Video className="h-5 w-5" />
        </div>
        <h1 className="text-[28px] font-medium leading-[1.2] text-white">Start a Video Call</h1>
        <p className="mt-[14px] text-sm font-medium leading-6 text-[#777e8d]">
          Create a private channel link and invite another participant.
        </p>
        <Button className="mt-10 w-full" onClick={createChannel} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
          {creating ? 'Creating...' : 'Create Channel'}
        </Button>
      </section>
      <BrandFooter />
    </main>
  );
}
