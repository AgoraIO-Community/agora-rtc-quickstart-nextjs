# 03 Code Map

> Directory and module responsibilities for navigating this quickstart.

## Directory Tree

```text
app/          Next.js pages and token API
components/   named join, in-call, controls, devices, and visual shell
lib/          channel identity, tokens, devices, and RTC lifecycle
scripts/      local environment doctor
public/       Agora marks and favicon
.github/      CI, Docker CI, and README assets
docs/ai/      progressive coding-agent context
```

## Core Files

- `app/api/token/route.ts`: HTTP token contract
- `components/channel-experience.tsx`: named join and abortable entry request
- `components/channel-call.tsx`: server-rendered connecting/call presentation
- `components/agora-runtime.tsx`: persistent provider, RTC hooks, devices and players
- `components/agora-runtime-loader.tsx`: browser-only dynamic boundary
- `components/channel-experience-loader.tsx`: SSR join experience
- `components/join-channel.tsx`: display-name and invitation form
- `lib/token.ts`: publisher token construction
- `lib/media-devices.ts`: device switching and change listeners
- `lib/channel-name.ts`: UUID channel-name validation
- `lib/rtc-identity.ts`: display-name validation and string account encoding
- `next.config.mjs`: Next.js and standalone build configuration

## Ownership Map

README owns user operation, ARCHITECTURE owns topology, AGENTS owns Agent
constraints, RECIPE owns extension contracts, CI owns canonical project checks,
and Dockerfile plus Docker workflow own container packaging.

## Related Deep Dives

None.
