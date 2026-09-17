'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AgoraRTC, {
  RemoteAudioTrack,
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
import { CallView } from '@/components/call-view';
import { JoinRoom } from '@/components/join-room';
import { setMediaEnabled, subscribeToDeviceChanges, switchMediaDevice } from '@/lib/media-devices';
import type { RtcTokenResponse } from '@/lib/token-client';
import { requestRtcToken } from '@/lib/token-client';

export function RoomCall({
  credentials,
  displayName,
  onLeave,
}: {
  credentials: RtcTokenResponse;
  displayName: string;
  onLeave: (error?: string) => void;
}) {
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
    channel: credentials.roomId,
    token: credentials.token,
    uid: credentials.userAccount,
  }, ready);
  const microphone = useLocalMicrophoneTrack(ready && join.isConnected, {
    encoderConfig: 'speech_standard',
  });
  const camera = useLocalCameraTrack(ready && join.isConnected, {
    encoderConfig: '720p_2',
  });
  const media = { microphone: microphone.localMicrophoneTrack, camera: camera.localCameraTrack };
  const publish = usePublish([media.microphone, media.camera], join.isConnected && Boolean(media.microphone || media.camera));
  const remoteUsers = useRemoteUsers();
  const { audioTracks, error: audioError } = useRemoteAudioTracks(remoteUsers);
  const { error: videoError } = useRemoteVideoTracks(remoteUsers);
  const connectionState = useConnectionState();

  useEffect(() => {
    if (join.error) onLeave('Unable to join the room.');
  }, [join.error, onLeave]);

  useEffect(() => {
    if (join.isConnected && !microphone.isLoading && !camera.isLoading &&
        microphone.error && camera.error) {
      onLeave('No camera or microphone is available.');
    }
  }, [join.isConnected, microphone.isLoading, camera.isLoading, microphone.error, camera.error, onLeave]);

  const callError = error ?? (publish.error ? 'Unable to publish local media.' :
    audioError ? 'Unable to subscribe to remote audio.' :
    videoError ? 'Unable to subscribe to remote video.' : null);

  useEffect(() => {
    const renew = async () => {
      try {
        const response = await requestRtcToken(credentials.roomId, { userAccount: credentials.userAccount });
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
  }, [client, credentials.roomId, credentials.userAccount]);

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

  const changeDevice = async (kind: 'microphone' | 'camera', id: string) => {
    try {
      if (kind === 'microphone') {
        await switchMediaDevice(media.microphone, id);
        setMicrophoneId(id);
      } else {
        await switchMediaDevice(media.camera, id);
        setCameraId(id);
      }
    } catch {
      setError(`Unable to switch ${kind}s.`);
    }
  };

  const toggle = async (kind: 'microphone' | 'camera') => {
    try {
      if (kind === 'microphone') {
        await setMediaEnabled(media.microphone, !microphoneEnabled);
        setMicrophoneEnabled(!microphoneEnabled);
      } else {
        await setMediaEnabled(media.camera, !cameraEnabled);
        setCameraEnabled(!cameraEnabled);
      }
    } catch {
      setError(`Unable to toggle ${kind}.`);
    }
  };

  if (!media.microphone && !media.camera) {
    return <JoinRoom displayName={displayName} joining error={null} onDisplayNameChange={() => {}} onJoin={() => {}} onCancel={() => onLeave()} />;
  }

  return (
    <>
      {audioTracks.map((track) => <RemoteAudioTrack key={track.getUserId()} track={track} play />)}
      <CallView
        localDisplayName={displayName}
        media={media}
        remoteUsers={remoteUsers}
        connectionState={connectionState}
        error={callError}
        microphones={microphones}
        cameras={cameras}
        microphoneId={microphoneId}
        cameraId={cameraId}
        microphoneEnabled={microphoneEnabled}
        cameraEnabled={cameraEnabled}
        onMicrophoneChange={(id) => void changeDevice('microphone', id)}
        onCameraChange={(id) => void changeDevice('camera', id)}
        onMicrophoneToggle={() => void toggle('microphone')}
        onCameraToggle={() => void toggle('camera')}
        onLeave={() => onLeave()}
      />
    </>
  );
}
