'use client';

type MediaDevice = {
  deviceId: string;
  label: string;
};

type DeviceSelectProps = {
  id: string;
  label: string;
  devices: MediaDevice[];
  value: string;
  onChange: (deviceId: string) => void;
};

export function DeviceSelect({
  id,
  label,
  devices,
  value,
  onChange,
}: DeviceSelectProps) {
  return (
    <label htmlFor={id} className="flex min-w-0 flex-1 flex-col gap-2 text-left">
      <span className="text-xs font-medium text-[#8d94a3]">{label}</span>
      <select
        id={id}
        value={value}
        disabled={devices.length === 0}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full min-w-0 rounded-lg border border-[#343434] bg-[#1c1c1c] px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {devices.length === 0 ? (
          <option value="">No device available</option>
        ) : (
          devices.map((device, index) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `${label} ${index + 1}`}
            </option>
          ))
        )}
      </select>
    </label>
  );
}
