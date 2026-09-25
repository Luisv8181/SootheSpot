# Context, Culture, Privacy, Agency

This document defines SootheSpot's cross-cutting design North Star.

## The principle

SootheSpot is a counseling-informed system, not a generic wellness catalog.

Every feature should be inherently:

- **Context-adaptive:** understand the person's current situation, environment, goals, constraints, preferences, and prior experience.
- **Culturally responsive:** support multiple languages, cultures, communities, communication norms, local contexts, and culturally meaningful ways of expressing distress and coping.
- **Privacy-preserving:** minimize collection, exposure, retention, and third-party sharing of sensitive information.
- **Agency-preserving:** the person controls what is used, saved, personalized, shared, and generated.

## Context is not diagnosis

Context can include:

- current need
- situation or trigger
- environment
- available time
- desired modality
- sensory preferences
- accessibility
- language and locale
- geographic resource availability
- prior helpfulness
- user-selected cultural/context preferences

Context should improve relevance without turning ordinary coping data into diagnostic inference.

## Culture is not a proxy field

The system must not assume:

- language = culture
- nationality = culture
- ethnicity = culture
- location = culture

Those signals can provide context, but they are not substitutes for the person's own preferences or community-informed knowledge.

Cultural adaptation should be represented as explicit metadata when known:

- translated
- localized
- culturally adapted
- community informed
- unknown

Unknown should remain unknown.

## Global-by-default registry

The Resource Registry must support resources from different countries, regions, languages, communities, and care systems.

A resource record should distinguish:

- publisher region
- intended region
- availability region
- language
- locale
- cultural-context information
- local terminology
- local care-system dependencies
- local crisis/safety dependencies

A U.S. resource is one resource in a global registry, not the default resource.

## Privacy as architecture

Sensitive personal context should be minimized at every boundary.

When AI is used:

1. Construct a minimal structured intent.
2. Remove unnecessary identifying information.
3. Send only the context required for the operation.
4. Keep provider access configurable.
5. Preserve provenance and user control.
6. Prefer local/private processing where practical.

Example:

```text
Need: grounding
Time: <= 5 minutes
Language: Spanish
Accessibility: reduced motion
Region: user-selected
Context: overwhelmed
```

is preferable to sending an entire journal history to an external model.

## Agency

SootheSpot should make important choices visible:

- Why was this resource shown?
- Where did it come from?
- What region/language/context does it support?
- What data was used?
- Who can see this information?
- What happens if the user saves or shares it?
- Can the user delete or change it?

The system should offer options rather than quietly making high-impact decisions for the user.

## Engineering review checklist

Before shipping a feature, ask:

### Context
- What context does this feature actually need?
- Can it work with partial context?
- Are we inventing missing context?

### Culture
- Which languages/locales are supported?
- Is cultural adaptation documented or merely assumed?
- Have we separated translation from cultural adaptation?
- Are we avoiding stereotypes?

### Privacy
- What sensitive data enters this feature?
- What is the minimum necessary?
- Does any external provider receive it?
- Is access/retention documented?

### Agency
- Can the user understand and control the choice?
- Is provenance visible?
- Is sharing explicit?
- Can the user change or remove the personalization?

### Safety
- Does this feature cross into safety-critical behavior?
- If yes, is the safety pathway deterministic and appropriately region-aware?

A feature that cannot answer these questions is not ready for production.
