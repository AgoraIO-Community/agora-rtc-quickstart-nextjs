# React SDK Migration: Update Checklist

## Context and Evidence

The teammate recommends using `agora-rtc-react` for React-based quickstarts and
points to the Agents NextJS example for Strict Mode double-mount protection and
Next.js dynamic loading. The feedback identifies integration practices; it does
not report that either failure has occurred in this quickstart.

This checklist is based on source inspection, not a current browser reproduction
or two-client media test. The SDK migration is a confirmed direction; the exact
implementation and acceptance evidence remain to be worked out before shipping.

## Update Checklist

1. **SDK selection and lifecycle ownership - migration decided.** Replace the
   direct `agora-rtc-sdk-ng` application integration with `agora-rtc-react` hooks
   and provider. Define exactly one owner for client creation, join/leave,
   publish/unpublish, local tracks, and remote playback. Do not retain a parallel
   manual `RtcSession` lifecycle. Keep the existing room URL, token contract,
   string user account, and user-facing call workflow unless a separate change
   is approved.

2. **React Strict Mode and remounts - preventive migration check, not a reported
   current failure.** Follow the Agents NextJS example where its mount-time hook
   behavior applies. Ensure development double mounts do not create duplicate
   clients, joins, or device tracks. Check genuine navigation away and back as
   well as the Strict Mode development cycle. Current join is initiated by an
   explicit click; there is no observed duplicate-join incident here.

3. **SSR and hydration - preserve and verify an existing boundary.** The room
   currently loads its RTC component through a Client Component with
   `next/dynamic` and `ssr: false`. Keep the React SDK provider and all
   browser-only imports inside that boundary. Verify a Next.js build and real
   browser hydration after migration. The feedback does not establish a current
   hydration failure.

4. **Async join cancellation and cleanup - separate source-inferred risk.** If
   the user navigates away while the token request or SDK join is pending, the
   current manual flow may continue after unmount. Validate that scenario and
   ensure the new flow cannot start or retain an orphan session, including after
   a failed join. This is not a failure reported by the teammate and has not
   been reproduced in a browser in this review.

5. **RTC behavior parity - migration acceptance.** Preserve token renewal with
   the joined room and user account; independent audio and video handling;
   audio-only/video-only operation if one device fails; post-Join Call media
   access; mute, device selection, remote leave, and resource release. Avoid
   introducing agent, RTM, recording, authentication, or persistence features.

6. **Verification and documentation - ship criteria.** Add focused regression
   coverage for lifecycle and failure boundaries, run doctor/lint/typecheck/build
   through `pnpm run verify`, and test the changed workflow in a browser.
   Static checks and a single-client join do not establish complete RTC success:
   verify bidirectional remote audio and video from two independent clients with
   different accounts in the same room. Synchronize README, ARCHITECTURE,
   AGENTS, RECIPE, affected L1 documents, dependency declarations, and any
   screenshots made stale by a material UI change.

## Scope Boundary

This document inventories work; it does not authorize a commit, push, PR,
deployment, or other remote write. Items 2 and 3 are safeguards to retain during
the migration, not diagnoses of existing production incidents. No runtime media
result is claimed here.
