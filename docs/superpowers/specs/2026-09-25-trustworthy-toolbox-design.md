# Trustworthy personal toolbox

The user approved the repository review's next milestone: reliable demo access,
concrete support options, resilient local persistence, and control over personalization.

## Scope and decisions

Harden the existing browser-local app. Preserve its quiet design system, explicit
context, deterministic retrieval, and English/Spanish UI. A backend-first approach
would delay validating the core interaction; adding more Worlds would not resolve
the trust gaps. Authentication and cross-device persistence remain a separate milestone.

- Validate each existing local-storage collection independently. Recover usable
  collections when another is malformed, warn without overwriting the damaged data,
  and never report a failed save or deletion as successful.
- Persist related changes together with rollback on partial failures. Users can
  continue using tools when storage is unavailable, but mutations must report failure.
- Export the local toolbox, feedback, saved resources, and recommendation exclusions
  to a JSON download. Delete saved entries individually; deleting a custom tool also
  removes its feedback and exclusions. Reset feedback separately from saved content.
- Excluded tools never enter recommendations and can be restored individually.
  Explanations and a no-results state keep matching understandable.
- Support is a dedicated view accessible from check-in and profile. Region is selected
  explicitly for the current visit, never inferred or persisted. US/Canada services
  have source links and verification dates; unknown/other regions use a global directory.
  A transient trusted-contact phone field can open the device dialer without storing
  contacts or sending messages. SootheSpot does not monitor or classify danger.
- Preserve current styles; use native accessible controls rather than new animation
  libraries. All new copy is bilingual. Modal focus and Escape behavior must be usable.
- Lock dependencies, use reproducible CI installs, and deploy a tested static artifact.
  Enable GitHub Pages only after the implementation is verified. Do not merge main.

## Verification

Behavior tests cover corrupt storage, blocked/quota writes, partial rollback, deletion,
export, reset, exclusions, and region routing. Browser tests cover the complete
create/use/feedback/reload/control loop, support selection, empty states, language,
keyboard dialogs, and storage failures. Run unit tests, resource validation, and the
production build; inspect mobile and desktop renders and verify deployed asset paths.
