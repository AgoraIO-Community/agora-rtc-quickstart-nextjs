# 04 Conventions

> Coding, verification, logging, and implementation conventions.

## Code Style

Use TypeScript, Next.js App Router patterns, existing path aliases, and existing
ESLint rules. Keep RTC SDK access in client modules and secrets in server modules.

## Runtime Patterns

Use the React SDK hooks for join, publication, remote subscriptions, and track
cleanup. Activate after Strict Mode's initial replay. Keep one provider client
per mounted channel and one channel/user account across token and renewal. Join before
creating local tracks and preserve partial media when one device fails. Surface generic user errors
without credential data. Keep track players under `TrackBoundary` and pass stable
video-player configuration objects.

## Verification Patterns

Run doctor, lint, typecheck, tests, and production build before shipping. Validate
changed runtime behavior at its owning boundary, and use two independent clients
for complete bidirectional RTC media evidence.

## Documentation Changes

Update the owning root document and every L1 summary when commands, environment,
interfaces, lifecycle, security, deployment, or success evidence changes.

## Related Deep Dives

None.
