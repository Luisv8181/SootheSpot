# SootheSpot Agent Tool Contracts

These contracts describe tools that future AI agents may call. They are intentionally provider-neutral.

## search_resource_registry

Purpose: find external resources from the curated registry.

Inputs:
- query: optional natural-language need
- tags: optional array
- duration_max_minutes: optional number
- language: optional string
- platform: optional string
- independent_use: optional boolean
- therapist_supported: optional boolean
- review_status: optional array
- resource_type: optional array

Rules:
- Never hide review status.
- Never invent resource properties.
- Prefer primary-source metadata.
- Do not treat popularity as evidence.
- Do not produce a universal ranking.
- Safety resources require explicit safety context.

## get_resource

Purpose: retrieve one registry record by ID.

Rules:
- Return complete provenance.
- Return limitations.
- Return last verification date.
- Do not copy third-party content.

## save_external_resource

Purpose: save an external resource reference to a user's toolbox.

Stored data:
- user_id
- resource_id
- personal_note
- trigger_tags
- preferred_duration
- created_at

The saved reference does not copy the external resource into SootheSpot.

## propose_resource

Purpose: allow an agent to submit a newly discovered resource for human review.

New resources enter review status "unreviewed" or "screened". Agents cannot set "clinically_reviewed" without an explicit qualified-review workflow.

## link_health_check

Purpose: check whether the official URL is reachable.

A link check is not a clinical verification. A reachable URL must not automatically change review status.

## Safety boundary

The agent may retrieve and organize safety resources. It must not independently decide that a person is safe or unsafe. Safety routing remains deterministic and separate from the generative model.
