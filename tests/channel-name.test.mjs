import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createChannelName, isValidChannelName } from '../lib/channel-name.ts';

test('creates a canonical UUID channel name', () => {
  const channelName = createChannelName();

  assert.equal(isValidChannelName(channelName), true);
  assert.equal(channelName, channelName.toLowerCase());
});

test('rejects values outside the UUID channel-name contract', () => {
  assert.equal(isValidChannelName('123e4567-e89b-42d3-a456-426614174000'), true);
  assert.equal(isValidChannelName('room'), false);
  assert.equal(isValidChannelName('123E4567-E89B-42D3-A456-426614174000'), false);
  assert.equal(isValidChannelName(undefined), false);
});
