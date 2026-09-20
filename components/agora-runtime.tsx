'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AgoraRTC, {
  AgoraRTCProvider,
  LocalVideoTrack,
  RemoteVideoTrack,
  type VideoPlayerConfig,
  RemoteAudioTrack,
  TrackBoundary,
  useConnectionState,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRTCClient,
  useRemoteAudioTracks,
  useRemoteUsers,
  useRemoteVideoTracks,
} from 'agora-rtc-react';
import { createPortal } from 'react-dom';
import type { CallViewProps } from '@/components/call-view';
import { setMediaEnabled, subscribeToDeviceChanges, switchMediaDevice } from '@/lib/media-devices';
import type { RtcTokenResponse } from '@/lib/token-client';
import { requestRtcToken } from '@/lib/token-client';

export type AgoraRuntimeProps = {
  credentials: RtcTokenResponse | null;
  displayName: string;
  localTarget: HTMLDivElement | null;
  remoteTarget: HTMLDivElement | null;
  onUpdate: (account: string, props: CallViewProps) => void;
  onLeave: (account: string, error?: string) => void;
};

const LOCAL_VIDEO_PLAYER_CONFIG = { fit: 'cover', mirror: true } satisfies VideoPlayerConfig;
const REMOTE_VIDEO_PLAYER_CONFIG = { fit: 'cover' } satisfies VideoPlayerConfig;

export function AgoraRuntime(props: AgoraRuntimeProps) {
  // A stable client must survive Strict Mode's effect replay.
  /* eslint-disable react-hooks/refs */
  const client = useRef<ReturnType<typeof AgoraRTC.createClient> | null>(null);
  if (!client.current) client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  const rtcClient = client.current;
  /* eslint-enable react-hooks/refs */
  return (
    <AgoraRTCProvider client={rtcClient}>
      {props.credentials && <RtcController {...props} key={props.credentials.userAccount} credentials={props.credentials} />}
    </AgoraRTCProvider>
  );
}

