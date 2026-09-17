import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('keeps RTC track players stable across React re-renders', async () => {
  const [roomCall, videoTile] = await Promise.all([
    readFile(new URL('../components/room-call.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/video-tile.tsx', import.meta.url), 'utf8'),
  ]);

  assert.match(roomCall, /<TrackBoundary>/);
  assert.match(roomCall, /<\/TrackBoundary>/);
  assert.doesNotMatch(videoTile, /videoPlayerConfig=\{\{/);
  assert.match(videoTile, /videoPlayerConfig=\{LOCAL_VIDEO_PLAYER_CONFIG\}/);
  assert.match(videoTile, /videoPlayerConfig=\{REMOTE_VIDEO_PLAYER_CONFIG\}/);
});
