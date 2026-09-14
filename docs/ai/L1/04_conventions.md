# 04 Conventions

> Coding, verification, logging, and implementation conventions.

## Code Style

Use TypeScript, Next.js App Router patterns, existing path aliases, and existing
ESLint rules. Keep RTC SDK access in client modules and secrets in server modules.

## Runtime Patterns

Register events before join. Handle `user-published` separately for audio and
video. Keep one client per mounted room and one room/user account across token
and renewal. Join before creating local tracks, keep cleanup idempotent, and
preserve partial media when one device fails. Surface generic user errors
without credential data.

## Verification Patterns

Run doctor, lint, typecheck, and production build before shipping. Validate
changed runtime behavior at its owning boundary, and use two independent clients
for complete bidirectional RTC media evidence.

## Documentation Changes

Update the owning root document and every L1 summary when commands, environment,
interfaces, lifecycle, security, deployment, or success evidence changes.

## Related Deep Dives

None.
