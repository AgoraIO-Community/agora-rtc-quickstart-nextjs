'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { JoinRoom } from '@/components/join-room';
import { RoomCall } from '@/components/room-call';
import { isValidDisplayName, normalizeDisplayName } from '@/lib/rtc-identity';
import { requestRtcToken, type RtcTokenResponse } from '@/lib/token-client';

export function RoomExperience({ roomId }: { roomId: string }) {
  const [displayName, setDisplayName] = useState('');
  const [credentials, setCredentials] = useState<RtcTokenResponse | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current?.abort();
    };
  }, []);

  const join = async () => {
    if (joining || credentials || !isValidDisplayName(displayName)) return;
    const name = normalizeDisplayName(displayName);
    const controller = new AbortController();
    request.current = controller;
    setDisplayName(name);
    setJoining(true);
    setError(null);
    try {
      const result = await requestRtcToken(roomId, { displayName: name }, fetch, controller.signal);
      if (mounted.current && !controller.signal.aborted) setCredentials(result);
    } catch (nextError) {
      if (mounted.current && !controller.signal.aborted) {
        setError(nextError instanceof Error ? nextError.message : 'Unable to join the room.');
      }
    } finally {
      if (request.current === controller) request.current = null;
      if (mounted.current && !controller.signal.aborted) setJoining(false);
    }
  };

  const leave = useCallback((nextError?: string) => {
    setCredentials(null);
    setJoining(false);
    setError(nextError ?? null);
  }, []);

  const cancel = () => {
    request.current?.abort();
    request.current = null;
    setJoining(false);
  };

  return credentials ? (
    <RoomCall
      key={credentials.userAccount}
      credentials={credentials}
      displayName={displayName}
      onLeave={leave}
    />
  ) : (
    <JoinRoom
      displayName={displayName}
      joining={joining}
      error={error}
      onDisplayNameChange={setDisplayName}
      onJoin={() => void join()}
      onCancel={joining ? cancel : undefined}
    />
  );
}
