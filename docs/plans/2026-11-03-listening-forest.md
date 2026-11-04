# Listening Forest implementation and art direction

Approved by Luis: a richly animated explorable pixel jungle with optional calming invitations. Explicit correction: use beautiful immersive animation rather than restrained default motion. Issue #46, branch codex/listening-forest.

## Reference and design
Río Celeste in Tenorio Volcano National Park, Costa Rica: rainforest surrounding blue water and a waterfall. Official source https://sinac.go.cr/EN-US/ac/acat/pnvt/Pages/default.aspx . This is an imagined landscape, not a park map or a claim of access to protected water. Community/cultural identity is never inferred.

Four connected clearings: breathing grove, listening bridge, waterfall clearing and lantern pool. Arrow keys, direct clearing buttons and tap-to-walk. Guidance stays outside the scene. Exercises are optional, no rewards or scoring. Breathing comfort and no forcing informed by https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/ . Original invitations are not clinician-curated care.

## Architecture
Local generated panoramic pixel artwork, Canvas2D animation with independent flowing river, waterfall ribbons/spray, canopy, foliage, shafts, mist, butterflies and falling petals. Separate traveler and ephemeral lights. 30fps maximum draw cadence, raster capped at960x640,24marks. Pause/hidden/completion cancels drawing; still mode preserves deliberate navigation and static feedback. Local synthesized optional audio starts off and follows session cleanup. No network, microphone or interaction storage. English/Spanish.

Checked recent.design illustration/motion references and React Bits Pixel Snow depth/input principle; no components copied because scene-specific water, trail and lifecycle need a shared renderer. Motion Primitives TransitionPanel returned403. No dependencies added.

## Work and verification
Catalog/schema unit tests, boundary tests red then green, component/audio review, actual desktop/mobile browser checks including sound/visibility/completion/fallback/no storage, visual inspection, full unit/build/browser suite, PR and CI before release.

## Validation results
86 unit tests passed. Typecheck and Pages production build passed (195kB first load shared route total). Full desktop/mobile suite:160 passed. Final forest suite:18 passed after the isolated still-view light cleanup fix. The pointer-aspect and expired-light regressions were observed failing before their fixes. Actual pixel-change, stopped-frame, touch-coordinate, sound-failure, audio-context lifecycle, bilingual, fallback and no-storage checks included. Desktop and phone screenshots inspected. No interaction telemetry or new dependencies.
