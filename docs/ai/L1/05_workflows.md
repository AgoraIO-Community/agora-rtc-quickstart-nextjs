# 05 Workflows

> Common development, modification, deployment, and diagnosis workflows.

## First Success

Install, copy the environment example, add credentials, run doctor, start the
app, create a channel, copy its invite link, enter a display name, and join. Device
access starts only after Join Call and uses system-selected devices. Use settings
during the call only when manual device selection is needed. Cancel during a
pending join returns to the form and leaves an already joined channel. For
complete RTC success, join the exact channel with another name from a second tab or independent client
and verify audio and video receipt both ways.

Use the default `pnpm dev` command for development. Do not add `--webpack`:
first-time cross-browser route compilation in that runtime can reload the channel
client and clear an active in-memory RTC session.

## Modify The RTC Core Flow

Inspect `components/channel-call.tsx`, `lib/token.ts`, and the token route. Preserve the
RTC invariants, run focused runtime checks and `pnpm run verify`, and update
ARCHITECTURE, RECIPE, interfaces, gotchas, and security as affected.

## Modify The Client Or UI

Edit `components/` and `app/`, preserve explicit join and device cleanup, update
screenshots when stale, then run the canonical verification and relevant browser checks.

## Change An Interface

Update the owner, browser client, focused runtime verification, README,
ARCHITECTURE, RECIPE, and `06_interfaces.md` in one local change.

## Deploy

For Vercel, configure both environment values and verify the deployed workflow.
For Docker, build without credentials, run with both runtime values, verify
HTTP startup, then perform RTC checks separately with real credentials.

## Diagnose A Failure

Identify the exact client, channel, user account, timestamp, phase, and media direction.
Separate environment, HTTP/token, join, publish, subscribe, playback, and cleanup
evidence before naming a cause. Do not use health or static checks as media proof.

## Related Deep Dives

None.
