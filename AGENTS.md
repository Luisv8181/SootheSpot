# SootheSpot Agent Instructions

## Mission
Build SootheSpot as a calm, private, client-owned emotional regulation toolbox. It helps people access coping tools during everyday distress, discover what works for them, and create personalized interactive calming experiences.

SootheSpot is not an emergency response service, crisis hotline, diagnostic system, or replacement for clinical care.

## Product principles
1. Client ownership: the client's own tools and language are first-class content.
2. Low cognitive load: a distressed user should reach a useful tool in seconds.
3. Therapist augmentation: therapist-curated tools guide care without taking ownership away from the client.
4. Evidence-aware: distinguish therapist-curated, trusted-resource, client-created, and AI-generated content.
5. Safety by design: mild distress stays in coping mode; explicit safety concerns route to a deterministic safety pathway.
6. Privacy by default: collect the minimum necessary data.
7. Accessibility: keyboard, screen reader, reduced motion, contrast, touch targets, and plain language are required.
8. Calm visual language: simple, spacious, premium, Apple-like restraint. Avoid clutter and alarmist crisis UI.
9. AI creates experiences, not diagnoses or autonomous treatment.
10. No dark patterns, streaks, guilt, or engagement-maximization mechanics.

## Agent operating rules
- Read docs/ARCHITECTURE.md, docs/PRODUCT_SPEC.md, and docs/ROADMAP.md before implementing.
- Preserve architecture boundaries.
- Prefer small composable changes.
- Do not add dependencies unnecessarily.
- Add tests for safety, privacy, persistence, and generated-content behavior.
- Never place secrets in client code.
- Treat all generated HTML as untrusted.
- Generated experiences must run inside a restricted sandbox and cannot access parent DOM, cookies, auth tokens, or arbitrary network requests.
- Keep safety routing deterministic. Do not let an LLM decide whether someone is in immediate danger.
- Never present AI output as a clinician recommendation.
- Keep provenance on every resource.

## Definition of done
A feature is not complete until mobile UX, loading/empty/error states, accessibility basics, privacy implications, important tests, and relevant documentation are addressed.

Use issue -> branch -> implementation -> tests -> PR -> review. Avoid direct pushes to main for substantive changes.
