import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { isExpectedMediaPlaybackInterruption } from '../lib/media-playback.ts';

test('keeps RTC track players stable across React re-renders', async () => {
  const [channelCall, videoTile] = await Promise.all([
    readFile(new URL('../components/channel-call.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/video-tile.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(channelCall, /<TrackBoundary>/);
  assert.match(channelCall, /<\/TrackBoundary>/);
  assert.doesNotMatch(videoTile, /videoPlayerConfig=\{\{/);
  assert.match(videoTile, /videoPlayerConfig=\{LOCAL_VIDEO_PLAYER_CONFIG\}/);
  assert.match(videoTile, /videoPlayerConfig=\{REMOTE_VIDEO_PLAYER_CONFIG\}/);
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
    readFile(new URL('../components/channel-experience-loader.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(guard, /event\.preventDefault\(\)/);
  assert.match(guard, /event\.stopImmediatePropagation\(\)/);
  assert.match(guard, /HTMLMediaElement\.prototype\.play = function guardedPlay/);
  assert.match(guard, /HTMLMediaElement\.prototype\.play = originalPlay/);
  assert.match(loader, /<MediaPlaybackGuard\s*\/>[\s\S]*<ChannelExperience channelName=\{channelName\}/);
});
