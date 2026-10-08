# Ocean sound design and implementation plan

User authorized optional ocean sounds and publication of the polished Worlds. Sound starts off, uses a locally served, attributed field recording, and plays only after a deliberate user action. Sound enable begins the session; session pause, hidden tab, completion, reset and close stop playback. Still visuals remain independent from sound. A volume slider controls a Web Audio gain node, including mobile devices whose media-element volume cannot be changed. No audio preferences or interaction data are saved. English/Spanish labels, loading/error feedback and visible keyboard focus are required.

1. Add failing asset-prefix contract and browser tests for silent defaults, playback, volume, pause/resume, cleanup and failures.
2. Prepare a bounded seamless MP3 loop from the reviewed CC BY 3.0 recording, with attribution and transformation notes.
3. Add OceanSound and connect it to the existing session lifecycle. Keep audio resources isolated, request cancellable and cleanup deterministic.
4. Record the Worlds acceptance standard in DESIGN_SYSTEM and AGENTS; authored composition, restrained responsive motion, optional sensory modalities, local assets, mobile/keyboard/still/fallback checks, privacy and attribution.
5. Run unit/type/build/desktop-mobile checks, independent review, update PR #14, wait for CI, merge the approved release and verify deployed Pages.
