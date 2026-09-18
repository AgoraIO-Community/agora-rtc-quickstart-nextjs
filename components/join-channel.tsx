'use client';

import { Loader2, PhoneCall, UserRound } from 'lucide-react';
import { BrandFooter } from '@/components/brand-footer';
import { InviteButton } from '@/components/invite-button';
import { Button } from '@/components/ui/button';
import { isValidDisplayName } from '@/lib/rtc-identity';

type JoinChannelProps = {
  displayName: string;
  joining: boolean;
  error: string | null;
  onDisplayNameChange: (value: string) => void;
  onJoin: () => void;
  onCancel?: () => void;
};

export function JoinChannel({
  displayName,
  joining,
  error,
  onDisplayNameChange,
  onJoin,
  onCancel,
}: JoinChannelProps) {
  const canJoin = isValidDisplayName(displayName) && !joining;

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-16 text-foreground">
      <section className="dark-panel w-full max-w-md animate-fade-up rounded-[20px] p-6 text-white md:p-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <UserRound className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-2xl font-medium">Join the call</h1>
        <p className="mt-2 text-sm text-[#858c99]">Enter the name other participants will see.</p>

        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (canJoin) onJoin();
          }}
        >
          <label htmlFor="participant-name" className="text-sm font-medium text-[#d8dbe2]">
            Your name
          </label>
          <input
            id="participant-name"
            name="participant-name"
            type="text"
            autoComplete="name"
            maxLength={32}
            value={displayName}
            disabled={joining}
            onChange={(event) => onDisplayNameChange(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-[#454545] bg-[#151515] px-3 text-sm text-white outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
          />

          {error && <p className="mt-3 text-xs text-destructive" role="alert">{error}</p>}

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <InviteButton className="w-full" />
            <Button type="submit" className="w-full" disabled={!canJoin}>
              {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
              {joining ? 'Joining...' : 'Join Call'}
            </Button>
          </div>
          {joining && onCancel && (
            <Button type="button" variant="secondary" className="mt-3 w-full" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </form>
      </section>
      <BrandFooter />
    </main>
  );
}
