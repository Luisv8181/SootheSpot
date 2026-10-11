# Living Light strumming implementation plan

Goal: make the existing light material playable as a gentle eight-string instrument, as requested by Luis.

Architecture: shared sampled geometry identifies crossed strings; the renderer provides bounded visual resonance and returns note identities to the interaction component. A local Web Audio instrument owns eight transient voices and an explicit sound/volume control. No recordings, stored gestures, network requests, dependencies or cultural identity assumptions.

- [x] Write crossing and browser behavior tests, verify failures before implementation.
- [x] Add bounded geometry crossing helper and an eight-note pentatonic palette.
- [x] Integrate pointer crossings, taps, arrows and number keys with rendering; retain bloom and pinch shaping.
- [x] Replace ambient drone with short plucked voices; bound voice count, replay rate and amplitude. Dispose on pause, hidden, completion, off, reset and exit; resume requires explicit action.
- [x] Keep fallback and still-mode deliberate visual feedback, English/Spanish instructions and controls below scene.
- [x] Run final validation, inspect desktop/phone visuals and obtain independent review.

Release follows the reviewed PR and CI gates; issue #39 tracks this upgrade.
