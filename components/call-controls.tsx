'use client';

import { useState } from 'react';
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ControlTooltip } from '@/components/ui/control-tooltip';
import { DeviceSelect } from '@/components/device-select';
import { InviteButton } from '@/components/invite-button';

type CallControlsProps = {
  invitePath?: string;
  microphones: MediaDeviceInfo[];
  cameras: MediaDeviceInfo[];
  microphoneId: string;
  cameraId: string;
  microphoneEnabled: boolean;
  cameraEnabled: boolean;
  microphoneAvailable: boolean;
  cameraAvailable: boolean;
  onMicrophoneChange: (deviceId: string) => void;
  onCameraChange: (deviceId: string) => void;
  onMicrophoneToggle: () => void;
  onCameraToggle: () => void;
  onLeave: () => void;
};

export function CallControls({
  invitePath,
  microphones,
  cameras,
  microphoneId,
  cameraId,
  microphoneEnabled,
  cameraEnabled,
  microphoneAvailable,
  cameraAvailable,
  onMicrophoneChange,
  onCameraChange,
  onMicrophoneToggle,
  onCameraToggle,
  onLeave,
}: CallControlsProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const microphoneLabel = microphoneEnabled ? 'Mute microphone' : 'Unmute microphone';
  const cameraLabel = cameraEnabled ? 'Turn camera off' : 'Turn camera on';

  return (
    <div className="relative flex justify-center">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 p-2 shadow-lg backdrop-blur-md">
        <ControlTooltip label={microphoneLabel}>
          <Button
            variant="secondary"
            size="icon"
            disabled={!microphoneAvailable}
            onClick={onMicrophoneToggle}
            aria-label={microphoneLabel}
          >
            {microphoneEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
        </ControlTooltip>
        <ControlTooltip label={cameraLabel}>
          <Button
            variant="secondary"
            size="icon"
            disabled={!cameraAvailable}
            onClick={onCameraToggle}
            aria-label={cameraLabel}
          >
            {cameraEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
          </Button>
        </ControlTooltip>

        <div className="relative">
          <ControlTooltip label="Select devices">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setSettingsOpen((open) => !open)}
              aria-label="Select devices"
              disabled={!microphoneAvailable && !cameraAvailable}
              aria-expanded={settingsOpen}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </ControlTooltip>
          {settingsOpen && (
            <div className="absolute bottom-14 left-1/2 z-30 flex w-[min(88vw,22rem)] -translate-x-1/2 flex-col gap-4 rounded-xl border border-[#353535] bg-[#151515] p-4 text-white shadow-2xl">
              <DeviceSelect
                id="call-microphone"
                label="Microphone"
                devices={microphones}
                value={microphoneId}
                onChange={onMicrophoneChange}
              />
              <DeviceSelect
                id="call-camera"
                label="Camera"
                devices={cameras}
                value={cameraId}
                onChange={onCameraChange}
              />
            </div>
          )}
        </div>

        <InviteButton iconOnly invitePath={invitePath} />
        <ControlTooltip label="Leave call">
          <Button variant="destructive" size="icon" onClick={onLeave} aria-label="Leave call">
            <PhoneOff className="h-4 w-4" />
          </Button>
        </ControlTooltip>
      </div>
    </div>
  );
}
