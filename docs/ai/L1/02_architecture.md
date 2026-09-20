# 02 Architecture

> System topology, data flow, and lifecycle overview.

## Components

- Next.js App Router pages and API route
- React client components for named join and call state
- Agora RTC React SDK browser client
- server-side `agora-token` builder
- Agora RTC channel transport

See [ARCHITECTURE.md](../../../ARCHITECTURE.md) for the canonical topology.

## Data And Event Flow

The browser exposes the channel URL and display-name form without accessing local
devices. After an explicit join action it requests a scoped account token,
activates React SDK hooks after the initial Strict Mode replay, joins, creates
and publishes local tracks, and subscribes to audio and video independently.
Renewal reuses channel and user account. Hook cleanup unpublishes, releases tracks,
and leaves. A shared `TrackBoundary` and stable player configuration prevent
render-only updates from interrupting active playback. Development uses the
Next.js default Turbopack runtime to preserve this client state across cold route compilation.

## Ownership Boundaries

`components/channel-experience.tsx` owns token request and join UI,
`components/channel-call.tsx` preserves the original display conditions,
`components/agora-runtime.tsx` owns the persistent provider, hooks and players, and
`app/api/token/route.ts` and `lib/token.ts` own credentials. Agora owns transport.

## Rendering

The initial HTML contains the original join form. Presentation components support
SSR; only AgoraRuntime is behind `ssr: false`. Existing CallView props flow from
the browser controller to the interface, and local player portals retain the
shared TrackBoundary. Neither display timing nor provider lifetime changes.

## Runtime Modes

- local development: `pnpm dev` on localhost
- local or hosted production: Next.js build and Node process
- Vercel: frontend plus request-scoped token route
- Docker: stateless standalone server on port 3000 with runtime environment

## Related Deep Dives

None.
