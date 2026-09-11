import type {
  IAgoraRTC,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

export type LocalMedia = {
  microphone: IMicrophoneAudioTrack | null;
  camera: ICameraVideoTrack | null;
};

export type MediaSdk = Pick<
  IAgoraRTC,
  | 'createMicrophoneAudioTrack'
  | 'createCameraVideoTrack'
  | 'getMicrophones'
  | 'getCameras'
  | 'onMicrophoneChanged'
  | 'onCameraChanged'
>;

export async function createLocalMedia(
  sdk: Pick<MediaSdk, 'createMicrophoneAudioTrack' | 'createCameraVideoTrack'>,
): Promise<LocalMedia> {
  const [microphoneResult, cameraResult] = await Promise.allSettled([
    sdk.createMicrophoneAudioTrack({ encoderConfig: 'speech_standard' }),
    sdk.createCameraVideoTrack({ encoderConfig: '720p_2' }),
  ]);

  return {
    microphone:
      microphoneResult.status === 'fulfilled' ? microphoneResult.value : null,
    camera: cameraResult.status === 'fulfilled' ? cameraResult.value : null,
  };
}

type ConfigurableTrack = {
  setDevice(deviceId: string): Promise<void>;
  setEnabled(enabled: boolean): Promise<void>;
};

export async function switchMediaDevice(
  track: ConfigurableTrack | null,
  deviceId: string,
): Promise<void> {
  await track?.setDevice(deviceId);
}

export async function setMediaEnabled(
  track: ConfigurableTrack | null,
  enabled: boolean,
): Promise<void> {
  await track?.setEnabled(enabled);
}

export type DeviceChangeSdk = Pick<
  IAgoraRTC,
  'onMicrophoneChanged' | 'onCameraChanged'
>;

export function subscribeToDeviceChanges(
  sdk: DeviceChangeSdk,
  onChange: () => void,
): () => void {
  const microphoneHandler: NonNullable<DeviceChangeSdk['onMicrophoneChanged']> =
    () => onChange();
  const cameraHandler: NonNullable<DeviceChangeSdk['onCameraChanged']> = () =>
    onChange();

  sdk.onMicrophoneChanged = microphoneHandler;
  sdk.onCameraChanged = cameraHandler;

  return () => {
    if (sdk.onMicrophoneChanged === microphoneHandler) {
      sdk.onMicrophoneChanged = undefined;
    }
    if (sdk.onCameraChanged === cameraHandler) {
      sdk.onCameraChanged = undefined;
    }
  };
}
