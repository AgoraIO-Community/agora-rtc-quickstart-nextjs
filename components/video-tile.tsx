'use client';

import type { ReactNode } from 'react';
import {
  LocalVideoTrack,
  RemoteVideoTrack,
  type ICameraVideoTrack,
  type IAgoraRTCRemoteUser,
  type VideoPlayerConfig,
} from 'agora-rtc-react';
import { CameraOff, UserRound } from 'lucide-react';

const LOCAL_VIDEO_PLAYER_CONFIG = { fit: 'cover', mirror: true } satisfies VideoPlayerConfig;
const REMOTE_VIDEO_PLAYER_CONFIG = { fit: 'cover' } satisfies VideoPlayerConfig;

type VideoTileProps = {
  label: string;
  localTrack?: ICameraVideoTrack | null;
  remoteUser?: IAgoraRTCRemoteUser | null;
  videoEnabled?: boolean;
  waitingMessage?: string;
  waitingAction?: ReactNode;
};

export function VideoTile({
  label,
  localTrack,
  remoteUser,
  videoEnabled = true,
  waitingMessage,
  waitingAction,
}: VideoTileProps) {
  const videoTrack = localTrack ?? remoteUser?.videoTrack ?? null;

  const hasParticipant = Boolean(localTrack || remoteUser);
  const showVideo = Boolean(videoTrack && videoEnabled);

  return (
    <section
      className="video-surface relative isolate min-h-[17rem] overflow-hidden rounded-2xl border border-[#303030] bg-[#0d0d0d] text-white md:min-h-0"
      aria-label={`${label} video`}
    >
      {showVideo && (localTrack ? (
        <LocalVideoTrack className="absolute inset-0 h-full w-full" track={localTrack} play videoPlayerConfig={LOCAL_VIDEO_PLAYER_CONFIG} />
      ) : (
        <RemoteVideoTrack className="absolute inset-0 h-full w-full" track={remoteUser?.videoTrack} play videoPlayerConfig={REMOTE_VIDEO_PLAYER_CONFIG} />
      ))}

      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_35%,#242424_0%,#0d0d0d_62%)] px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#3b3b3b] bg-[#191919]">
            {hasParticipant ? <CameraOff className="h-6 w-6" /> : <UserRound className="h-6 w-6" />}
          </div>
          <p className="max-w-xs text-sm text-[#a8adb7]">
            {waitingMessage ?? (hasParticipant ? 'Camera is off' : 'Waiting for video')}
          </p>
          {waitingAction}
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-10 rounded-md bg-black/65 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
        {label}
      </div>
    </section>
  );
}
