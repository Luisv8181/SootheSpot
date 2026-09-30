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
- `timer`
- `completion`

The schema is intentionally strict. Unknown fields fail validation. The shipped world id determines the allowed theme, category, and core activity.

## Shipped Worlds

| World | Activity | Duration | Purpose |
| --- | --- | ---: | --- |
| Ocean Calm | Breathing rhythm | 5 min | Settle breathing without needing to count |
| Soft Focus | Visual focus anchor | 3 min | Give attention one steady place to land |
| Grounding Garden | Five-senses grounding | 4 min | Come back to the room through the senses |

## Future Work

Future generated Worlds should still produce an `ExperienceSpec` first. The renderer, not the model, decides what can execute.

Not supported yet:

- arbitrary custom scenes
- generated HTML or JavaScript
- audio assets
- saved/remixed Worlds
- therapist-authored Worlds
- server persistence
