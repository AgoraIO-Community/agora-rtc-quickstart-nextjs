# Development Runtime Stability Design

## Problem

After a cold `next dev --webpack` start, Safari's first request to `/` causes an
already connected Chrome room page to perform a full reload. The RTC component
loses its in-memory session and returns to Join.

## Decision

Use the Next.js 16 default Turbopack development runtime, matching the older RTC
demo's `next dev` command. A controlled cold-start comparison showed that
Webpack changed Chrome's navigation type to `reload`, while Turbopack kept it at
`navigate` and preserved the connected RTC client through Safari's first `/`
request.

Do not add route warmup or RTC auto-rejoin. Production behavior is unchanged.

## Acceptance

After a cold `pnpm dev` start, Chrome can join a room and remain Connected when
Safari opens `http://localhost:3000` for the first time.
