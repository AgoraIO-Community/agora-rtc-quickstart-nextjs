import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requestRtcToken } from '../lib/token-client.ts';

test('passes cancellation through to the token request', async () => {
  const controller = new AbortController();
  const fetcher = async (url, options) => {
    assert.equal(url, '/api/token');
    assert.equal(options.signal, controller.signal);
    assert.deepEqual(JSON.parse(options.body), {
      channelName: '123e4567-e89b-42d3-a456-426614174000',
      displayName: 'Alice',
    });
    controller.abort();
    throw new DOMException('Aborted', 'AbortError');
  };

  await assert.rejects(
    requestRtcToken(
      '123e4567-e89b-42d3-a456-426614174000',
      { displayName: 'Alice' },
      fetcher,
      controller.signal,
    ),
    { name: 'AbortError' },
  );
});
