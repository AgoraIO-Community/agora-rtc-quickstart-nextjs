'use client';

import Image from 'next/image';
import type {
  ConnectionState,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';
import type { LocalMedia } from '@/lib/media-devices';
import { getDisplayNameFromRtcUserAccount } from '@/lib/rtc-identity';
import { Button } from '@/components/ui/button';
import { CallControls } from '@/components/call-controls';
import { ConnectionStatus } from '@/components/connection-status';
import { InviteButton } from '@/components/invite-button';
import { VideoTile } from '@/components/video-tile';

type CallViewProps = {
  localDisplayName: string;
  media: LocalMedia;
  remoteUsers: IAgoraRTCRemoteUser[];
  connectionState: ConnectionState;
  error: string | null;
  microphones: MediaDeviceInfo[];
  cameras: MediaDeviceInfo[];
  microphoneId: string;
  cameraId: string;
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
  onMicrophoneChange: (deviceId: string) => void;
  onCameraChange: (deviceId: string) => void;
  onMicrophoneToggle: () => void;
  onCameraToggle: () => void;
  onLeave: () => void;
};

export function CallView({
  localDisplayName,
  media,
  remoteUsers,
  connectionState,
  error,
  microphones,
  cameras,
  microphoneId,
  cameraId,
  microphoneEnabled,
  cameraEnabled,
  onMicrophoneChange,
  onCameraChange,
  onMicrophoneToggle,
  onCameraToggle,
  onLeave,
}: CallViewProps) {
  const remoteUser = remoteUsers[0] ?? null;
  const remoteDisplayName = remoteUser
    ? getDisplayNameFromRtcUserAccount(remoteUser.uid) ?? `Participant ${remoteUser.uid}`
    : 'Guest';

  return (
    <main className="flex h-dvh min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 md:h-[76px] md:px-6 md:py-0">
        <div className="flex min-w-0 items-center gap-3">
          <Image src="/agora-logo-mark.svg" alt="Agora" width={40} height={40} className="h-10 w-10 shrink-0" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold md:text-lg">Agora Video Calling</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {remoteUser ? '2 participants' : 'Waiting for another participant'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <ConnectionStatus state={connectionState} />
          <Button variant="destructive" className="hidden h-8 px-3 text-xs sm:inline-flex" onClick={onLeave}>
            Leave Call
          </Button>
        </div>
      </header>

      {error && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-xs text-destructive" role="alert">
          {error}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col p-3 md:p-5">
        <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2 md:gap-4">
          <VideoTile label={`You · ${localDisplayName}`} localTrack={media.camera} videoEnabled={cameraEnabled} waitingMessage="Your camera is off" />
          <VideoTile
            label={remoteDisplayName}
            remoteUser={remoteUser}
            videoEnabled={Boolean(remoteUser?.videoTrack)}
            waitingMessage="Waiting for another participant"
            waitingAction={remoteUser ? null : <InviteButton label="Invite participant" />}
          />
        </div>

        <div className="shrink-0 pb-2 pt-4">
          <CallControls
            microphones={microphones}
            cameras={cameras}
            microphoneId={microphoneId}
            cameraId={cameraId}
            microphoneEnabled={microphoneEnabled}
            cameraEnabled={cameraEnabled}
            microphoneAvailable={Boolean(media.microphone)}
            cameraAvailable={Boolean(media.camera)}
            onMicrophoneChange={onMicrophoneChange}
            onCameraChange={onCameraChange}
            onMicrophoneToggle={onMicrophoneToggle}
            onCameraToggle={onCameraToggle}
            onLeave={onLeave}
          />
        </div>
      </div>
    </main>
  );
}
