# MVP Implementation

## Current slice

The first implementation proves the SootheSpot core loop without AI:

`check-in -> deterministic retrieval -> try tool -> feedback -> future matching`

The prototype also exposes the Resource Registry as a searchable Resource Explorer, lets a user save external resources to the Personal Toolbox, and now includes a first set of interactive SootheSpot Worlds.

## Deliberate prototype boundaries

- Persistence is browser-local until authentication and a durable database are implemented.
- The seeded tools are demo content, not a clinical recommendation engine.
- Safety routing is a boundary and handoff, not an automated risk classifier.
- No AI provider is called by the MVP.
- Worlds are app-native prototype experiences for now; arbitrary generated HTML is not executed.
- The resource registry remains the source of truth for external-resource provenance and review status.
- Language selection currently establishes retrieval/resource-language behavior; full UI localization is a subsequent implementation task.

## Current prototype capabilities

The Personal Toolbox now supports client-created tools, browser-local CRUD, favorites/saved state, and simple toolbox search. Custom tools are validated with Zod before they enter the local store.

## Interactive Worlds slice

The first Worlds slice includes Ocean Calm, Soft Focus, and Grounding Garden. These are deliberately small, deterministic experiences with reduced-motion support and no external AI or audio dependency. They establish the interaction language before introducing generated HTML.

## Next engineering slice

1. Authentication
2. PostgreSQL/Supabase persistence
3. Tool usage records
4. Permission model
5. Full localization infrastructure
6. Resource metadata filters for locale/region/accessibility/cultural adaptation
7. End-to-end tests
