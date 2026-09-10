# 06 Interfaces

> API, event, environment, and external service contracts.

## Browser Or User-Facing APIs

`POST /api/token` accepts `{ roomId, displayName }` for initial issue or
`{ roomId, userAccount }` for renewal. Success returns `appId`, `roomId`,
`userAccount`, `token`, and `expiresIn`. Invalid JSON, room ID, display name, or
account returns 400. Missing configuration or token failure returns a generic
500. Every response uses `Cache-Control: no-store`.

## Events And Media

`RtcSession` handles `user-joined`, `user-published`, `user-unpublished`,
`user-left`, `connection-state-change`, and token expiry warnings. SDK
`exception` events are quality and recovery signals, not application errors,
so they remain in SDK diagnostics instead of the red error UI.
Audio and video publications arrive independently. Remote audio is played after
subscription; remote video is exposed to the view after subscription.

## Environment Contract

`NEXT_PUBLIC_AGORA_APP_ID` is the public project identifier.
`NEXT_AGORA_APP_CERTIFICATE` is server-only. Docker receives both values only
at runtime; neither credential is a build argument.

## External Services

- Agora RTC Web SDK `4.24.3`
- `agora-token` `2.0.5`
- Agora RTC channel service

The runtime assumes token authentication and network access to Agora services.

## Related Deep Dives

None.
