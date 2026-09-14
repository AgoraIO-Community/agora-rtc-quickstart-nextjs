# Contributing To Agora RTC Next.js Quickstart

## Development Setup

Use Node.js 22.x or 24.x with pnpm 9.15.9 preferred and npm supported for
First Success. Both Node LTS lines run in CI; `.nvmrc` selects Node 22 as the
default. Follow [README.md](README.md) to install dependencies and create
`.env.local`. Real credentials are needed only for live RTC checks; static
checks and builds may use obviously synthetic values.

## Development Workflow

1. Inspect the current branch and worktree before editing.
2. Make the narrowest change that satisfies the requested behavior.
3. Run the narrowest relevant static or runtime check for the changed behavior.
4. Run `pnpm run verify` before declaring implementation work complete.
5. Build and start the Docker image when a change can affect packaging or the
   production runtime.
6. Update the documents that own changed workflows or contracts.

## Coding Standards

- Use TypeScript and existing Next.js App Router patterns.
- Keep the RTC SDK import in client code and App Certificate access in server code.
- Register Agora event handlers before join.
- Handle audio and video publication independently.
- Keep token, join, and renewal identity consistent.
- Release every owned media track and client resource.
- Preserve partial-media behavior when one device is unavailable.

## Verification

Run the canonical project check before review. It covers doctor, lint,
typecheck, and the production build:

```bash
pnpm run verify
```

For Docker-affecting changes, build the production image, start it with
synthetic environment values, and verify the home page over HTTP. These checks
do not prove RTC media.

## Documentation Changes

Update README for user workflows, ARCHITECTURE for topology and ownership,
AGENTS for coding-agent constraints, RECIPE for extension contracts, and the
affected L1 documents. Keep command, environment, interface, and Docker details
consistent across their owners.

## Pull Requests

Keep changes scoped, explain user-visible and contract changes, include focused
and canonical verification results, and state whether Docker and live RTC were
verified. Do not report single-client join or HTTP startup as complete
bidirectional RTC success.

## Security Reports

Report suspected vulnerabilities privately to the repository owner through an
approved private GitHub security or maintainer contact channel. Do not disclose
credentials or exploitable details in a public issue.
