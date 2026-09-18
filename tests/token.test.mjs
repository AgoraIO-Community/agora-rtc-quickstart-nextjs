import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRtcToken, TOKEN_EXPIRATION_SECONDS } from '../lib/token.ts';

test('builds an RTC token for the exact channel name and user account', () => {
  const channelName = '123e4567-e89b-42d3-a456-426614174000';
  const userAccount = 'alice.account';
  let received;

  const token = buildRtcToken({
    appId: '0'.repeat(32),
    appCertificate: '1'.repeat(32),
    channelName,
    userAccount,
    builder: (...args) => {
      received = args;
      return 'rtc-token';
    },
  });

  assert.equal(token, 'rtc-token');
  assert.equal(received[2], channelName);
  assert.equal(received[3], userAccount);
  assert.equal(received[5], TOKEN_EXPIRATION_SECONDS);
  assert.equal(received[6], TOKEN_EXPIRATION_SECONDS);
});
