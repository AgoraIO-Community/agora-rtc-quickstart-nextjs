# Join Name Without Pre-Join Implementation Plan

> **For agentic workers:** Execute task-by-task with a red-green-refactor loop.

**Goal:** Remove pre-join media capture and identify both RTC participants by user-entered display names.

**Architecture:** Encode a validated display name in a unique RTC string account. Join RTC before creating local tracks, then publish every available track and decode remote accounts for presentation.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Agora RTC Web SDK, agora-token, Vitest, Testing Library.

---

### Task 1: RTC identity contract

**Files:** Create `lib/rtc-identity.ts`; modify `lib/token.ts`, `app/api/token/route.ts`, `lib/token-client.ts`; test `tests/room-id.test.ts` and `tests/token-route.test.ts`.

- [x] Add failing tests for display-name validation, unique account generation, reversible decoding, initial token issue, and same-account renewal.
- [x] Run focused tests and confirm contract failures.
- [x] Implement the account codec and account-based token generation.
- [x] Run focused tests and confirm they pass.

### Task 2: Join-before-capture lifecycle

**Files:** Modify `lib/rtc-session.ts`, `components/room-experience.tsx`; test `tests/rtc-session.test.ts`.

- [x] Add a failing test that asserts event registration, RTC join, media creation, and publication order.
- [x] Add a failing test that asserts zero-track creation leaves only the new session and reports a device error.
- [x] Refactor `RtcSession` to own post-join media creation and preserve partial media.
- [x] Run the RTC session tests after each behavior reaches green.

### Task 3: Named join UI

**Files:** Create `components/join-room.tsx`; modify `components/room-experience.tsx`, `components/call-view.tsx`; remove `components/pre-join.tsx`; test `tests/starter-ui.test.tsx`.

- [x] Add a failing UI test proving the initial room page has a name field and does not initialize media.
- [x] Add failing UI tests for required names and local/remote name labels.
- [x] Implement the join form and connected-name presentation.
- [x] Run the starter UI tests after each behavior reaches green.

### Task 4: Contract documentation and complete verification

**Files:** Modify `README.md`, `ARCHITECTURE.md`, `AGENTS.md`, `docs/ai/RECIPE.md`, and affected `docs/ai/L1/*.md` files.

- [x] Update identity, lifecycle, workflow, interface, gotcha, security, and evidence contracts.
- [x] Run focused identity, token, session, and UI tests.
- [x] Run `n exec 22.22.1 pnpm run verify`.
- [x] Start the production build and verify two isolated browser clients show each other's names and remain connected.
- [x] Inspect the final diff and confirm no credential, debug instrumentation, or unrelated change is present.
