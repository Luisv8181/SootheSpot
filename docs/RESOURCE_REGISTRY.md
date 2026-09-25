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
