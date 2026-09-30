# Immersive Worlds Implementation Plan

**Goal:** Replace placeholder interactions with four calm, controllable local experiences.

**Architecture:** Extend validated ExperienceSpec with a ripple activity. Keep session state in React and share authored scene SVG between cards and dialogs. Use the existing dialog and bounded clock.

**Tech Stack:** Next.js, React, TypeScript, CSS/SVG, Zod, Vitest, Playwright. No new dependencies.

- [x] Add failing unit expectations for four allowlisted bilingual worlds, no-hold ocean and rejected mismatched ripple spec. Run `npm test -- tests/experiences.test.ts` and observe missing fourth-world failure.
- [x] Add browser scenarios for sequential grounding/skip, still/drift controls, reduced motion and ripple keyboard/pointer/clear/reset behavior. Run against the existing production build to establish failures before UI implementation.
- [x] Extend `domain/worlds/types.ts`, `spec.ts`, `seed.ts` with bounded ripple metadata and zero-hold ocean. Re-run unit tests.
- [x] Create `components/worlds/WorldScene.tsx` for authored SVG scenery and `RippleField.tsx` for capped ephemeral ripples. Update `WorldExperience.tsx` with sequential grounding, preference controls, completion and semantic progress. Update cards in `app/page.tsx` to reuse scenery and localize categories.
- [x] Replace the obsolete scene CSS with `components/worlds/worlds.css`: responsive spacious scenery, high contrast controls, paused motion and a system reduced-motion fallback.
- [x] Run `npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`; inspect desktop/mobile screenshots. Request an independent code review, fix material issues, commit and open a PR closing issue #5.
