# React SDK Migration Implementation Plan

**Goal:** Move the one-to-one room to `agora-rtc-react` without changing its token, identity, or UI contracts.

**Architecture:** The dynamically loaded room owns a single `AgoraRTCProvider` client. A mounted call component owns `useJoin`, local-track hooks, `usePublish`, remote users, renewal, and device selection. Token requests are cancelled/ignored on unmount; hooks own leave and track cleanup.

**Tech Stack:** Next.js 16, React 19, agora-rtc-react 2.5.1, pnpm 9.15.9, Node 22.22.1.

1. Update dependency and lockfile; inspect installed hook declarations and the Agents example.
2. Move client creation into the existing browser-only loader. Replace the manual `RtcSession` with hook-owned call lifecycle, preserving join-on-click and partial media.
3. Adapt video rendering and controls to React SDK tracks and remote users. Add cancellation and renewal handling without duplicating hook ownership.
4. Add focused regression coverage for token cancellation, Strict Mode/remount behavior, and session ownership where feasible.
5. Synchronize README, ARCHITECTURE, AGENTS, RECIPE, and affected L1 docs. Run `pnpm run verify`, build/package checks where available, and browser checks; report real-media limits separately.

No commit, push, PR, or deployment is authorized by this plan.
