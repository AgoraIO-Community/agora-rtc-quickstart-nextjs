# 01 Setup

> Setup, environment, commands, and verification safety for this quickstart.

## Prerequisites

- Node.js 22.x or 24.x and pnpm 9.15.9; both Node lines run in CI
- npm/npx from Node.js when pnpm 9.15.9 is not already available
- Docker for image build and startup verification
- an Agora App ID and App Certificate for live RTC
- browser camera and microphone permission for media checks

## Environment

Copy `env.local.example` to `.env.local`.

| Variable | Exposure | Owner |
| --- | --- | --- |
| `NEXT_PUBLIC_AGORA_APP_ID` | Public project identifier | Build and Next.js runtime |
| `NEXT_AGORA_APP_CERTIFICATE` | Server-only secret | Next.js token route runtime |

Synthetic values are sufficient for static checks and packaging. Real values
are required for token validity and RTC media. Never print or commit the certificate.

## Setup

```bash
pnpm install --frozen-lockfile
cp env.local.example .env.local
pnpm run doctor
```

Fallback without a global pnpm installation:

```bash
npx --yes pnpm@9.15.9 install --frozen-lockfile
cp env.local.example .env.local
npx --yes pnpm@9.15.9 run doctor
```

## Development

```bash
pnpm dev
pnpm run start
pnpm run test:watch
```

## Verification

```bash
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
pnpm run verify
```

Docker uses the build and run commands in [README.md](../../../README.md).
Single-client join is separate from two-client bidirectional media success.

## Verification Safety

Static and Docker checks may use synthetic credentials and do not prove RTC.
Live checks require real credentials, network, browser, and device access.
Complete success requires different UIDs in one room and observed audio and video
receipt in both directions.

## Related Deep Dives

None.
