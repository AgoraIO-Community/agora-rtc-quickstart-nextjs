'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AgoraRTC, {
  type ConnectionState,
  type IAgoraRTC,
  type IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';
import { CallView } from '@/components/call-view';
import { JoinRoom } from '@/components/join-room';
import {
  createLocalMedia,
  setMediaEnabled,
  subscribeToDeviceChanges,
  switchMediaDevice,
  type LocalMedia,
} from '@/lib/media-devices';
import { isValidDisplayName, normalizeDisplayName } from '@/lib/rtc-identity';
import { RtcSession } from '@/lib/rtc-session';
import { requestRtcToken } from '@/lib/token-client';

type Phase = 'setup' | 'joining' | 'connected';

export function RoomExperience({ roomId }: { roomId: string }) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [displayName, setDisplayName] = useState('');
  const [joinedDisplayName, setJoinedDisplayName] = useState('');
  const [media, setMedia] = useState<LocalMedia | null>(null);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphoneId, setMicrophoneId] = useState('');
  const [cameraId, setCameraId] = useState('');
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const [error, setError] = useState<string | null>(null);

  const mediaRef = useRef<LocalMedia | null>(null);
  const sessionRef = useRef<RtcSession | null>(null);
  const deviceUnsubscribeRef = useRef<(() => void) | null>(null);

  const refreshDevices = useCallback(async (sdk: IAgoraRTC, localMedia: LocalMedia) => {
    const [nextMicrophones, nextCameras] = await Promise.all([
      sdk.getMicrophones(true).catch(() => []),
      sdk.getCameras(true).catch(() => []),
    ]);

    setMicrophones(nextMicrophones);
    setCameras(nextCameras);

    const activeMicrophone = nextMicrophones.find(
      (device) => device.label === localMedia.microphone?.getTrackLabel(),
    );
    const activeCamera = nextCameras.find(
      (device) => device.label === localMedia.camera?.getTrackLabel(),
    );

    setMicrophoneId(activeMicrophone?.deviceId ?? nextMicrophones[0]?.deviceId ?? '');
    setCameraId(activeCamera?.deviceId ?? nextCameras[0]?.deviceId ?? '');
  }, []);

  useEffect(() => {
    return () => {
      deviceUnsubscribeRef.current?.();
      deviceUnsubscribeRef.current = null;
      void sessionRef.current?.cleanup();
      sessionRef.current = null;
      mediaRef.current = null;
    };
  }, []);

  const join = async () => {
    if (phase !== 'setup' || !isValidDisplayName(displayName)) return;
    const normalizedName = normalizeDisplayName(displayName);
    setDisplayName(normalizedName);
    setPhase('joining');
    setError(null);

    try {
      const credentials = await requestRtcToken(roomId, { displayName: normalizedName });
      const session = new RtcSession({
        sdk: AgoraRTC,
        appId: credentials.appId,
        roomId,
        userAccount: credentials.userAccount,
        token: credentials.token,
        createMedia: () => createLocalMedia(AgoraRTC),
        renewToken: async (renewRoomId, userAccount) =>
          (await requestRtcToken(renewRoomId, { userAccount })).token,
        onLocalMedia: (localMedia) => {
          mediaRef.current = localMedia;
          setMedia(localMedia);
          setMicrophoneEnabled(Boolean(localMedia.microphone));
          setCameraEnabled(Boolean(localMedia.camera));
          void refreshDevices(AgoraRTC, localMedia);
          deviceUnsubscribeRef.current?.();
          deviceUnsubscribeRef.current = subscribeToDeviceChanges(AgoraRTC, () => {
            void refreshDevices(AgoraRTC, localMedia);
          });
        },
        onRemoteUsers: setRemoteUsers,
        onConnectionState: setConnectionState,
        onError: (nextError) => setError(nextError.message),
      });
      sessionRef.current = session;
      await session.join();
      setJoinedDisplayName(normalizedName);
      setPhase('connected');
    } catch (nextError) {
      await sessionRef.current?.cleanup();
      sessionRef.current = null;
      mediaRef.current = null;
      setMedia(null);
      setError(nextError instanceof Error ? nextError.message : 'Unable to join the room.');
      setPhase('setup');
    }
  };

  const leave = async () => {
    await sessionRef.current?.cleanup();
    sessionRef.current = null;
    mediaRef.current = null;
    deviceUnsubscribeRef.current?.();
    deviceUnsubscribeRef.current = null;
    setMedia(null);
    setRemoteUsers([]);
    setConnectionState('DISCONNECTED');
    setPhase('setup');
  };

  const changeMicrophone = async (deviceId: string) => {
    if (!media?.microphone) return;
    try {
      await switchMediaDevice(media.microphone, deviceId);
      setMicrophoneId(deviceId);
    } catch {
      setError('Unable to switch microphones.');
    }
  };

  const changeCamera = async (deviceId: string) => {
    if (!media?.camera) return;
    try {
      await switchMediaDevice(media.camera, deviceId);
      setCameraId(deviceId);
    } catch {
      setError('Unable to switch cameras.');
    }
  };

  const toggleMicrophone = async () => {
    if (!media?.microphone) return;
    const enabled = !microphoneEnabled;
    await setMediaEnabled(media.microphone, enabled);
    setMicrophoneEnabled(enabled);
  };

  const toggleCamera = async () => {
    if (!media?.camera) return;
    const enabled = !cameraEnabled;
    await setMediaEnabled(media.camera, enabled);
    setCameraEnabled(enabled);
  };

  if (phase === 'setup' || phase === 'joining') {
    return (
      <JoinRoom
        displayName={displayName}
        joining={phase === 'joining'}
        error={error}
        onDisplayNameChange={setDisplayName}
        onJoin={() => void join()}
      />
    );
  }

  if (!media) return null;

  return (
    <CallView
      localDisplayName={joinedDisplayName}
      media={media}
      remoteUsers={remoteUsers}
      connectionState={connectionState}
      error={error}
      microphones={microphones}
      cameras={cameras}
      microphoneId={microphoneId}
      cameraId={cameraId}
      microphoneEnabled={microphoneEnabled}
      cameraEnabled={cameraEnabled}
      onMicrophoneChange={(value) => void changeMicrophone(value)}
      onCameraChange={(value) => void changeCamera(value)}
      onMicrophoneToggle={() => void toggleMicrophone()}
      onCameraToggle={() => void toggleCamera()}
      onLeave={() => void leave()}
    />
  );
}
