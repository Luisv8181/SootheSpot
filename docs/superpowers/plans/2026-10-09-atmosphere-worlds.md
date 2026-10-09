# Soft Focus and Grounding Garden design / implementation plan

Refine the remaining two Worlds to the existing water Worlds quality standard. Soft Focus uses an original twilight clearing, with one warm light anchor composited in CSS rather than baked into the image. It is steady by default; optional slow drift remains bounded, freezes on pause/hidden/completion, and is disabled for reduced motion. Reset returns to steady light. Grounding Garden uses an original misty garden path with foreground foliage and atmospheric distance. A five-step trail reflects current/visited prompts without scoring. The real-world five-senses prompts, notice/skip/back/reset and completion semantics stay intact.

All four Worlds share the immersive layout and readable control overlays. Original local WebP assets are reused in World cards. Image failure falls back to a calm gradient. No new dependencies, external requests, interaction persistence or inferred cultural identity. English/Spanish copy and the existing audio/water lifecycle remain intact.

Affected files: components/WorldExperience.tsx, components/worlds/WorldScene.tsx, new components/worlds/AtmosphereScene.tsx and atmosphereArtwork.ts, components/worlds/worlds.css, new tests/e2e/atmosphere-worlds.spec.ts, public/worlds/{focus-clearing.webp,garden-path.webp,README.md}, docs/{EXPERIENCE_SPEC.md,DESIGN_SYSTEM.md}, this plan.

1. Write browser tests for full-screen art, steady/drift pause/reset, grounding trail state, reduced motion, missing artwork and privacy. Observe intended failures against the current export.
2. Generate and visually review two original background assets, optimize WebP with existing Sharp, record provenance/prompts.
3. Replace old SVG scenes with authored artwork plus composited focus anchor / grounding trail; use the common immersive layout, preserve session/keyboard semantics and newer Ocean freeze fix.
4. Build and run unit/type/browser checks. Inspect desktop, small phone and Spanish views. Verify motion freezes and no image/network errors. Independent review and fixes.
5. Commit, push, open and attach PR closing issue #20. Review CI before integration; the user's established publish-after-CI authorization covers this continuation of the Worlds refinements.
