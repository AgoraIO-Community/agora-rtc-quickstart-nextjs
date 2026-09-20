'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { JoinChannel } from '@/components/join-channel';
import { ChannelCall } from '@/components/channel-call';
import type { CallViewProps } from '@/components/call-view';
import { AgoraRuntimeLoader } from '@/components/agora-runtime-loader';
import { isValidDisplayName, normalizeDisplayName } from '@/lib/rtc-identity';
import { requestRtcToken, type RtcTokenResponse } from '@/lib/token-client';

export function ChannelExperience({ channelName }: { channelName: string }) {
  const [displayName, setDisplayName] = useState('');
  const [credentials, setCredentials] = useState<RtcTokenResponse | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const currentAccount = useRef<string | null>(null);
  const [call, setCall] = useState<CallViewProps | null>(null);
  const [localTarget, setLocalTarget] = useState<HTMLDivElement | null>(null);
  const [remoteTarget, setRemoteTarget] = useState<HTMLDivElement | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      currentAccount.current = null;
      request.current?.abort();
    };
  }, []);

  const join = async () => {
    if (joining || credentials || !isValidDisplayName(displayName)) return;
    if (runtimeError) { setError(runtimeError); return; }
    const name = normalizeDisplayName(displayName);
    const controller = new AbortController();
    request.current = controller;
    setDisplayName(name);
    setJoining(true);
    setError(null);
    try {
      const result = await requestRtcToken(channelName, { displayName: name }, fetch, controller.signal);
      if (mounted.current && !controller.signal.aborted) {
        currentAccount.current = result.userAccount;
        setCredentials(result);
      }
    } catch (nextError) {
      if (mounted.current && !controller.signal.aborted) {
        setError(nextError instanceof Error ? nextError.message : 'Unable to join the channel.');
      }
    } finally {
      if (request.current === controller) request.current = null;
      if (mounted.current && !controller.signal.aborted) setJoining(false);
    }
  };

  const leave = useCallback((nextError?: string) => {
    currentAccount.current = null;
    setCall(null);
    setCredentials(null);
    setJoining(false);
    setError(nextError ?? null);
  }, []);

  const cancel = () => {
    request.current?.abort();
    request.current = null;
    setJoining(false);
  };

  const updateCall = useCallback((account: string, nextCall: CallViewProps) => {
    if (mounted.current && currentAccount.current === account) setCall(nextCall);
  }, []);

  const runtimeLeave = useCallback((account: string, message?: string) => {
    if (mounted.current && currentAccount.current === account) leave(message);
  }, [leave]);

  const runtimeFailed = useCallback((message: string) => {
    request.current?.abort();
    request.current = null;
    setRuntimeError(message);
    leave(message);
  }, [leave]);

  return (
    <>
      {credentials ? (
        <ChannelCall
          key={credentials.userAccount}
          displayName={displayName}
          call={call}
          onLeave={() => leave()}
          localPlayerRef={setLocalTarget}
          remotePlayerRef={setRemoteTarget}
        />
      ) : (
        <JoinChannel
          displayName={displayName}
          joining={joining}
          error={error}
          onDisplayNameChange={setDisplayName}
          onJoin={() => void join()}
          onCancel={joining ? cancel : undefined}
        />
      )}
      <AgoraRuntimeLoader
        credentials={credentials}
        displayName={displayName}
        localTarget={localTarget}
        remoteTarget={remoteTarget}
        onUpdate={updateCall}
        onLeave={runtimeLeave}
        onError={runtimeFailed}
      />
    </>
  );
}
