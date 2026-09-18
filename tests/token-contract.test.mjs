import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('uses channelName throughout the browser and server token contract', async () => {
  const [client, route] = await Promise.all([
    readFile(new URL('../lib/token-client.ts', import.meta.url), 'utf8'),
    readFile(new URL('../app/api/token/route.ts', import.meta.url), 'utf8'),
  ]);

  assert.match(client, /channelName: string/);
  assert.match(client, /JSON\.stringify\(\{ channelName, \.\.\.identity \}\)/);
  assert.match(route, /isValidChannelName\(payload\.channelName\)/);
  assert.match(route, /channelName: payload\.channelName/);
  assert.doesNotMatch(`${client}\n${route}`, /roomId/);
});
