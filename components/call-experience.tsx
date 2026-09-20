'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChannelCall } from '@/components/channel-call';
import type { CallViewProps } from '@/components/call-view';
import { AgoraRuntimeLoader } from '@/components/agora-runtime-loader';
import { saveCallReturn } from '@/lib/call-return';
import { requestRtcToken, type RtcTokenResponse } from '@/lib/token-client';

export function CallExperience({ channelName, displayName }: { channelName: string; displayName: string }) {
  const router = useRouter();
  const [credentials, setCredentials] = useState<RtcTokenResponse | null>(null);
  const [call, setCall] = useState<CallViewProps | null>(null);
  const [localTarget, setLocalTarget] = useState<HTMLDivElement | null>(null);
  const [remoteTarget, setRemoteTarget] = useState<HTMLDivElement | null>(null);
  const request = useRef<AbortController | null>(null);
  const account = useRef<string | null>(null);
  const exited = useRef(false);
  const joinPath = `/channel/${channelName}`;

  const leave = useCallback((error?: string) => {
    if (exited.current) return;
    exited.current = true;
    request.current?.abort();
    account.current = null;
    setCredentials(null);
    setCall(null);
    saveCallReturn(channelName, displayName, error);
    router.replace(joinPath);
  }, [channelName, displayName, joinPath, router]);

  useEffect(() => {
    const controller = new AbortController();
    request.current = controller;
    // Strict Mode's replay cancels this task before it can issue a token request.
    const timer = setTimeout(() => {
      if (exited.current) return;
      void requestRtcToken(channelName, { displayName }, fetch, controller.signal).then(result => {
        if (!controller.signal.aborted && !exited.current) { account.current = result.userAccount; setCredentials(result); }
      }).catch(() => {
        if (!controller.signal.aborted && !exited.current) leave('Unable to join the channel. Please try again.');
      });
    }, 0);
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) { exited.current = true; controller.abort(); window.location.replace(joinPath); }
    };
    window.addEventListener('pageshow', restored);
    return () => { clearTimeout(timer); controller.abort(); account.current = null; window.removeEventListener('pageshow', restored); };
  }, [channelName, displayName, joinPath, leave]);

  const update = useCallback((id: string, next: CallViewProps) => {
    if (!exited.current && account.current === id) setCall(next);
  }, []);
  const runtimeLeave = useCallback((id: string, error?: string) => {
    if (!exited.current && account.current === id) leave(error);
  }, [leave]);

  return <>
    <ChannelCall displayName={displayName} call={call} onLeave={() => leave()}
      invitePath={joinPath} localPlayerRef={setLocalTarget} remotePlayerRef={setRemoteTarget} />
    <AgoraRuntimeLoader credentials={credentials} displayName={displayName} localTarget={localTarget}
      remoteTarget={remoteTarget} onUpdate={update} onLeave={runtimeLeave} onError={leave} />
  </>;
}
