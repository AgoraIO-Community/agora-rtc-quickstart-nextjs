'use client';

import type { ConnectionState } from 'agora-rtc-react';

const labels: Record<ConnectionState, string> = {
  DISCONNECTED: 'Disconnected',
  CONNECTING: 'Connecting',
  RECONNECTING: 'Reconnecting',
  CONNECTED: 'Connected',
  DISCONNECTING: 'Disconnecting',
};

export function ConnectionStatus({ state }: { state: ConnectionState }) {
  const healthy = state === 'CONNECTED';
  const pending = state === 'CONNECTING' || state === 'RECONNECTING';

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground" role="status">
      <span
        className={`h-2 w-2 rounded-full ${healthy ? 'bg-emerald-500' : pending ? 'bg-amber-500' : 'bg-red-500'}`}
      />
      {labels[state]}
    </div>
  );
}
