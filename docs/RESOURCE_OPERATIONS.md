# Resource Registry Operations

The registry should behave like a small, auditable knowledge base rather than a list of links.

## Data flow

Discovery -> review queue -> screening -> verification -> registry -> periodic re-check.

Agents may discover candidates, but they must not silently upgrade a candidate to clinically reviewed.

## Provenance

Every resource should answer:

- Who publishes it?
- Where is the official resource?
- What is it for?
- Who is it for?
- Can it be used independently?
- Is professional guidance recommended?
- What limitations are known?
- When was the information last checked?
- What primary source supports the record?

## Agent behavior

A resource-search agent should return metadata with provenance and review status. It should never hide the fact that a resource is unreviewed.

A recommendation agent should filter by user context first, then present several transparent matches. It should not produce a universal "best resource" ranking.

## External resources

SootheSpot normally opens the original resource. Do not copy the resource's therapeutic exercises, audio, images, articles, or code into SootheSpot unless the license or permission allows it.

## User toolbox integration

A user can save an external resource to their personal toolbox as a reference:

- resource_id
- display_name
- optional personal_note
- optional trigger_tags
- optional preferred_duration
- created_at

Saving a reference does not copy third-party content into SootheSpot.

## Safety separation

Resources involving suicide prevention, self-harm, emergency support, or safety planning belong in a dedicated safety pathway. They should not be mixed into ordinary "what might help me right now?" results without an explicit safety context.

## Maintenance

Use last_checked_at for link checks and last_verified_at for substantive metadata checks. If a URL changes, a claim changes, or a resource disappears, create a review item rather than silently rewriting the historical record.
