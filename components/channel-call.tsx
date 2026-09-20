'use client';

import type { RefCallback } from 'react';
import { CallView, type CallViewProps } from '@/components/call-view';

const noop = () => {};
const INITIAL_CALL: Omit<CallViewProps, 'localDisplayName' | 'onLeave'> = {
  media: { microphone: null, camera: null }, remoteUsers: [], connectionState: 'CONNECTING', error: null,
  microphones: [], cameras: [], microphoneId: '', cameraId: '', microphoneEnabled: false, cameraEnabled: false,
  onMicrophoneChange: noop, onCameraChange: noop, onMicrophoneToggle: noop, onCameraToggle: noop,
};

export function ChannelCall({ displayName, call, onLeave, invitePath, localPlayerRef, remotePlayerRef }: {
  displayName: string;
  call: CallViewProps | null;
  onLeave: () => void;
  invitePath?: string;
  localPlayerRef?: RefCallback<HTMLDivElement>;
  remotePlayerRef?: RefCallback<HTMLDivElement>;
}) {
  return <CallView localDisplayName={displayName} {...(call ?? INITIAL_CALL)} onLeave={onLeave}
    invitePath={invitePath} localPlayerRef={localPlayerRef} remotePlayerRef={remotePlayerRef} />;
}
