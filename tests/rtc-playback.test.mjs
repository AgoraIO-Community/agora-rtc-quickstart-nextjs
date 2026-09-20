import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { isExpectedMediaPlaybackInterruption } from '../lib/media-playback.ts';

test('declares shared player context and stable configuration in the browser runtime', async () => {
  const runtime = await readFile(new URL('../components/agora-runtime.tsx', import.meta.url), 'utf8');
  assert.match(runtime, /<TrackBoundary>/);
  assert.match(runtime, /<\/TrackBoundary>/);
  assert.doesNotMatch(runtime, /videoPlayerConfig=\{\{/);
  assert.match(runtime, /videoPlayerConfig=\{LOCAL_VIDEO_PLAYER_CONFIG\}/);
  assert.match(runtime, /videoPlayerConfig=\{REMOTE_VIDEO_PLAYER_CONFIG\}/);
});

test('recognizes only the benign browser interruption emitted during RTC teardown', () => {
  assert.equal(isExpectedMediaPlaybackInterruption(new DOMException(
    'The play() request was interrupted by a new load request. https://goo.gl/LdLk22',
    'AbortError',
  )), true);
  assert.equal(isExpectedMediaPlaybackInterruption(new DOMException('Aborted', 'AbortError')), false);
  assert.equal(isExpectedMediaPlaybackInterruption({
    name: 'AbortError',
    message: 'The play() request was interrupted by a new load request.',
  }), true);
  assert.equal(isExpectedMediaPlaybackInterruption(new Error(
    'The play() request was interrupted by a new load request.',
  )), false);
});

test('keeps the playback rejection guard mounted outside the call session', async () => {
  const [guard, loader] = await Promise.all([
    readFile(new URL('../components/media-playback-guard.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/channel/[channelName]/layout.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(guard, /event\.preventDefault\(\)/);
  assert.match(guard, /event\.stopImmediatePropagation\(\)/);
  assert.match(guard, /HTMLMediaElement\.prototype\.play = function guardedPlay/);
  assert.match(guard, /HTMLMediaElement\.prototype\.play = originalPlay/);
  assert.match(loader, /<MediaPlaybackGuard\s*\/>\{children\}/);
});
