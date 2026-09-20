import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import registerTsx from './helpers/register-tsx.mjs';

const require = createRequire(import.meta.url);
const hooks = registerTsx(fileURLToPath(new URL('../', import.meta.url)));
const { ChannelCall } = require('../components/channel-call.tsx');
const { CallView } = require('../components/call-view.tsx');
hooks.deregister();

const noop = () => {};
const view = {
  localDisplayName: 'SSR tester', media: { microphone: null, camera: null },
  remoteUsers: [], connectionState: 'DISCONNECTED', error: null,
  microphones: [], cameras: [], microphoneId: '', cameraId: '',
  microphoneEnabled: true, cameraEnabled: true,
  onMicrophoneChange: noop, onCameraChange: noop, onMicrophoneToggle: noop,
  onCameraToggle: noop, onLeave: noop,
};

test('ChannelCall server-renders the original joining state without RTC tracks', () => {
  assert.equal(typeof window, 'undefined');
  const html = renderToStaticMarkup(React.createElement(ChannelCall, { displayName: 'SSR tester', call: null, onLeave: noop }));
  assert.match(html, /Join the call/);
  assert.match(html, /Joining\.\.\./);
  assert.match(html, /Cancel/);
  assert.doesNotMatch(html, /aria-label="[^"]* video"/);
});

test('CallView can server-render its original waiting interface without SDK execution', () => {
  const html = renderToStaticMarkup(React.createElement(CallView, view));
  assert.match(html, /<h1[^>]*>Agora Video Calling<\/h1>/);
  assert.match(html, /Waiting for another participant/);
  assert.equal((html.match(/<section\b[^>]*aria-label="[^"]* video"/g) ?? []).length, 2);
  assert.match(html, /aria-label="Mute microphone"/);
  assert.match(html, /aria-label="Turn camera off"/);
  assert.doesNotMatch(html, /name="participant-name"/);
  // A type-only SDK reference must not execute or require the SDK at render time.
  assert.equal(Object.keys(require.cache).some(path => /agora-rtc-(react|sdk)/.test(path)), false);
});

test('ChannelCall preserves the either-local-track condition for displaying the call', () => {
  // Opaque fixture handles model availability; no SDK track is created or played.
  for (const media of [{ microphone: {}, camera: null }, { microphone: null, camera: {} }]) {
    const html = renderToStaticMarkup(React.createElement(ChannelCall, {
      displayName: 'SSR tester', call: { ...view, media }, onLeave: noop,
    }));
    assert.match(html, /<h1[^>]*>Agora Video Calling<\/h1>/);
    assert.doesNotMatch(html, /name="participant-name"/);
  }
});
