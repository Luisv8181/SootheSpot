# Vast Sky refinement implementation plan

**Goal:** Make the authored night sky a forgiving, accessible, private tracing experience with comfortable optional sound and user-paced endings.

**Architecture:** Preserve the local photo, Canvas 2D renderer, tactile dial and reviewed repertoire. React owns accessible controls, settings and the writing dialog; the renderer reports the next star and updates only while active. Pure text helpers own bounded Latin/Spanish glyph layout. No new dependencies, storage or network services.

**Tech stack:** Next.js, strict TypeScript, React, Canvas 2D, Web Audio, Vitest and Playwright.

## Approved design
Keep the sky's visual identity; clarify one next star with a generous target and an equivalent keyboard button. Trace at the person's pace, optionally watch a single trace, then rest without automatic repetition. Sound and vibration start off with independent controls; sound includes volume and an honest unavailable state. Pause, completion, hidden tabs and exit stop audio and continuous animation. Reduced motion preserves deliberate static feedback. Spanish accents remain in the star glyphs; unsupported scripts are explained before applying a message. Writing remains transient, with nested-dialog focus containment and Escape returning to the sky.

## Files
- components/worlds/skyEngine.ts: bounded renderer, station interactions and audio lifecycle.
- components/worlds/VastSky.tsx: accessible UI and engine integration.
- components/worlds/vastSky.css: responsive composition, focus and still feedback.
- components/WorldExperience.tsx: compact Sky guidance/session layout.
- domain/worlds/vastSkyText.ts and tests/vastSkyText.test.ts: normalization, glyphs and bounded layout.
- tests/e2e/vast-sky.spec.ts: keyboard, sound, pause, fallback, writing, privacy and localization.
- docs/EXPERIENCE_SPEC.md, docs/DESIGN_SYSTEM.md: resulting behavior and quality standard.
- This plan.

## Sequence
- [x] Add failing unit and browser tests for accents, opt-in audio, keyboard tracing and modal Escape.
- [x] Implement text helpers independently with a bounded Luna worker; primary integrates the result.
- [x] Implement accessible star target and quiet controls, user-paced trace completion and lifecycle-safe sound.
- [x] Bound effects/pixel allocation, handle missing artwork/Canvas/audio and freeze paused/hidden/still visuals.
- [x] Verify mobile/desktop and Spanish screenshots plus keyboard and privacy tests.
- [x] Run npm test, npm run typecheck, GitHub Pages npm run build and npm run test:e2e; report output.
- [ ] Review via an independent agent, create PR closing #29, wait for CI, merge under existing publication authorization and verify live deployment.

Validation: 60 unit tests passed; strict TypeScript and GitHub Pages build passed. The short-screen regression was observed failing against the prior exported build because the spacing element intercepted pointer events, then corrected with a non-interactive spacer. Independent review found no blockers. Full browser suite and release status are recorded in the PR.

Final local browser run: 80 passed (40.8s), desktop and mobile. Production route: 70.7 kB, first-load JavaScript: 174 kB.
