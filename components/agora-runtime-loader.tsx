'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import type { AgoraRuntimeProps } from '@/components/agora-runtime';

const AgoraRuntime = dynamic(() => import('@/components/agora-runtime').then((module) => module.AgoraRuntime), {
  ssr: false,
  loading: () => null,
});

class RuntimeBoundary extends Component<{ children: ReactNode; onError: (message: string) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {
    this.props.onError('Unable to load the call. Reload the page before trying again.');
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function AgoraRuntimeLoader({ onError, ...props }: AgoraRuntimeProps & { onError: (message: string) => void }) {
  return <RuntimeBoundary onError={onError}><AgoraRuntime {...props} /></RuntimeBoundary>;
}
