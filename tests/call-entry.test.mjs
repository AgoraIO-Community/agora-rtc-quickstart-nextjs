import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import registerTsx from './helpers/register-tsx.mjs';
const require = createRequire(import.meta.url);
const hooks = registerTsx(fileURLToPath(new URL('../', import.meta.url)));
const { readCallEntry, isEntryId } = require('../lib/call-entry.ts');
const { saveCallReturn, takeCallReturn } = require('../lib/call-return.ts');
hooks.deregister();
const channel = '00000000-0000-4000-8000-000000000001';
test('entry data is validated independently of its cookie origin', () => {
  const data = { channelName: channel, displayName: '  测试  ', expiresAt: 2000 };
  assert.equal(readCallEntry(JSON.stringify(data), channel, 1000), '测试');
  for (const invalid of [null, {}, { ...data, expiresAt: 999 }, { ...data, expiresAt: 999999 },
    { ...data, displayName: '' }, { ...data, channelName: 'other' }]) {
    assert.equal(readCallEntry(JSON.stringify(invalid), channel, 1000), null);
  }
  assert.equal(readCallEntry('bad json', channel), null);
  assert.equal(isEntryId('a'.repeat(32)), true);
  assert.equal(isEntryId('../bad'), false);
});
test('return data is consumed once and storage failure does not block leaving', () => {
  const data = new Map();
  globalThis.sessionStorage = { setItem: (k, v) => data.set(k, v), getItem: k => data.get(k) ?? null, removeItem: k => data.delete(k) };
  try {
    saveCallReturn(channel, 'Alice', 'Unable to join.');
    assert.deepEqual(takeCallReturn(channel), { displayName: 'Alice', error: 'Unable to join.' });
    assert.equal(takeCallReturn(channel), null);
    globalThis.sessionStorage = { setItem() { throw new Error('blocked'); }, getItem() { throw new Error('blocked'); } };
    assert.doesNotThrow(() => saveCallReturn(channel, 'Alice'));
    assert.equal(takeCallReturn(channel), null);
  } finally { delete globalThis.sessionStorage; }
});
