# Development Route Warmup Implementation Plan

> **For agentic workers:** Execute task-by-task with a red-green-refactor loop.

**Goal:** Prevent cold Next.js development route compilation from resetting an active RTC room.

**Architecture:** A small client gate warms `/` before mounting `RoomExperience` in development. Production renders the room immediately, and warmup failure cannot block the page permanently.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Testing Library.

---

### Task 1: Development warmup gate

**Files:**
- Create: `components/dev-route-warmup.tsx`
- Create: `tests/dev-route-warmup.test.tsx`
- Modify: `components/room-experience-loader.tsx`

- [ ] **Step 1: Write the failing development behavior test**

Render the gate with `enabled`, a deferred fetcher, and visible child content.
Assert that `/` is requested with `cache: 'no-store'` and the child remains
hidden until the request resolves.

- [ ] **Step 2: Run the focused test and verify RED**

Run `n exec 22.22.1 pnpm test -- tests/dev-route-warmup.test.tsx` and expect the
missing component import to fail.

- [ ] **Step 3: Implement the gate**

Implement `DevRouteWarmup` with `enabled`, optional `fetcher`, and children.
When enabled, request `/`, settle two animation frames in `finally`, and then
render children. Render the existing RTC loading surface while waiting.

- [ ] **Step 4: Add and pass production and failure tests**

Assert disabled mode renders immediately without fetch, and a rejected fetch
still releases the gate. Run the focused test until all cases pass.

### Task 2: Runtime integration and verification

**Files:**
- Modify: `components/room-experience-loader.tsx`
- Modify: `README.md`
- Modify: `ARCHITECTURE.md`
- Modify: `docs/ai/L1/05_workflows.md`
- Modify: `docs/ai/L1/07_gotchas.md`

- [ ] **Step 1: Wrap the room dynamic import**

Render `RoomExperience` inside `DevRouteWarmup` with
`enabled={process.env.NODE_ENV === 'development'}`.

- [ ] **Step 2: Synchronize the development workflow docs**

Document that direct room entry precompiles `/` before exposing Join Call and
that this protects active RTC state from first-route development refreshes.

- [ ] **Step 3: Run complete static verification**

Run `n exec 22.22.1 pnpm run verify` and require lint, typecheck, all tests, and
the production build to pass.

- [ ] **Step 4: Run the cold development browser acceptance**

Cold-start `pnpm dev`; open a room directly in Chrome A and join; open `/` for
the first time in Safari B; verify Chrome A remains in the call and Connected.

- [ ] **Step 5: Inspect and commit**

Run `git diff --check`, inspect the scoped diff, and commit with
`fix: preserve calls during dev route compilation`.
