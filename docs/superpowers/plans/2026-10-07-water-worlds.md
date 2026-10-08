# Water Worlds Implementation Plan

**Goal:** Deliver two polished responsive water prototypes using reviewed local artwork.

**Architecture:** A continuous session clock drives both semantics and rendering. Pure water math bounds inputs and supplies the reference waveform. One WebGL component owns graphics resources and fallback. Ocean and pool share rendering, assets and composition.

**Tech Stack:** Existing Next.js/React/TypeScript, native WebGL, SVG/CSS, compressed WebP, Vitest and Playwright. No additional runtime dependencies.

- [x] Add failing domain tests in `tests/water.test.ts` for fractional breath envelope, continuous clock clamp/pause semantics, wave superposition/decay and capped positions. Verify missing-feature failures.
- [x] Add failing browser scenarios in `tests/e2e/water-worlds.spec.ts` for smooth pause, keyboard placement, drag, still mode and GPU fallback. Existing tests retain exit/privacy/completion coverage.
- [x] Add `domain/worlds/water.ts`, update `useExperienceClock.ts` to preserve fractional time, and test continuity.
- [x] Save reviewed optimized artwork in `public/worlds/` with provenance and prompt documentation. Update World cards to reuse these assets.
- [x] Add `waterShader.ts`, `WaterCanvas.tsx` and `waterArtwork.ts`; allocate one canvas with capped pixels, continuous shared time, explicit resource cleanup, static fallback and context loss handling.
- [x] Update `RippleField.tsx`, `WorldExperience.tsx`, `WorldScene.tsx` and `worlds.css` for immersive composition and bounded keyboard/touch input. Keep all controls bilingual and mobile readable.
- [x] Run unit/typecheck/Pages build/browser tests, inspect screenshots and measure frame behavior. Prove new tests catch missing guarantees. Independent review, fixes, commit and PR closing the tracking issue.
