# 08 Security

> Security model, secrets, authentication, trust boundaries, and mitigations.

## Trust Boundaries

The browser is untrusted and owns local devices and RTC media. The Next.js server
owns token construction and the App Certificate. Agora receives scoped token,
channel, user account, and media traffic. Vercel or the Docker host owns runtime env values.

## Secrets

`NEXT_AGORA_APP_CERTIFICATE` is server-only. Keep it out of Git, logs,
screenshots, responses, browser bundles, Docker contexts, image layers, and
untrusted previews. Use a dedicated demo project and rotate after exposure or
when a public demo is removed.

## Authentication And Authorization

Tokens use validated UUID channel names, unique ASCII string accounts containing an
encoded user-entered display name, publisher role, and 3600-second relative
expiration. Display names are visible to other channel participants. The demo has
no application login, channel authorization, server-controlled identity, or rate limiting.

## Input And Output Handling

The token route rejects malformed JSON and invalid channel/name/account input. Responses are
non-cacheable and server failures are generic. Do not add credential values to
errors, telemetry, or UI state.

## Security Reporting

Report vulnerabilities privately through an approved GitHub security or
maintainer contact channel. Do not publish credentials or exploit details in an issue.

## Related Deep Dives

None.
