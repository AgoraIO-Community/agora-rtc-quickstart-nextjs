# Agent Development Guide

This repository is the Agora RTC Web one-to-one quickstart for Next.js.

## How To Load

1. Read [docs/ai/L0_repo_card.md](docs/ai/L0_repo_card.md).
2. Read [docs/ai/RECIPE.md](docs/ai/RECIPE.md).
3. Load all eight files in [docs/ai/L1/](docs/ai/L1/).
4. Follow [docs/ai/L1/L2/_index.md](docs/ai/L1/L2/_index.md) only when a task needs a listed deep dive.
5. Use [README.md](README.md) for user workflows and [ARCHITECTURE.md](ARCHITECTURE.md) for canonical topology and lifecycle.

## Current System Shape

- Next.js App Router and React
- `agora-rtc-react` owns browser RTC join, publication, subscription, and track lifecycle
- server-side RTC token generation through `POST /api/token`
- URL-only channel identity with no channel database
- one browser-owned RTC client per mounted channel session
- Vercel and standalone Docker production modes

## Supported Modes

- local development with `pnpm dev`
- local production with `pnpm run build && pnpm run start`
- Vercel frontend plus request-scoped token route
- Docker standalone Next.js process on port 3000

## Routing / Ownership

- UI and interaction state: `components/`
- validated channel route: `app/channel/[channelName]/page.tsx`
- HTTP token contract: `app/api/token/route.ts`
- RTC token construction: `lib/token.ts`
- browser token client: `lib/token-client.ts`
- RTC lifecycle: `components/agora-runtime.tsx`
- device switching and change listeners: `lib/media-devices.ts`
- channel-name validation: `lib/channel-name.ts`
- display-name and RTC account identity: `lib/rtc-identity.ts`

## Key Files

- `components/channel-experience.tsx` - named join and abortable token request
- `components/channel-experience-loader.tsx` - SSR-compatible experience and playback guard
- `components/join-channel.tsx` - display-name and invitation form
- `components/call-view.tsx` - waiting and peer-present call layout
- `components/invite-button.tsx` - invitation copy and user feedback
- `app/api/token/route.ts` - initial named account token and same-account renewal
- `components/channel-call.tsx` - original joining/call presentation
- `components/agora-runtime-loader.tsx` - browser-only dynamic boundary
- `components/agora-runtime.tsx` - page-scoped provider, RTC hooks, renewal and players
- `scripts/doctor.mjs` - local runtime and environment checks
- `ARCHITECTURE.md` - canonical runtime and ownership model
- `docs/ai/RECIPE.md` - extension points, invariants, and stable contracts

## Patterns And Anti-Patterns

- Keep RTC imports in client code and App Certificate reads in server code.
- Keep a single provider client and hook-owned RTC lifecycle; do not duplicate token builders.
- Keep channel identity in the URL; do not add persistence without an explicit scope decision.
- Keep visible UI copy operational and use Lucide icons for familiar controls.
- Do not treat build, HTTP, token issue, or single-client join as remote media proof.

## RTC Invariants

1. Keep `NEXT_AGORA_APP_CERTIFICATE` server-side only. Never return, log, screenshot, or bundle it.
2. Generate RTC-only tokens with `RtcTokenBuilder.buildTokenWithUserAccount` and `RtcRole.PUBLISHER`.
3. Pass relative `3600` seconds for token and privilege expiration. Do not pass an epoch timestamp.
4. Use the same `channelName` and string `userAccount` for token generation, `client.join`, and renewal.
5. Let `useJoin` own join and leave; do not manually leave its client.
6. Subscribe to audio and video independently before rendering or playing remote tracks.
7. Keep exactly one provider client per mounted channel session and activate hooks after the initial Strict Mode replay.
8. Let React SDK hooks own unpublish and local-track cleanup; do not close their tracks manually.
9. A missing camera or microphone must not block the other available media type.
10. Do not add RTM, chat, AI agents, recording, screen sharing, authentication, or persistence without an explicit scope decision.
11. Do not request camera or microphone access before the user selects **Join Call**.
12. Keep `pnpm dev` on the Next.js default Turbopack runtime; forcing Webpack can
    reload active channel clients during cold cross-browser route compilation.
13. Keep audio and video players under `TrackBoundary` and pass stable player
    configuration objects so React re-renders do not interrupt active playback.
14. Suppress only the browser's exact expected `AbortError` for a `play()` call
    interrupted by RTC teardown; surface every other unhandled rejection.

15. Preserve the original UI and display conditions. The first server HTML contains
    only the join form; SSR support must not make the call interface appear early.
16. Keep presentation outside `ssr: false`; isolate only Agora runtime imports.
    Keep the provider mounted across leave/rejoin and hooks scoped to credentials.
17. Video player portals retain the shared TrackBoundary. Do not change tile
    dimensions, track ownership or player configuration while changing rendering.

## UI Contract

- The current `agent-quickstart-nextjs` rendered UI is the first visual reference.
- Preserve its cool page background, dark interaction surface, Agora cyan CTA, Lucide icon style, in-call header, and Powered by Agora attribution.
- Keep local and remote video tile dimensions stable between waiting and peer-present states.
- Keep invitation actions visible before join and while waiting for a participant.
- Use system-selected devices by default; keep manual device selection available behind settings.
- Use icons and tooltips for familiar call controls. Keep visible text operational, not tutorial copy.
- Update README screenshots whenever material UI changes make existing evidence stale.

## Verification

Use doctor, lint, typecheck, focused tests, and production build as the canonical repository
checks. Validate runtime behavior at the layer changed, and keep two-client
bidirectional audio and video as the complete RTC First Success gate.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm run doctor
pnpm dev
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify
```

If pnpm 9.15.9 is unavailable, install with
`npm install --package-lock=false` and run scripts with `npm run <script>`.
Do not invoke pnpm through npx or generate `package-lock.json`.

Docker commands and environment ownership are documented in README.

## Verification Safety

- Doctor, lint, typecheck, and build may use obviously synthetic credentials.
- Docker build, startup, and HTTP smoke may use synthetic credentials and prove packaging only.
- A browser join requires real credentials, network access, and device permission.
- Complete RTC success requires two independent clients with different user accounts in the same channel and observed audio and video receipt in both directions.
- Never print, commit, screenshot, or bake a real App Certificate into an image.

## Done Criteria

1. Run the narrowest relevant static or runtime check.
2. Run `pnpm run verify` for shipped changes.
3. Build and start the production image when runtime or packaging can change.
4. Update README, ARCHITECTURE, AGENTS, RECIPE, and affected L1 docs when their contracts change.
5. State static, packaging, single-client, and complete RTC evidence separately.

## Git Conventions

- Use conventional commits: `type: description` or `type(scope): description`.
- Use lowercase, present-tense descriptions.
- Do not add AI attribution trailers.
- Do not use `--no-verify`.
- A request to edit does not authorize commit, push, or another remote write.

## Documentation Synchronization

When a route, environment key, lifecycle rule, UI workflow, success condition,
or deployment boundary changes, update its owning document and every summary
that links to it. Keep README, ARCHITECTURE, RECIPE, affected L1 files, CI, and
Docker behavior consistent.

## Deployment Boundary

Vercel and Docker deployments are public development demos unless application
access controls are added. The token route has no login, channel authorization, or
rate limiting. Never describe it as a production token service. Production use
requires authentication, channel authorization, server-controlled identity and
role, abuse controls, and monitoring.
