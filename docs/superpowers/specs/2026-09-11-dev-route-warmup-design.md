# Development Route Warmup Design

## Problem

After a cold `pnpm dev` start, opening a room directly compiles only the room
route. If a second browser then opens `/` for the first time, Next.js compiles
the home route and refreshes the existing room client. The RTC component is
reloaded, its in-memory phase returns to setup, and its cleanup leaves the call.

## Design

In development only, gate the room experience behind a request to `/`. The
request forces the home route and shared chunks to compile before the user can
see or use Join Call. After the request settles, wait for two animation frames
so the browser can apply the development update, then mount the RTC experience.

Production bypasses the gate immediately. A failed warmup request must not make
the room permanently unusable; it still releases the gate after the same client
settling point.

## Acceptance

After a cold `pnpm dev` start, Chrome can join a room and remain connected when
Safari opens `http://localhost:3000` for the first time. Production rendering
must not issue the warmup request or add a delay.
