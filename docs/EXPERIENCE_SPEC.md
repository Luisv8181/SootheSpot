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

All scenes use locally authored SVG/CSS, with no new dependencies or remote assets. Ocean uses four seconds in and six out, with no hold. Soft Focus offers a steady light or slow drift. Grounding presents one sense at a time with notice, skip, back and reset; skips do not count as noticed. Ripple Field keeps at most eight ripple positions in temporary React state. Nothing about World interactions is saved, exported, tracked or sent to a server.

Still visuals are available in each World and enforced when the device requests reduced motion. Timers are bounded and pause when the page becomes hidden. Completion disables ripple input and offers reset or exit. The shipped scenes are reviewed application components; arbitrary generated content remains unsupported and must use the future restricted sandbox.

## Future Work

Future generated Worlds should still produce an `ExperienceSpec` first. The renderer, not the model, decides what can execute.

Not supported yet:

- arbitrary custom scenes
- generated HTML or JavaScript
- audio assets
- saved/remixed Worlds
- therapist-authored Worlds
- server persistence
