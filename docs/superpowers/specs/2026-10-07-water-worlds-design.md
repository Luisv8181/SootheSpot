# Water Worlds

Approved in chat after researching Portal framing, Rive interaction states, Three.js water and the creator's Sleepers atmosphere breakdown. Scope: polish Ocean Calm and Ripple Field as flagship prototypes.

Ocean: original cinematic sunset shoreline, apricot light, teal water, misty distant mountains. A continuous four-in/six-out tide shares the session clock with breathing text. The scene fills the experience with controls over a stable dark scrim. Pause freezes its exact position; reset returns to the beginning.

Ripple: original overhead natural pool, textured sand, reflected foliage and warm caustics. Taps and deliberate dragging place bounded waves. Waves superpose, refract the picture and decay. Arrow keys move a visible placement point; Enter/Space places a wave. Clear removes all waves. Eight waves maximum, no saved pointer positions.

Rendering: one locally authored WebGL plane and a compressed local artwork per open experience, no third-party rendering dependencies. Cap pixels at 900,000 and frames at 30/sec. Cards use the still artwork. Reduced motion disables continuous rendering and presents static touch feedback. Lost/unavailable graphics uses the same artwork and static rings. Images have a calm CSS fallback while loading or if unavailable.

Language/context/privacy/agency: English and Spanish guidance, no inferred cultural context, optional breathing, explicit still control, obvious exit and bounded clock. No sensors, audio, network beyond local app assets, external graphics embeds or persisted interactions. Artwork is AI-generated, reviewed; application code is authored and allowlisted. Arbitrary generated HTML remains unsupported.

Visual treatment: full scene, shared system typography, generous whitespace, fine separators, teal/ink/peach palette, stable high-contrast controls, no camera movement. Touch surfaces remain distinct from control overlays.

Verification: continuous time continuity across pause/resume and visibility; finite bounded wave sampling; keyboard placement; drag cap; reset/completion; still/system motion; unavailable/lost graphics; asset failure; absence of persistence; portrait/desktop composition; screenshot and console inspection. Unit suite, typecheck, Pages export and browser suite required. Review and PR before release.
