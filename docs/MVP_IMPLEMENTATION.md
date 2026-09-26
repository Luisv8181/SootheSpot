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

## Trustworthy toolbox milestone (2026-09-25)

Added independent Zod validation of browser collections, transactional best-effort
rollback for multi-key writes/deletion, visible storage errors, Web Locks serialization
across tabs, JSON export (including unreadable raw collections), individual feedback
deletion, learned-history reset, and reversible recommendation exclusions. The UI
reflects only successfully persisted changes; incomplete rollback triggers a reload
and an explicit partial-failure warning. Local storage cannot guarantee crash-atomic
multi-key writes; durable transactional persistence is still a future milestone.

Support now has a dedicated bilingual handoff screen. US/Canada resources are explicitly
selected and link to primary sources checked on 2026-09-25. A global directory is always
available. Region and optional dialer input are not persisted. There is no risk classifier,
contact import, automatic messaging, or emergency monitoring.

New controls and no-results states have English/Spanish copy. Dialogs trap focus,
support Escape, make the background inert, and restore focus, including when a hidden
recommendation removes its opener. Existing UI localization beyond this milestone
remains incomplete.

Unit tests cover data/retrieval/support/deployment contracts. Playwright now checks the
production static export on mobile and desktop, including stale-tab history deletion,
quota failures, corrupt saved data, support selection, export, reset, and keyboard focus.
Authentication, cross-device persistence, and user research remain outstanding.
