# 07 Gotchas

> High-impact pitfalls, known failure modes, and operational lessons.

## Setup Pitfalls

- Node or pnpm versions can drift from `.nvmrc` and `packageManager`.
- A missing or mismatched pnpm does not require installing pnpm; use
  `npm install --package-lock=false` and `npm run <script>`.
- Empty environment values fail doctor and token requests.
- Browser permission denial can leave only one or no local media tracks.
- Two browser contexts may be unable to capture one camera simultaneously.

## Runtime Pitfalls

- Both clients must use the exact same room URL and different numeric UIDs.
- Audio autoplay can be blocked outside a user gesture flow.
- Audio and video trigger separate publication events.
- Renewal must reuse the joined room and UID.
- Missing stop/close cleanup can retain camera and microphone device locks.
- A public demo token route has no login, room authorization, or rate limiting.

## Documentation Or Contract Drift

Keep package scripts, environment names, token fields, expiration, Docker port,
and deployment modes synchronized. Build, HTTP, token issue, and single-client
join are frequently overclaimed as complete RTC success; require independent
bidirectional media evidence.

## Related Deep Dives

None.
