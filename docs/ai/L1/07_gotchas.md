# 07 Gotchas

> High-impact pitfalls, known failure modes, and operational lessons.

## Setup Pitfalls

- Node or pnpm versions can drift from `.nvmrc` and `packageManager`.
- A missing or mismatched pnpm does not require installing pnpm; use
  `npm install --package-lock=false` and `npm run <script>`.
- Empty environment values fail doctor and token requests.
- Browser permission denial after Join Call can leave only one or no local media tracks.
- Browser and operating-system device sharing determines whether two tabs can capture the same physical camera and microphone.
- `next dev --webpack` can reload an active room when another browser first
  compiles `/`; keep the default Turbopack development runtime.

## Runtime Pitfalls

- Both clients must use the exact same room URL and different string user accounts.
- Audio autoplay can be blocked outside a user gesture flow.
- Audio and video trigger separate publication events.
- Renewal must reuse the joined room and user account.
- Opening an invitation must not request local devices; capture begins only after Join Call.
- Activating RTC hooks during Strict Mode's initial effect replay can duplicate joins or tracks.
- Do not manually leave or close tracks owned by React SDK hooks.
- Abandoning a pending token request must not start a call after unmount.
- A public demo token route has no login, room authorization, or rate limiting.

## Documentation Or Contract Drift

Keep package scripts, environment names, token fields, expiration, Docker port,
and deployment modes synchronized. Build, HTTP, token issue, and single-client
join are frequently overclaimed as complete RTC success; require independent
bidirectional media evidence.

## Related Deep Dives

None.
