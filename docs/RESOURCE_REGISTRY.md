# SootheSpot Resource Registry

## Purpose
The Resource Registry is a global-by-design indexed directory of existing mental-health coping tools, educational resources, interactive websites, mobile apps, clinician resources, community resources, and other useful digital experiences that already exist outside SootheSpot.

SootheSpot does not need to recreate everything. The registry lets people and clinicians discover useful resources, understand what each resource is for and where it applies, and open the original resource externally.

## Product principle
SootheSpot is the place that helps you find the right tool, not necessarily the place that has to own the tool.

A resource remains external unless it is explicitly licensed, embedded, or recreated with appropriate permission.

The registry is **not U.S.-first**. The data model must support resources from any country or region, and must distinguish global availability from region-specific availability.

## Core resource principles

Every resource should be evaluated through four lenses:

### Context
What situation, goal, duration, setting, population, and level of support is the resource designed for?

### Culture
What languages, communities, cultural contexts, communication styles, imagery, assumptions, or local practices are represented? What is known, and what is unknown?

Culture must not be inferred from nationality, language, ethnicity, or location alone.

### Privacy
What data does the external resource collect? Does it require an account? Does it process sensitive information remotely? Record known privacy considerations when they materially affect safe use.

### Agency
Can the user choose whether to open, save, share, or use the resource? SootheSpot should not hide provenance or silently enroll users in external services.

## Resource categories
- Breathing
- Grounding
- Mindfulness
- Relaxation
- Anxiety
- Mood
- Sleep
- Stress
- Trauma
- CBT
- ACT
- Behavioral activation
- Journaling
- Sensory regulation
- Distraction
- Self-compassion
- Relationships
- Problem solving
- Psychoeducation
- Crisis and safety
- Community support
- Accessibility
- Multilingual/culturally responsive resources
- Interactive digital experiences
- Mobile apps
- Clinician tools
- Region-specific care/support
- Community- or peer-developed resources

## Review metadata
Every registry item should include:
- publisher
- official URL
- resource type
- intended population
- clinical/use context
- evidence or source notes when available
- languages
- locale/region availability when known
- cultural-context notes when relevant
- accessibility information when known
- privacy/data-practice notes when relevant
- cost
- platform
- last reviewed date
- review status
- known limitations
- whether independent use is appropriate
- whether professional guidance is recommended

Do not label a resource "evidence-based" merely because it is popular. Record the actual basis for the description.

## Review states
- unreviewed: found but not yet evaluated
- screened: basic link, publisher, purpose, scope, privacy/safety flags, and access checks completed
- clinically_reviewed: reviewed by a qualified clinical reviewer
- verified: current URL, publisher, scope, and relevant claims checked against primary sources
- deprecated: unavailable, no longer maintained, or otherwise unsuitable

Verification of a URL does not mean clinical efficacy has been independently validated.

## Geographic and cultural scope

Each resource should distinguish, when known:
- publisher country/region
- intended country/region
- availability country/region
- language(s)
- locale(s)
- cultural-context notes
- local terminology
- local care-system dependencies
- local crisis/safety dependencies
- whether content is universal, region-specific, or unknown

Do not assume a U.S. resource is globally applicable.

Do not treat translation as cultural adaptation. A translated resource may still contain culture-specific assumptions, examples, metaphors, care pathways, or legal/health-system references.

## External-link rule
Registry resources should normally open externally.

Do not scrape, mirror, or reproduce copyrighted material without permission. SootheSpot stores metadata and short factual descriptions, not copies of entire third-party resources.

## Discovery model
Users should be able to search by:
- what I am feeling
- what I want to do
- clinical approach
- format
- duration
- language
- locale/region
- accessibility
- device
- free/paid
- therapist recommended
- independent use
- cultural/context fit when explicitly available

Example: overwhelmed + 5 minutes + interactive + Spanish could return resources whose metadata actually supports those constraints, rather than assuming that any Spanish resource is culturally appropriate.

## Ranking
Do not create a universal "best app" ranking. Use transparent filters and attributes instead:
- verified
- clinician reviewed
- free
- short
- interactive
- multilingual
- works offline
- therapist companion
- accessible
- appropriate for independent use
- region available
- cultural-context documented

The registry should never imply cultural appropriateness merely because a resource is translated.

## Maintenance
External resources change. Registry entries need periodic link and metadata verification.

