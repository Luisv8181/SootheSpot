# SootheSpot Interface Standard

## Product feeling

SootheSpot should feel like a first-party personal wellbeing product: quiet, precise, tactile, trustworthy, and native to the device.

The reference is the restraint and information hierarchy associated with high-quality Apple system apps, not literal copying of Apple assets, layouts, trademarks, or proprietary components.

The interface should feel more like **Health / Mindfulness / Home** than a SaaS dashboard.

## Core visual rules

### 1. Calm hierarchy
- One primary action per surface.
- Large headings with short supporting copy.
- Secondary information should recede rather than compete.
- Avoid dense dashboards, oversized navigation chrome, and multiple competing accent colors.

### 2. System-native typography
- Prefer the platform system font stack.
- Use weight and spacing for hierarchy before adding decoration.
- Keep body copy readable and conversational.
- Avoid excessive uppercase; reserve it for small eyebrow labels.

### 3. Materials, not boxes
- Prefer soft surfaces, restrained translucency, and thin separators.
- Use blur only for navigation, modals, and a small number of elevated surfaces.
- Avoid putting every object inside a heavy card.
- Shadows should be diffuse and low contrast.

### 4. Color
- Neutral off-white foundation.
- One primary blue accent.
- Muted natural secondary tones may appear in Worlds or semantic states.
- Safety UI should be calm and clear, not alarming by default.
- Never use color as the only carrier of meaning.

### 5. Shape
- Use generous radii, but keep them proportional to component size.
- Controls should feel touchable without appearing toy-like.
- Pills are for filters, compact metadata, and segmented controls—not every action.

### 6. Motion
- Motion should communicate state, breathing rhythm, continuity, or focus.
- Keep transitions short and subtle.
- Respect reduced-motion preferences everywhere.
- Never use engagement-maximizing animation.

### 7. Emotional design
A distressed user should not feel confronted by the interface.

Prefer:
- fewer choices
- short prompts
- generous whitespace
- clear exit paths
- low cognitive load
- familiar controls
- immediate access to personal tools

Avoid:
- streaks
- scores about the person
- red warning-heavy interfaces unless genuinely necessary
- gamification
- celebratory confetti
- guilt-based copy
- diagnostic language

## Home-screen hierarchy

1. Current check-in
2. Minimal context such as available time
3. 3 or fewer transparent recommendations
4. One optional calming experience
5. Quiet paths to Toolbox, Resources, and Worlds

The user should not need to understand SootheSpot's architecture to use it.

## Personal Toolbox

The Toolbox should feel like a private personal collection, not a clinical record.

History should be expressed as observations:
- "Used 5 times"
- "Marked helpful 4 times"
- "This helped before when you felt overwhelmed"

Never convert this into diagnostic certainty or efficacy claims.

## Resource Explorer

Resource cards should prioritize:
- title
- publisher
- concise factual description
- provenance/review status
- relevant language/context
- open/save actions

Do not use star ratings, universal scores, or "best" badges.

## Worlds

Worlds can be more atmospheric than the rest of the app, but should retain the same restraint:
- immersive full-screen canvas
- one activity at a time
- limited controls
- no arbitrary generated code in the product shell
- reduced-motion alternative
- obvious exit

## Accessibility baseline

Every UI change must preserve:
- visible keyboard focus
- 44px-ish touch targets for primary controls where practical
- screen-reader labels
- sufficient contrast
- reduced-motion support
- readable scaling on small screens
- no meaning conveyed through color alone

## Design review question

Before shipping a UI change, ask:

> Does this reduce the distance between a difficult moment and something useful, while making the person feel more in control?

If the design looks impressive but adds cognitive load, remove it.
