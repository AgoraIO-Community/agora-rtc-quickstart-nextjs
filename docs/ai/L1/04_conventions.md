# 04 Conventions

> Coding, testing, logging, and implementation conventions.

## Code Style

Use TypeScript, Next.js App Router patterns, existing path aliases, and existing
ESLint rules. Keep RTC SDK access in client modules and secrets in server modules.

## Runtime Patterns

Register events before join. Handle `user-published` separately for audio and
video. Keep one client per mounted room and one room/user account across token
and renewal. Join before creating local tracks, keep cleanup idempotent, and
preserve partial media when one device fails. Surface generic user errors
without credential data.

## Testing Patterns

Mock `agora-rtc-sdk-ng` at the owned SDK/client boundary. Test event ordering,
publish and subscribe behavior, renewal identity, cleanup ordering, device
fallback, API validation, and waiting/peer-present UI states. Run focused Vitest
files during changes and `pnpm run verify` before shipping.

## Documentation Changes

Update the owning root document and every L1 summary when commands, environment,
interfaces, lifecycle, security, deployment, or success evidence changes.

## Related Deep Dives

None.