Recommended fields:
- last_checked_at
- last_verified_at
- reviewer
- verification_notes
- scope_reviewed_at
- privacy_reviewed_at
- cultural_context_reviewed_at

Future automation can periodically check for dead links or material changes, but should not silently change clinical, cultural, privacy, or geographic claims.

## Digital Bookshelf implementation contract

The seven public shelves are navigational views, not clinical categories or quality rankings:

- **Read**: books and readable resources.
- **Listen**: audio-first resources.
- **Practice**: activities a person can choose to try.
- **Watch**: video and visual instruction.
- **Sleep & Rest**: sleep education and optional wind-down material.
- **Understand Yourself**: psychoeducation and self-reflection.
- **Reach Out**: people, services, and ways to seek support.

A resource may be relevant to more than one shelf for display, but the catalog should assign one explicit primary shelf when the metadata migration is complete. Secondary shelf labels must be explicit metadata too; they must not be inferred at runtime from keyword substrings. Until migration is complete, clearly isolate legacy fallback behavior and test it so it cannot silently override explicit metadata.

### Need-based retrieval rules

1. Apply user-selected filters as constraints, not hidden weights: shelf, need, language, time, population, access/cost, region, format, and accessibility.
2. Do not treat missing metadata as a positive match for a selected constraint. For example, when a person chooses a maximum duration, resources with unknown duration should be marked unknown or excluded from the strictly time-bounded result set rather than presented as if their duration fit.
3. A requested language should match a declared resource language or verified locale. Do not infer cultural fit from language.
4. A regional filter must match declared availability, not the publisher's country. Never infer the user's region; ask for it only when it materially affects access or safety.
5. Need labels are editorial metadata. Search terms may help locate candidates, but substring matches must not be presented as verified need matches.
6. Keep results deterministic and transparent. No opaque effectiveness score, universal "best" ordering, or inferred clinical suitability. Preserve a stable, neutral ordering when multiple resources meet the filters.
7. Show the source/publisher, access/cost, language, format, duration (or "not listed"), scope, last verification date, and limitations before a user opens or saves the external resource.
8. Safety and crisis pathways stay separate from ordinary bookshelf browsing and coping suggestions.

### Verification and metadata quality gate

Treat metadata as a claim with provenance, not merely a UI field. Prefer the publisher or responsible public agency for title, format, access, language, and availability. Use primary-source clinical/evidence summaries for safety or evidence statements. Preserve the source URL, date checked, reviewer/status, and a plain-language limitation. A live URL alone does not justify a clinical-efficacy claim.

Use the following meanings consistently:

- **Known**: directly stated by the primary source.
- **Not listed**: the source was checked but does not state the detail.
- **Not checked**: not yet reviewed.
- **Unknown / conflicting**: sources do not support a reliable value.

Do not turn missing values into reassuring assumptions. "Verified" means the specific record fields and claims were checked against the linked source; it does not mean the resource is clinically effective, accessible to everyone, culturally adapted, or suitable for a particular person.

### Quality checks required before expanding the catalog

- Unique IDs across both the general-resource and bibliographic-book catalogs.
- Every official URL is HTTPS and source notes point to a primary source where possible.
- Explicit shelf and need values belong to the allowed vocabulary.
- Every resource shown under a selected shelf or need satisfies that explicit filter.
- Duration filters do not silently include records whose duration is missing.
- Language and region filters use their own fields and do not substitute for cultural-context metadata.
- Bibliographic book entries contain factual citation metadata only (author/editor, title, edition/year, publisher, ISBN when verified, official publisher URL); no copied chapters, long excerpts, or unlicensed summaries.
- Safety resources are not mixed into ordinary coping results in a way that hides the safety pathway.
- Keyboard and screen-reader navigation, empty results, unknown metadata, and mobile layout are tested.
- The catalog and retrieval flow work without an AI provider.

### Suggested dependency order

1. Merge and validate explicit shelf/need metadata and deterministic retrieval.
2. Tighten schema/catalog validation and add regression tests for unknown metadata, language/region separation, and duplicate IDs across catalogs.
3. Expose neutral, useful metadata chips and understandable filter controls in the bookshelf UI.
4. Audit primary-source links and refresh stale or unsupported metadata.
5. Expand resources in coverage gaps across Read, Listen, Practice, Watch, Sleep & Rest, Understand Yourself, and Reach Out.
6. Add book references as metadata-only records, verifying edition details against the publisher or a recognized library catalog before marking them verified.
7. Add optional contribution/review workflows with attribution and a visible review history.

