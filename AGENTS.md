# SootheSpot Agent Instructions

## Mission
Build SootheSpot as a calm, private, client-owned emotional regulation toolbox. It helps people access coping tools during everyday distress, discover what works for them, and create personalized interactive calming experiences.

SootheSpot is not an emergency response service, crisis hotline, diagnostic system, or replacement for clinical care.

## Non-negotiable product North Star
Everything SootheSpot builds must be inherently:

1. **Context-adaptive** — account for situation, environment, goals, constraints, preferences, prior experience, and what has helped before.
2. **Culturally responsive** — support multiple languages, cultures, communities, communication norms, accessibility needs, and local contexts without stereotyping or treating nationality/language/location as a substitute for culture.
3. **Privacy-preserving** — minimize collection, exposure, retention, and third-party sharing; prefer local/private processing where practical.
4. **Agency-preserving** — users control what is used, saved, personalized, shared, and generated.

These are architecture constraints, not optional UI features.

## Product principles
1. Client ownership: the client's own tools and language are first-class content.
2. Low cognitive load: a distressed user should reach a useful tool in seconds.
3. Therapist augmentation: therapist-curated tools guide care without taking ownership away from the client.
4. Evidence-aware: distinguish therapist-curated, trusted-resource, client-created, and AI-generated content.
5. Safety by design: mild distress stays in coping mode; explicit safety concerns route to a deterministic safety pathway.
6. Privacy by default: collect the minimum necessary data.
7. Global by default: do not assume U.S. language, resources, crisis systems, clinical terminology, or cultural norms are universal.
8. Accessibility: keyboard, screen reader, reduced motion, contrast, touch targets, and plain language are required.
9. Calm visual language: simple, spacious, native-feeling restraint. Follow docs/DESIGN_SYSTEM.md; avoid clutter, generic SaaS dashboards, and alarmist crisis UI.
10. AI creates experiences, not diagnoses or autonomous treatment.
11. No dark patterns, streaks, guilt, or engagement-maximization mechanics.

## Agent operating rules
- Read docs/ARCHITECTURE.md, docs/PRODUCT_SPEC.md, docs/ROADMAP.md, docs/VISION.md, and docs/DESIGN_SYSTEM.md before implementing.
- Preserve architecture boundaries.
- Treat locale, language, culture, region, and context as separate concepts.
- Never infer cultural identity from language, nationality, ethnicity, or location alone.
- Prefer explicit user preferences, source metadata, clinician input when shared, and community-informed review.
- Resource records must preserve geographic scope, language, cultural-context notes, accessibility, and provenance when known.
- Do not silently substitute U.S.-specific resources or crisis pathways for users in other regions.
- Keep privacy and data minimization requirements in feature design and tests.
- Prefer small composable changes.
- Do not add dependencies unnecessarily.
- Add tests for safety, privacy, persistence, localization, cultural adaptation, and generated-content behavior.
- Never place secrets in client code.
- Treat all generated HTML as untrusted.
- Generated experiences must run inside a restricted sandbox and cannot access parent DOM, cookies, auth tokens, or arbitrary network requests.
- Keep safety routing deterministic. Do not let an LLM decide whether someone is in immediate danger.
- Never present AI output as a clinician recommendation.
- Keep provenance on every resource.

## Definition of done
A feature is not complete until mobile UX, loading/empty/error states, accessibility basics, privacy implications, localization implications, cultural-context implications, important tests, and relevant documentation are addressed.

Use issue -> branch -> implementation -> tests -> PR -> review. Avoid direct pushes to main for substantive changes.
