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

const channel = '00000000-0000-4000-8000-000000000001';
async function prepare(name = 'SSR tester', target = channel) {
  const response = await fetch(new URL('/api/call-entry', baseUrl), {
    method: 'POST', headers: { origin: new URL(baseUrl).origin, 'content-type': 'application/json' },
    body: JSON.stringify({ channelName: target, displayName: name }),
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=lax/i);
  assert.match(cookie, /Max-Age=120/i);
  return { url: (await response.json()).url, cookie: cookie.split(';')[0] };
}

test('actual call document contains visible SSR UI and consumes its browser cookie', { skip: !baseUrl }, async () => {
  const entry = await prepare('SSR 测试');
  const response = await fetch(new URL(entry.url, baseUrl), {
    headers: { accept: 'text/html', cookie: entry.cookie }, redirect: 'manual',
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/i);
  assert.match(response.headers.get('set-cookie'), new RegExp(`Path=/channel/${channel}/call`));
  const html = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  assert.match(html, /<h1[^>]*>Agora Video Calling<\/h1>/);
  assert.match(html, /SSR 测试/);
  assert.match(html, /Connecting/);
  assert.equal((html.match(/data-player-target/g) ?? []).length, 2);
  assert.match(html, /aria-label="Leave call"/);
  assert.doesNotMatch(html, /<main[^>]*\shidden(?:=|[ >])|name="participant-name"|<(?:video|audio)\b/);
  // A normal cookie jar drops the expired cookie before reload.
  const reload = await fetch(new URL(entry.url, baseUrl), { headers: { accept: 'text/html' }, redirect: 'manual' });
  assert.equal(reload.status, 307);
  assert.equal(new URL(reload.headers.get('location'), baseUrl).pathname, `/channel/${channel}`);
});

test('entries are independent and cannot open another channel or be consumed by prefetch', { skip: !baseUrl }, async () => {
  const a = await prepare('A');
  const b = await prepare('B');
  assert.notEqual(a.cookie.split('=')[0], b.cookie.split('=')[0]);
  const prefetch = await fetch(new URL(a.url, baseUrl), {
    headers: { accept: 'text/x-component', cookie: a.cookie, rsc: '1', 'next-router-prefetch': '1' }, redirect: 'manual',
  });
  assert.equal(prefetch.status, 307);
  assert.equal(new URL(prefetch.headers.get('location'), baseUrl).pathname, `/channel/${channel}`);
  assert.equal(prefetch.headers.get('set-cookie'), null);
  const wrongChannel = a.url.replace(channel, '00000000-0000-4000-8000-000000000002');
  const mismatch = await fetch(new URL(wrongChannel, baseUrl), { headers: { accept: 'text/html', cookie: a.cookie }, redirect: 'manual' });
  assert.equal(mismatch.status, 307);
  const valid = await fetch(new URL(b.url, baseUrl), { headers: { accept: 'text/html', cookie: b.cookie } });
  assert.equal(valid.status, 200);
});

test('entry endpoint rejects invalid input and cross-origin requests', { skip: !baseUrl }, async () => {
  for (const [origin, body, expected] of [
    ['https://unrelated.example', { channelName: channel, displayName: 'A' }, 403],
    [new URL(baseUrl).origin, null, 400],
    [new URL(baseUrl).origin, { channelName: channel, displayName: '' }, 400],
    [new URL(baseUrl).origin, { channelName: 'invalid', displayName: 'A' }, 400],
  ]) {
    const response = await fetch(new URL('/api/call-entry', baseUrl), {
      method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body),
    });
    assert.equal(response.status, expected);
    assert.equal(response.headers.get('set-cookie'), null);
  }
});
