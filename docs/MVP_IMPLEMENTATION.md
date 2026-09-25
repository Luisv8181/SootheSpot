# MVP Implementation

## Current slice

The first implementation proves the SootheSpot core loop without AI:

`check-in -> deterministic retrieval -> try tool -> feedback -> future matching`

The prototype also exposes the Resource Registry as a searchable Resource Explorer and lets a user save external resources to the Personal Toolbox.

## Deliberate prototype boundaries

- Persistence is browser-local until authentication and a durable database are implemented.
- The seeded tools are demo content, not a clinical recommendation engine.
- Safety routing is a boundary and handoff, not an automated risk classifier.
- No AI provider is called by the MVP.
- The resource registry remains the source of truth for external-resource provenance and review status.
- Language selection currently establishes retrieval/resource-language behavior; full UI localization is a subsequent implementation task.

## Next engineering slice

1. Authentication
2. PostgreSQL/Supabase persistence
3. Client-created tool CRUD
4. Tool usage records
5. Permission model
6. Full localization infrastructure
7. Resource metadata filters for locale/region/accessibility/cultural adaptation
8. End-to-end tests
