# Development Runtime Stability Implementation Plan

> **For agentic workers:** Execute task-by-task with a red-green-refactor loop.

**Goal:** Keep an active RTC room connected during cold cross-browser development route compilation.

**Architecture:** Use Next.js 16's default Turbopack dev runtime. Lock the command with a manifest test and document Webpack as an RTC state-loss regression.

**Tech Stack:** Next.js 16, Turbopack, Vitest, Chrome, Safari.

---

### Task 1: Select and lock the stable dev runtime

**Files:** Modify `package.json`; create `tests/dev-runtime.test.mjs`.

- [x] Add a failing test requiring `scripts.dev` to equal `next dev`.
- [x] Confirm the test fails against `next dev --webpack`.
- [x] Change the script to `next dev` and rerun the test.

### Task 2: Synchronize and verify

**Files:** Modify `README.md`, `ARCHITECTURE.md`, `AGENTS.md`, `docs/ai/RECIPE.md`, and affected `docs/ai/L1/*.md`.

- [x] Document default Turbopack as the supported development runtime.
- [x] Run `n exec 22.22.1 pnpm run verify`.
- [x] Cold-start `pnpm dev`, join with Chrome, then first-open `/` in Safari.
- [x] Confirm Chrome stays Connected with navigation type `navigate`.
- [x] Commit and push the scoped change.
