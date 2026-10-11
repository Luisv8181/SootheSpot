# SootheSpot ExperienceSpec

SootheSpot Worlds now ship as bounded `ExperienceSpec` records instead of unconstrained UI branches.

The goal is to make Worlds feel more polished while preserving the product boundary:

- no generated HTML in the application shell
- no arbitrary scripts
- no network-capable generated code
- no clinical claims
- bilingual copy for the shipped user path
- deterministic timers and activity state
- explicit provenance

## Current Spec

Each World includes:

- `version: 1`
- allowlisted `id`
- allowlisted `theme`
- allowlisted `category`
- English and Spanish `title`, `description`, and `purpose`
- `durationMinutes` from 1 to 10
- `provenance: "soothespot"`
- ordered activity blocks

Supported activity blocks:

- `ambientScene`
- `breathRhythm`
- `focusVisual`
- `groundingPrompt`
- `rippleInteraction`
- `glassInteraction`
- `timer`
- `completion`

The schema is intentionally strict. Unknown fields fail validation. The shipped world id determines the allowed theme, category, and core activity.

## Shipped Worlds

| World | Activity | Duration | Purpose |
| --- | --- | ---: | --- |
| Ocean Calm | Breathing rhythm | 5 min | Settle breathing without needing to count |
| Soft Focus | Visual focus anchor | 3 min | Give attention one steady place to land |
| Grounding Garden | Five-senses grounding | 4 min | Come back to the room through the senses |
| Ripple Field (experimental) | Touch / keyboard ripples | 3 min | Explore a quiet pool of light |
| Vast Sky | Constellation / word tracing | 5 min | Give attention a deliberate path |
| Quiet Rain | Touch / keyboard glass clearing | 4 min | Let hands slow down without a goal |

Soft Focus and Grounding Garden use reviewed original local artwork with authored CSS light and sensory-trail overlays. Both fill the viewport with readable controls. Soft Focus starts with a steady light and offers bounded slow drift; pause, hidden tabs and completion freeze it, while Reset returns to steady. The Garden trail represents prompt position, not a score. Artwork failure retains a calm gradient and the activity controls. Ocean and Ripple use reviewed original raster artwork with native WebGL refraction, with no new runtime dependencies or remote assets. Artwork provenance and prompts are recorded in public/worlds/README.md. Water rendering is capped at 900,000 pixels and 30 frames per second and stops on pause, hidden tabs, completion or still mode. Unsupported or lost graphics contexts show the static artwork; unavailable artwork shows a calm gradient. Ocean uses four seconds in and six out, with no hold. Soft Focus offers a steady light or slow drift. Grounding presents one sense at a time with notice, skip, back and reset; skips do not count as noticed. Ripple Field supports tap, drag, arrow keys and Enter/Space. It keeps at most eight ripple positions in temporary React state; waves overlap and expire after twelve seconds of session time. Nothing about World interactions is saved, exported, tracked or sent to a server.

Still visuals are available in each World and enforced when the device requests reduced motion. Timers are bounded and pause when the page becomes hidden. Completion disables ripple input and offers reset or exit. The shipped scenes are reviewed application components; arbitrary generated content remains unsupported and must use the future restricted sandbox.

Ocean Calm offers optional local shoreline audio with bilingual sound and volume controls. Sound starts off and loads only on request. It pauses with the session and when hidden, and is released on reset, completion or exit. Playback errors are visible and never block the visual activity. No audio preferences are persisted.

## Future Work

Future generated Worlds should still produce an `ExperienceSpec` first. The renderer, not the model, decides what can execute.

Not supported yet:

- arbitrary custom scenes
- generated HTML or JavaScript
- user-supplied audio assets
- saved/remixed Worlds
- therapist-authored Worlds
- server persistence


Vast Sky uses a reviewed local night-sky photograph with Canvas 2D star lettering and constellations. Users can tap or drag near the next star, use its keyboard button, choose a station with the dial, or watch one optional autoplay trace. Completed traces remain visible until the user restarts. At Luis's explicit request, sound and gentle vibration start enabled in Vast Sky; sound has a volume control and unavailable state. Audio initializes on tracing or an explicit autoplay/sound action, rather than creating a context at mount. Turning either setting off holds for this visit; reset restores enabled defaults. Pause or hidden tabs close the audio context while retaining the preference, and visibility alone never restarts sound. Supported devices provide brief vibration during tracing; still mode suppresses vibration. Audio closes on pause, hidden tabs, session completion and exit. Still mode keeps deliberate star feedback without continuous animation. Canvas is capped at 2,000,000 physical pixels, with 80 background stars, eight simultaneous notes and 40 free-trace links. Missing Canvas or artwork retains accessible tracing controls and a gradient fallback. Writing is limited to 48 characters, supports accented Latin glyphs including Spanish accents, explains unsupported characters before applying, and stays transient. Nested writing and sound dialogs contain keyboard focus and close independently with Escape.


Quiet Rain uses separate local landscape/portrait artwork and bounded Canvas 2D glass clearing. Drag or use arrows plus Enter/Space; instructions sit below the scene. Up to 120 transient clear marks fade over 24 active visual seconds; still mode freezes fog and droplets while retaining deliberate clearing. Ninety-six droplets, 1,500,000 physical pixels and 30fps are upper bounds. Animation stops before Start, when paused/hidden, on completion or in still mode. Canvas or artwork failures preserve a static image or gradient with an honest explanation. Optional soft rain starts off and is synthesized locally in a two-second buffer. Sound suspends on pause/hidden, resumes with explicit Resume, and is disposed on off/reset/completion/exit. No interactions or media preferences are saved.
