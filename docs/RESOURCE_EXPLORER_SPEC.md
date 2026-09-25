# Resource Explorer Specification

## Goal

Let a person discover existing mental-health resources without making SootheSpot responsible for hosting or reproducing those resources.

The explorer should feel like a calm tool shelf, not an app store.

It is global by design. It must not assume that the U.S. is the default country, English is the default language, or one clinical/cultural context applies everywhere.

## Core retrieval principles

The Resource Explorer is built around:

**Context** — What does the person need right now, and under what circumstances?

**Culture** — What language, cultural context, communication style, community context, and locally relevant assumptions matter?

**Privacy** — What information is actually necessary to search or open this resource?

**Agency** — Can the person see provenance and limitations and decide whether to use or save it?

Language, country, nationality, ethnicity, and culture are separate fields. Missing cultural information must remain unknown rather than being invented.

## Primary flow

1. User chooses what they need.
2. User optionally chooses time, format, language, locale/region, accessibility, or independent-use preference.
3. SootheSpot filters the registry.
4. Results show transparent metadata and provenance.
5. User opens the original resource.
6. User may save the external resource as a reference in My Toolbox.

## Example prompts

- "I feel overwhelmed and have five minutes."
- "I want something quiet."
- "I want a breathing exercise."
- "I want something I can use with my therapist."
- "Show me Spanish resources."
- "Show me resources available in the Dominican Republic."
- "I want something culturally adapted for my community."
- "I want a sleep tool."
- "Show me interactive tools."

## Result card

Each result should expose:

- name
- publisher
- resource type
- short factual description
- tags
- duration when known
- language
- locale/region
- platform
- free/paid status
- independent-use status
- professional-guidance status
- cultural-context status when known
- privacy/data-practice note when relevant
- review status
- last verified date
- Open resource
- Save to My Toolbox

Do not display a universal score or "best" badge.

## Safety

Crisis and safety resources should be a separate pathway. A safety-plan resource may be surfaced when the user explicitly asks for safety planning, but ordinary coping search should not silently turn into crisis content.

Region-specific crisis or emergency resources must be selected using explicit/confirmed region information and verified local scope.

## Personalization

Personalization should use the user's own history and preferences:

- tools they marked helpful
- preferred formats
- preferred duration
- languages
- accessibility preferences
- explicit cultural/context preferences
- region when the user chooses to provide it
- therapist-shared resources, when permission exists

Personalization changes ordering or filtering based on user-owned data. It does not change clinical claims about a resource.

The system should prefer explicit context over inferred context.

## Privacy-preserving search

Resource search should not require sending the user's full personal history to an external model.

A future agent can receive a minimized structured intent such as:

```
{
  "need": "grounding",
  "duration_max_minutes": 5,
  "language": "es",
  "region": "user_selected_region",
  "accessibility": ["reduced_motion"],
  "context_tags": ["overwhelmed"]
}
```

The agent should not receive identifying information unless the specific operation requires it.

## Future agent interface

search_resource_registry({
  query,
  tags,
  duration_max_minutes,
  language,
  locale,
  region,
  accessibility,
  cultural_context,
  independent_use,
  therapist_supported,
  review_status,
  resource_type
})

Return:

{
  resource_id,
  name,
  publisher,
  official_url,
  description,
  matched_tags,
  language,
  locale,
  region_scope,
  cultural_context,
  review_status,
  limitations,
  use_context,
  source_notes
}

The agent must preserve review status, provenance, geographic scope, and cultural-context metadata in its output.
