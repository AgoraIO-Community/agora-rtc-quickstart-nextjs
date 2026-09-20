# 06 Interfaces

> API, event, environment, and external service contracts.

## Browser Or User-Facing APIs

`POST /api/token` accepts `{ channelName, displayName }` for initial issue or
`{ channelName, userAccount }` for renewal. Success returns `appId`, `channelName`,
`userAccount`, `token`, and `expiresIn`. Invalid JSON, channel name, display name, or
account returns 400. Missing configuration or token failure returns a generic
500. Every response uses `Cache-Control: no-store`.

`POST /api/call-entry` accepts same-origin JSON `{ channelName, displayName }` and
returns `{ url }` plus a 120-second HttpOnly cookie scoped to the call path. The
call document consumes this browser handoff and clears the cookie on its response.
It is form data, not authentication. Invalid origin/input returns 403/400; non-JSON
returns 415. All responses use `Cache-Control: no-store`.

## Events And Media

React SDK hooks handle join, independent audio/video subscriptions, playback,
publication, and cleanup; the call component handles token expiry warnings. SDK
`exception` events are quality and recovery signals, not application errors,
so they remain in SDK diagnostics instead of the red error UI.
Audio and video publications arrive independently. Remote audio is played after
subscription; remote video is exposed to the view after subscription.

## Environment Contract

`NEXT_PUBLIC_AGORA_APP_ID` is the public project identifier.
`NEXT_AGORA_APP_CERTIFICATE` is server-only. Docker receives both values only
at runtime; neither credential is a build argument.

## External Services

- Agora RTC React SDK `2.5.1` (wraps Web SDK)
- `agora-token` `2.0.5`
- Agora RTC channel service

The runtime assumes token authentication and network access to Agora services.

## Related Deep Dives

None.
