import type {
  IAgoraRTC,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-react';

export type LocalMedia = {
  microphone: IMicrophoneAudioTrack | null;
  camera: ICameraVideoTrack | null;
};

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
