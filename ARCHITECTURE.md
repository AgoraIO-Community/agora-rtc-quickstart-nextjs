# Agora RTC Next.js Quickstart Architecture

## System Overview

This quickstart is a one-to-one browser calling application. Next.js serves the
UI and a request-scoped token route. Each browser owns its local media and one
Agora RTC React SDK client. Agora carries audio and video between clients that
join the same channel with different string user accounts.

## Component Topology

```text
Browser A                              Browser B
  | camera + microphone                 | camera + microphone
  | POST /api/token                     | POST /api/token
  v                                     v
Next.js application and token route (Node.js process)
  | reads server environment and issues scoped RTC publisher tokens
  v
Agora RTC channel: UUID channel name
  ^                                     ^
  | account A: publish + subscribe       | account B: publish + subscribe
  +-------------------------------------+
```

`app/page.tsx` renders channel creation. `app/channel/[channelName]/page.tsx` accepts only a
canonical lowercase UUID and mounts `components/channel-experience.tsx`.
`components/channel-experience-loader.tsx` renders the experience without disabling
SSR. The original independent join form is in the first HTML response.
`components/agora-runtime-loader.tsx` dynamically loads only the Agora runtime
with `ssr: false`, allowing the provider client to load before Join Call.
Development uses the Next.js 16 default Turbopack runtime; the Webpack dev
runtime can reload an active channel when another browser first compiles `/`.

## Request And Media Flow

1. The home page creates a UUID channel URL.
2. The channel experience exposes the invitation URL and display-name form without
   requesting camera and microphone access.
3. The user enters a name and explicitly selects **Join Call**.
4. The browser calls `POST /api/token` with the channel name and display name. The
   server validates both, creates a unique ASCII RTC user account containing the
   encoded name, and returns App ID, channel name, account, token, and relative
   expiration under `Cache-Control: no-store`.
5. The dynamically loaded provider creates one client. After the initial Strict
   Mode effect replay, `useJoin` joins with the returned channel name and account;
   local-track hooks create available tracks and `usePublish` publishes them.
6. React SDK hooks subscribe to audio and video independently before playback.
   A shared `TrackBoundary` and stable video-player configuration keep brief
   React re-renders from stopping and immediately reloading active tracks.
7. Before token expiry, the client requests a new token with the same channel name
   and user account and calls `renewToken`.
8. Unmounting the call lets React SDK hooks unpublish, release local tracks, and
   leave. A pending token request is aborted when its channel component unmounts.

## Ownership Boundaries

- `components/channel-experience.tsx` owns named join, device initialization after
  join, and the `setup`, `joining`, and `connected` UI phases.
- `components/join-channel.tsx` owns the display-name and invitation form.
- `components/channel-call.tsx` retains the original joining-versus-call display
  condition: show the joining form until either local track exists.
- `components/agora-runtime.tsx` owns the page-scoped provider, React SDK hooks,
  device operations, token renewal and players. Its controller mounts only with
  credentials, while the provider remains mounted across leave/rejoin.
- `lib/media-devices.ts` supports switching, enablement, and device-change listeners.
- `app/api/token/route.ts` owns the HTTP request and response contract.
- `lib/token.ts` owns RTC publisher token construction and expiration.
- `components/channel-experience-loader.tsx` retains the page-scoped playback guard.
- Agora owns channel transport and remote media delivery. The application has no
  channel database or persistent session service.

## Authentication And Secrets

`NEXT_PUBLIC_AGORA_APP_ID` is the public Agora project identifier.
`NEXT_AGORA_APP_CERTIFICATE` is server-only and is read only by the token route.
It must not be returned, logged, bundled, copied into an image, or committed.

Tokens use `RtcTokenBuilder.buildTokenWithUserAccount`, `RtcRole.PUBLISHER`, and a
3600-second relative token and privilege expiration. Token, join, and renewal
must use the same channel name and string user account.

## RTC Lifecycle

There is exactly one provider client per mounted channel session. React SDK hooks
activate after explicit Join Call and the initial Strict Mode effect replay.
Local tracks are created only after join, so opening an invitation does not
contend for devices. Audio and video subscriptions remain separate. A missing camera or
microphone does not block the other available media type. Device changes refresh
the available list; manual selection is available during the call.
Track players share a `TrackBoundary`, and video-player configuration objects
remain referentially stable so render-only updates do not interrupt playback.
The channel loader keeps a route-scoped rejection guard mounted across call teardown.
It ignores only the browser's expected `play()`-interrupted-by-new-load
`AbortError` at the media-play promise boundary; all other playback failures and
unhandled rejections continue to surface.
Agora SDK `exception` events report quality degradation and recovery; they are
not routed to the application's fatal error banner.

## Rendering boundary

ChannelCall, CallView and VideoTile are SSR-compatible Client Components. Their
original layouts and conditional display timing remain unchanged. On first
navigation the form is rendered on the server; clicking Join Call changes client
state and does not cause a new server render of the call interface.

ChannelExperience passes the existing CallView props from the browser controller
to the presentation branch. Current-account checks discard stale callbacks after
leave. The browser controller stays outside that branch, beneath the persistent
Agora provider. It uses two local portals to put video players in the original
tiles while retaining the shared TrackBoundary and stable player configuration.
No SDK objects are serialized from a Server Component. Type-only SDK imports in
presentation files do not load the runtime.

Test initial form HTML separately from the display components' ability to render
in Node. Neither proves live media playback or two-client success.

## Runtime Modes

### Local Development

`pnpm dev` runs Next.js on `http://localhost:3000`. Localhost may access media
devices without HTTPS. `.env.local` supplies the two Agora values to the server
process. Node.js 22.x and 24.x are supported; Docker uses Node.js 22 as the
reference production runtime.

### Vercel

Vercel serves the frontend and request-scoped App Router token route. Both
environment variables are configured in the Vercel project. The resulting demo
is public unless access controls are added.

### Docker

The multi-stage image builds Next.js `standalone` output and runs `server.js` as
a non-root user on port 3000. The image contains no Agora credentials. Both
the public App ID and server-only certificate are supplied to the container at
runtime.

The container is stateless. It does not store channels, users, media, or tokens.

## API And External Contracts

`POST /api/token` accepts an initial `{ "channelName": string, "displayName": string }`
or renewal `{ "channelName": string, "userAccount": string }` request. Successful
responses contain `appId`, `channelName`, `userAccount`, `token`, and `expiresIn`.
Malformed JSON or invalid identifiers return 400. Missing credentials or token
construction failures return a generic 500 response. All responses are
non-cacheable.

The external runtime dependencies are Agora RTC React SDK `2.5.1` (wrapping the Web SDK) and
`agora-token` `2.0.5`.

## Production Boundary

This repository is a development quickstart, not a production token service. It
has no application login, channel authorization, server-controlled user identity,
rate limiting, abuse controls, monitoring, RTM, AI agent, recording, screen
sharing, or persistence. Production deployments must add the controls required
by their threat model.
