# Resource Explorer Specification

## Goal

Let a person discover existing mental-health resources without making SootheSpot responsible for hosting or reproducing those resources.

The explorer should feel like a calm tool shelf, not an app store.

## Primary flow

1. User chooses what they need.
2. User optionally chooses time, format, language, platform, or independent-use preference.
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
- platform
- free/paid status
- independent-use status
- professional-guidance status
- review status
- last verified date
- Open resource
- Save to My Toolbox

Do not display a universal score or "best" badge.

## Safety

Crisis and safety resources should be a separate pathway. A safety-plan resource may be surfaced when the user explicitly asks for safety planning, but ordinary coping search should not silently turn into crisis content.

## Personalization

Personalization should use the user's own history and preferences:

- tools they marked helpful
- preferred formats
- preferred duration
- languages
- accessibility preferences
- therapist-shared resources, when permission exists

Personalization changes ordering or filtering based on user-owned data. It does not change clinical claims about a resource.

## Future agent interface

search_resource_registry({
  query,
  tags,
  duration_max_minutes,
  language,
  platform,
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
  review_status,
  limitations,
  use_context,
  source_notes
}

The agent must preserve review status and provenance in its output.
