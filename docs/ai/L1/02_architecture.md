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

The browser exposes the room URL and display-name form without accessing local
devices. After an explicit join action it requests a scoped account token,
activates React SDK hooks after the initial Strict Mode replay, joins, creates
and publishes local tracks, and subscribes to audio and video independently.
Renewal reuses room and user account. Hook cleanup unpublishes, releases tracks,
and leaves. Development uses the Next.js
default Turbopack runtime to preserve this client state across cold route compilation.

## Ownership Boundaries

`components/room-experience.tsx` owns token request and join UI,
`components/room-call.tsx` owns React SDK hooks and device controls,
`components/room-experience-loader.tsx` owns the provider client, and
`app/api/token/route.ts` and `lib/token.ts` own credentials. Agora owns transport.

## Runtime Modes

- local development: `pnpm dev` on localhost
- local or hosted production: Next.js build and Node process
- Vercel: frontend plus request-scoped token route
- Docker: stateless standalone server on port 3000 with runtime environment

## Related Deep Dives

None.
