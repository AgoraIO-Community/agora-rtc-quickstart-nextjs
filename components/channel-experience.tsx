'use client';

import { useEffect, useRef, useState } from 'react';
import { JoinChannel } from '@/components/join-channel';
import { isValidDisplayName, normalizeDisplayName } from '@/lib/rtc-identity';
import { takeCallReturn } from '@/lib/call-return';

export function ChannelExperience({ channelName }: { channelName: string }) {
  const [displayName, setDisplayName] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    const returned = takeCallReturn(channelName);
    if (returned) {
      // Restore a one-use handoff only after hydration; the initial form stays SSR-stable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(returned.displayName);
      setError(returned.error ?? null);
    }
    const restored = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      request.current?.abort();
      request.current = null;
      setJoining(false);
    };
    window.addEventListener('pageshow', restored);
    return () => {
      request.current?.abort();
      request.current = null;
      window.removeEventListener('pageshow', restored);
    };
  }, [channelName]);

  const join = async () => {
    if (request.current || !isValidDisplayName(displayName)) return;
    const controller = new AbortController();
    request.current = controller;
    setJoining(true);
    setError(null);
    try {
      const response = await fetch('/api/call-entry', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ channelName, displayName: normalizeDisplayName(displayName) }),
        signal: controller.signal, cache: 'no-store',
      });
      if (!response.ok) throw new Error('Unable to open the call. Please try again.');
      const result = await response.json();
      if (!controller.signal.aborted && request.current === controller) window.location.assign(result.url);
    } catch (nextError) {
      if (!controller.signal.aborted && request.current === controller) {
        setError(nextError instanceof Error ? nextError.message : 'Unable to open the call.');
        request.current = null;
        setJoining(false);
      }
    }
  };
  const cancel = () => { request.current?.abort(); request.current = null; setJoining(false); };

  return <JoinChannel displayName={displayName} joining={joining} error={error}
    onDisplayNameChange={setDisplayName} onJoin={() => void join()} onCancel={joining ? cancel : undefined} />;
}
