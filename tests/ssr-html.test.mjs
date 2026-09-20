import assert from 'node:assert/strict';
import { test } from 'node:test';

const baseUrl = process.env.SSR_TEST_BASE_URL;

test('channel response renders only the original join form before JavaScript', { skip: !baseUrl }, async () => {
  const response = await fetch(new URL('/channel/00000000-0000-4000-8000-000000000001', baseUrl));
  assert.equal(response.status, 200);
  // Script payloads may mention component text without rendering HTML.
  const markup = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  assert.match(markup, /<h1\b[^>]*>Join the call<\/h1>/);
  assert.match(markup, /<input\b[^>]*name="participant-name"/);
  assert.match(markup, /aria-label="Copy invite link"/);
  assert.doesNotMatch(markup, /aria-label="[^"]* video"/);
  assert.doesNotMatch(markup, /aria-label="(?:Mute microphone|Turn camera off|Leave call)"/);
  assert.match(markup, /Join Call/);
  assert.match(markup, /Powered by/);
  assert.doesNotMatch(markup, /Loading RTC client/);
});

test('invalid channel names still return not found', { skip: !baseUrl }, async () => {
  const response = await fetch(new URL('/channel/not-a-valid-channel', baseUrl));
  assert.equal(response.status, 404);
});
