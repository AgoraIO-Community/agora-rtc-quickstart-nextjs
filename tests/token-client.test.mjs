import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requestRtcToken } from '../lib/token-client.ts';

test('passes cancellation through to the token request', async () => {
  const controller = new AbortController();
  const fetcher = async (url, options) => {
    assert.equal(url, '/api/token');
    assert.equal(options.signal, controller.signal);
    assert.deepEqual(JSON.parse(options.body), { roomId: 'room', displayName: 'Alice' });
    controller.abort();
    throw new DOMException('Aborted', 'AbortError');
  };

  await assert.rejects(
    requestRtcToken('room', { displayName: 'Alice' }, fetcher, controller.signal),
    { name: 'AbortError' },
  );
});
