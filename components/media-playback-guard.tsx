'use client';

import { useEffect } from 'react';
import { isExpectedMediaPlaybackInterruption } from '@/lib/media-playback';

export function MediaPlaybackGuard() {
  useEffect(() => {
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function guardedPlay() {
      const playback = originalPlay.call(this);
      return playback.catch((reason: unknown) => {
        if (isExpectedMediaPlaybackInterruption(reason)) return;
        throw reason;
      });
    };

    const ignoreExpectedInterruption = (event: PromiseRejectionEvent) => {
      if (!isExpectedMediaPlaybackInterruption(event.reason)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
    };

    window.addEventListener('unhandledrejection', ignoreExpectedInterruption, { capture: true });
    return () => {
      HTMLMediaElement.prototype.play = originalPlay;
      window.removeEventListener('unhandledrejection', ignoreExpectedInterruption, { capture: true });
    };
  }, []);

  return null;
}