function RtcController({ credentials, displayName, localTarget, remoteTarget, onUpdate, onLeave }: AgoraRuntimeProps & { credentials: RtcTokenResponse }) {
  const leave = useCallback((message?: string) => onLeave(credentials.userAccount, message), [credentials.userAccount, onLeave]);
  const client = useRTCClient();
  const [ready, setReady] = useState(false);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphoneId, setMicrophoneId] = useState('');
  const [cameraId, setCameraId] = useState('');
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(false);

  // Deferring hook activation avoids Strict Mode's initial effect replay.
  useEffect(() => {
    active.current = true;
    const timer = setTimeout(() => setReady(true), 0);
    return () => {
      active.current = false;
      clearTimeout(timer);
    };
  }, []);

  const join = useJoin({
    appid: credentials.appId,
    channel: credentials.channelName,
    token: credentials.token,
    uid: credentials.userAccount,
  }, ready);
  const microphone = useLocalMicrophoneTrack(ready && join.isConnected, {
    encoderConfig: 'speech_standard',
  });
  const camera = useLocalCameraTrack(ready && join.isConnected, {
    encoderConfig: '720p_2',
  });
  const media = useMemo(() => ({ microphone: microphone.localMicrophoneTrack, camera: camera.localCameraTrack }), [microphone.localMicrophoneTrack, camera.localCameraTrack]);
  const publish = usePublish([media.microphone, media.camera], join.isConnected && Boolean(media.microphone || media.camera));
  const remoteUsers = useRemoteUsers();
  const { audioTracks, error: audioError } = useRemoteAudioTracks(remoteUsers);
  const { error: videoError } = useRemoteVideoTracks(remoteUsers);
  const connectionState = useConnectionState();

  useEffect(() => {
    if (join.error) leave('Unable to join the channel.');
  }, [join.error, leave]);

  useEffect(() => {
    if (join.isConnected && !microphone.isLoading && !camera.isLoading &&
        microphone.error && camera.error) {
      leave('No camera or microphone is available.');
    }
  }, [join.isConnected, microphone.isLoading, camera.isLoading, microphone.error, camera.error, leave]);

  const callError = error ?? (publish.error ? 'Unable to publish local media.' :
    audioError ? 'Unable to subscribe to remote audio.' :
    videoError ? 'Unable to subscribe to remote video.' : null);

  useEffect(() => {
    const renew = async () => {
      try {
        const response = await requestRtcToken(credentials.channelName, { userAccount: credentials.userAccount });
        if (active.current) await client.renewToken(response.token);
      } catch {
        if (active.current) setError('Unable to renew the RTC token.');
      }
    };
    client.on('token-privilege-will-expire', renew);
    client.on('token-privilege-did-expire', renew);
    return () => {
      client.off('token-privilege-will-expire', renew);
      client.off('token-privilege-did-expire', renew);
    };
  }, [client, credentials.channelName, credentials.userAccount]);

  const refreshDevices = useCallback(async () => {
    const [nextMicrophones, nextCameras] = await Promise.all([
      AgoraRTC.getMicrophones(true).catch(() => []),
      AgoraRTC.getCameras(true).catch(() => []),
    ]);
    if (!active.current) return;
    setMicrophones(nextMicrophones);
    setCameras(nextCameras);
    setMicrophoneId(nextMicrophones.find((device) => device.label === media.microphone?.getTrackLabel())?.deviceId ?? nextMicrophones[0]?.deviceId ?? '');
    setCameraId(nextCameras.find((device) => device.label === media.camera?.getTrackLabel())?.deviceId ?? nextCameras[0]?.deviceId ?? '');
  }, [media.microphone, media.camera]);

  useEffect(() => {
    if (!media.microphone && !media.camera) return;
    void refreshDevices();
    return subscribeToDeviceChanges(AgoraRTC, () => { void refreshDevices(); });
  }, [media.microphone, media.camera, refreshDevices]);

  const changeDevice = useCallback(async (kind: 'microphone' | 'camera', id: string) => {
    if (!active.current) return;
    try {
      if (kind === 'microphone') {
        await switchMediaDevice(media.microphone, id);
        if (active.current) setMicrophoneId(id);
      } else {
        await switchMediaDevice(media.camera, id);
        if (active.current) setCameraId(id);
      }
    } catch {
      if (active.current) setError(`Unable to switch ${kind}s.`);
    }
  }, [media.microphone, media.camera]);

  const toggle = useCallback(async (kind: 'microphone' | 'camera') => {
    if (!active.current) return;
    try {
      if (kind === 'microphone') {
        await setMediaEnabled(media.microphone, !microphoneEnabled);
        if (active.current) setMicrophoneEnabled(!microphoneEnabled);
      } else {
        await setMediaEnabled(media.camera, !cameraEnabled);
        if (active.current) setCameraEnabled(!cameraEnabled);
      }
    } catch {
      if (active.current) setError(`Unable to toggle ${kind}.`);
    }
  }, [media.microphone, media.camera, microphoneEnabled, cameraEnabled]);

  const remoteUser = remoteUsers[0] ?? null;
  const remoteVideoTrack = remoteUser?.videoTrack;
  // Preserve the view's existing props; only their source moved behind the browser boundary.
  const call = useMemo<CallViewProps>(() => ({
    localDisplayName: displayName,
    media, remoteUsers, connectionState, error: callError,
    microphones, cameras, microphoneId, cameraId, microphoneEnabled, cameraEnabled,
    onMicrophoneChange: (id) => { void changeDevice('microphone', id); },
    onCameraChange: (id) => { void changeDevice('camera', id); },
    onMicrophoneToggle: () => { void toggle('microphone'); },
    onCameraToggle: () => { void toggle('camera'); },
    onLeave: () => leave(),
  }), [displayName, media, remoteUsers, connectionState, callError, microphones, cameras, microphoneId, cameraId, microphoneEnabled, cameraEnabled, changeDevice, toggle, leave]);

  useEffect(() => {
    if (active.current) onUpdate(credentials.userAccount, { ...call });
  }, [call, remoteVideoTrack, credentials.userAccount, onUpdate]);

  return (
    <TrackBoundary>
      {audioTracks.map((track) => <RemoteAudioTrack key={track.getUserId()} track={track} play />)}
      {localTarget && media.camera && cameraEnabled && createPortal(
        <LocalVideoTrack className="absolute inset-0 h-full w-full" track={media.camera} play videoPlayerConfig={LOCAL_VIDEO_PLAYER_CONFIG} />,
        localTarget,
      )}
      {remoteTarget && remoteVideoTrack && createPortal(
        <RemoteVideoTrack className="absolute inset-0 h-full w-full" track={remoteVideoTrack} play videoPlayerConfig={REMOTE_VIDEO_PLAYER_CONFIG} />,
        remoteTarget,
      )}
    </TrackBoundary>
  );
}
