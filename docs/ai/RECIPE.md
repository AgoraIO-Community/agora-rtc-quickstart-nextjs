---
recipe_version: 1.0.0
recipe_status: active
extension_points:
  - id: ui-experience
    name: Room and call user experience
  - id: application-access-control
    name: Application authentication and room authorization
invariants:
  - id: server-only-certificate
    summary: Keep the App Certificate in the server process.
  - id: rtc-identity-consistency
    summary: Use one room ID and numeric UID for token, join, and renewal.
  - id: rtc-resource-cleanup
    summary: Register before join and release every owned track and client.
stable_contracts:
  - id: token-route
    summary: POST /api/token issues and renews RTC publisher credentials.
  - id: verification-command
    summary: pnpm run verify is the canonical project check.
---

# Quickstart Recipe Profile

## Recipe Role

- Role: `base` RTC Web quickstart recipe.
- Target audience: developers establishing first one-to-one RTC success in Next.js.
- Reuse model: clone, configure, run, verify, then customize documented extension points.

## Recipe Scope

The baseline creates UUID room URLs, exposes invitation actions before join and
while waiting, prepares partial local media from system-selected devices, issues
server-side RTC publisher tokens, joins and publishes on explicit user action,
subscribes to remote audio and video, renews tokens, and releases resources.

## Baseline Implementation Guidance

Treat this repository's source and [ARCHITECTURE.md](../../ARCHITECTURE.md) as the
baseline. Preserve the direct RTC SDK lifecycle, token route, environment names,
room identity, command semantics, and evidence levels. Do not recreate join or
token behavior from memory.

## Extension Points

- `ui-experience`: change `components/` and `app/` presentation while preserving
  explicit join, stable media tiles, lifecycle ownership, and UI tests. Run the
  affected component tests and `pnpm run verify`.
- `application-access-control`: add login, room authorization, identity, role,
  rate limiting, and abuse controls around `app/api/token/route.ts`. Update token
  tests, README, ARCHITECTURE, interfaces, security, and deployment docs.

## Invariants

- `server-only-certificate`: only the Next.js server reads `NEXT_AGORA_APP_CERTIFICATE`.
- `rtc-identity-consistency`: token issue, join, and renewal use one room ID and numeric UID.
- `rtc-resource-cleanup`: register handlers before join; unpublish, stop, close, and leave during idempotent cleanup.
- Audio and video publication events are independent.
- One missing media device does not block the other available media type.
- System-selected devices are the default path; manual device selection remains optional.

## Stable Contracts

- `POST /api/token` accepts `{ roomId, uid? }` and returns `appId`, `roomId`, `uid`, `token`, and `expiresIn` under `Cache-Control: no-store`.
- `.env.local` uses `NEXT_PUBLIC_AGORA_APP_ID` and server-only `NEXT_AGORA_APP_CERTIFICATE`.
- `pnpm run verify` is the canonical lint, typecheck, test, and build command.
- Docker runs standalone Next.js on port 3000 and never bakes the certificate into the image.

## Internal / Subject To Change

Component composition, CSS, local phase representation, device-list rendering,
and helper function boundaries may change when their owned contracts and tests
remain satisfied.

## Consumer Onboarding Recipe

```bash
pnpm install --frozen-lockfile
cp env.local.example .env.local
pnpm run doctor
pnpm dev
```

When pnpm 9.15.9 is unavailable, install with
`npm install --package-lock=false` and run scripts with `npm run <script>`.
Do not invoke pnpm through npx or create a second lockfile.

Copy the invite link before joining, then join once for the supported single-client
state. Use the exact same room URL from a second independent client and verify
audio and video receipt both ways.
Run `pnpm run verify` before shipping a customization.
