'use client';

import type { RefCallback } from 'react';
import { CallView, type CallViewProps } from '@/components/call-view';
import { JoinChannel } from '@/components/join-channel';

export function ChannelCall({ displayName, call, onLeave, localPlayerRef, remotePlayerRef }: {
  displayName: string;
  call: CallViewProps | null;
  onLeave: () => void;
  localPlayerRef?: RefCallback<HTMLDivElement>;
  remotePlayerRef?: RefCallback<HTMLDivElement>;
}) {
  if (!call?.media.microphone && !call?.media.camera) {
    return <JoinChannel displayName={displayName} joining error={null} onDisplayNameChange={() => {}} onJoin={() => {}} onCancel={onLeave} />;
  }

  return <CallView {...call} onLeave={onLeave} localPlayerRef={localPlayerRef} remotePlayerRef={remotePlayerRef} />;
}
