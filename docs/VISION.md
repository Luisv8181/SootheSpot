# SootheSpot Product Vision

## The vision
SootheSpot is a personal operating layer for emotional regulation.

It is not intended to become another giant mental-health content platform, an AI therapist, a crisis-response service, or a diagnostic system.

The goal is simpler:

> When someone is having a hard moment, help them quickly find something that may help, using tools they already trust, resources that already exist, and personalized experiences they can build over time.

SootheSpot should make the useful part of mental-health self-management feel organized, calm, personal, and immediately accessible.

## Core North Star: Context, Culture, Privacy, Agency

Everything SootheSpot builds must be inherently:

- **Context-adaptive:** understand the situation, environment, goals, constraints, preferences, prior experience, and what has helped before.
- **Culturally responsive:** support language, culture, community, communication norms, lived experience, and locally relevant resources without reducing people to stereotypes or assuming one culture is represented by one profile.
- **Privacy-preserving:** collect and expose the minimum necessary information, keep ownership and permissions explicit, and design for local/private processing where practical.
- **Agency-preserving:** the person remains in control of what is used, saved, shared, personalized, or generated.

These are architectural requirements, not optional personalization features.

The system should ask:

> **Context:** Does this make sense for what is happening to this person?
>
> **Culture:** Does this respect how this person communicates, understands, and experiences the world?
>
> **Privacy:** Does the system need this information, and who should have access to it?
>
> **Agency:** Is the person still in control?

### Global by default

SootheSpot is not a U.S.-only registry or care model.

The Resource Registry, discovery system, tool model, localization architecture, and future agent should be designed for multiple countries, languages, cultures, health systems, legal environments, accessibility needs, and resource ecosystems.

Country or language must never be treated as a proxy for culture. Cultural context should be represented through explicit source metadata, user preferences, clinician input when shared, and community-informed review where available.

A U.S. resource can be useful to someone elsewhere, but it must not be presented as globally applicable without checking its geographic scope, access requirements, crisis pathways, terminology, and relevant limitations.

## The core idea

A person should not have to search the internet from scratch every time they are overwhelmed.

SootheSpot brings several layers together:

```
MY TOOLS
    ↓
THERAPIST TOOLS
    ↓
RESOURCE LIBRARY
    ↓
SOOTHESPOT WORLDS
    ↓
SOOTHESPOT AGENT
```

The system should progressively move from known, trusted tools toward personalization.

AI is the enhancement layer, not the foundation.

## The core user loop

```
Hard moment
    ↓
Check-in
    ↓
"What might help right now?"
    ↓
Personal Toolbox / Resource Library
    ↓
Try something
    ↓
"Did this help?"
    ↓
Personal history
    ↓
Better future matching
```

This loop should work without an AI model.

That is a deliberate architectural decision.

## Why the Resource Library matters

SootheSpot does not need to recreate every useful mental-health resource on the internet.

Instead, it can become the layer that organizes them.

The Resource Registry can index:

- coping tools
- breathing and grounding exercises
- mindfulness resources
- sleep tools
- CBT/ACT resources
- psychoeducation
- interactive websites
- mobile apps
- clinician resources
- accessibility resources
- multilingual resources
- culturally responsive and locally relevant resources
- region-specific care and support resources
- safety-planning resources

The registry must preserve geographic and cultural scope rather than treating "available in English" or "available in the U.S." as universal defaults.

SootheSpot normally stores metadata and provenance, then sends the user to the original resource.

This creates a useful distinction:

**SootheSpot does not have to own the world's tools to help people find them.**

## The Personal Toolbox

The Personal Toolbox is the center of the product.

It can contain:

- client-created coping tools
- saved external resources
- therapist-curated tools
- SootheSpot Worlds
- personal notes
- trigger/context tags
- preferred duration
- helpfulness history
- language and accessibility preferences
- region-specific resources

The toolbox should increasingly answer:

> "What tends to help this person?"

without pretending to diagnose the person.

## Therapist integration

Therapists should be able to contribute without taking ownership of the client's private space.

Therapists may work with culturally and contextually relevant tools while the client remains the authority on their own preferences and experience.

A therapist may be able to:

- recommend a resource
- create or assign a coping tool
- suggest a SootheSpot World
- see explicitly shared effectiveness information
- organize tools around treatment goals

The client remains the owner of their personal toolbox.

Private journals, private AI conversations, and private client-created content should not automatically become therapist-visible.

## SootheSpot Worlds

Worlds are personalized interactive experiences.

Examples:

- a calming visual environment
- breathing experience
- grounding environment
- sensory reset
- short reflection
- guided journaling
- sleep wind-down
- personalized audio/visual experience

World generation should account for context, language, cultural preferences, accessibility, and user-selected boundaries. Cultural adaptation should be explicit and user-controlled rather than inferred from stereotypes.

The important architectural principle is that the AI does not directly receive arbitrary permission to execute code.

Instead:

```
User intent
    ↓
Structured intent
    ↓
Context + cultural + safety validation
    ↓
Approved component palette
    ↓
ExperienceSpec
    ↓
Renderer
    ↓
Sanitization + validation
    ↓
Sandbox
    ↓
Interactive World
```

The AI proposes the experience.

The application controls what can actually execute.

## SootheSpot Agent

Eventually the agent becomes the connective tissue across the system.

A user might say:

> "I'm overwhelmed, I only have five minutes, and I don't want to talk to anybody."

The agent could reason over:

- the user's Personal Toolbox
- saved external resources
- therapist-approved resources
- available SootheSpot Worlds
- preferences
- past helpfulness
- language and accessibility preferences
- relevant geographic/resource availability metadata

It might respond with several transparent options rather than one authoritative answer.

The agent should organize choices, not impersonate a clinician.

It should never silently infer culture from a demographic label, nationality, language, or location and treat that inference as fact.

## Safety architecture

Safety remains separate from generative reasoning.

```
Everyday distress
    ↓
Coping mode

Explicit safety concern
    ↓
Deterministic safety pathway
    ↓
Safety plan / trusted support / appropriate local crisis or emergency resources
```

Safety resources should be region-aware. Crisis and emergency information must be tied to the user's selected or explicitly confirmed region when location-specific routing is required.

An LLM should not be the final authority for determining whether someone is in immediate danger.

Safety resources should also remain clearly separated from ordinary wellness recommendations.

## Product progression

### Stage 1: Useful without AI

Build:

- Home
- Check-in
- Personal Toolbox
- client-created tools
- saved external resources
- Resource Explorer
- helpfulness feedback
- basic deterministic matching
- safety pathway
- localization foundations
- resource geography and cultural-context metadata

Success condition:

A person can have a hard moment and reach a personally relevant tool in seconds.

### Stage 2: Connect the ecosystem

Add:

- therapist-curated tools
- permission model
- client-controlled sharing
- richer resource metadata
- regional resources
- accessibility metadata
- multilingual resources
- culturally responsive resources
- community-informed review workflows
- better personalization

Success condition:

SootheSpot becomes the organized home for the tools surrounding a person's coping process across different contexts and communities.

### Stage 3: SootheSpot Worlds

Build:

- ExperienceSpec
- approved interactive components
- renderer
- sandbox
- audio/visual asset system
- reduced-motion mode
- accessibility controls
- localization
- cultural adaptation controls
- saved Worlds

Success condition:

A user can turn a coping intention into a safe, personalized interactive experience that fits their context and preferences.

### Stage 4: SootheSpot Agent

Build:

- intent extraction
- resource search
- toolbox search
- personalization
- World generation
- preview/edit/regenerate
- agent evaluation suite
- provenance-preserving responses
- context-aware and culturally responsive retrieval
- privacy/least-privilege controls

Success condition:

The agent can coordinate the ecosystem without becoming the ecosystem.

### Stage 5: Personal learning

Build:

- trigger-to-tool matching
- effectiveness history
- preference learning
- "what tends to help you" summaries
- optional therapist insights
- user-controlled personalization

Success condition:

SootheSpot becomes increasingly useful because it learns the user's own experience, not because it makes stronger clinical assumptions.

## What SootheSpot should NOT become

SootheSpot should avoid becoming:

- an AI therapist
- a diagnostic engine
- an autonomous crisis assessor
- a replacement for professional care
- a content farm
- a social-media-style engagement system
- a streak/gamification system that pressures vulnerable users
- a marketplace that ranks mental-health products by opaque scores
- a system that treats language, nationality, ethnicity, or location as a shortcut for culture

The product should optimize for usefulness, agency, privacy, context, and cultural responsiveness.

## The strategic thesis

There are countless mental-health resources.

There are also countless mental-health apps.

The fragmentation itself is part of the problem.

SootheSpot can occupy a different position:

```
Existing resources
        +
Personal coping history
        +
Therapist guidance
        +
Interactive experiences
        +
Context
        +
Culture
        +
Privacy
        +
Carefully bounded AI
        ↓
One calm personal toolbox
```

The opportunity is not necessarily to build another destination for mental-health content.

It is to build the layer that helps a person navigate what already exists and remember what works for them.

## Architectural north star

Every major feature should answer these questions:

1. Does this help the user reach something useful faster?
2. Does the user remain in control?
3. Is the provenance of the content clear?
4. Is the safety boundary explicit?
5. Is the context represented accurately?
6. Is cultural adaptation explicit, respectful, and non-stereotyping?
7. Is only the minimum necessary information being collected or shared?
8. Would the product still be useful if the AI disappeared?

If the answer to the last question is no, the architecture has probably become too dependent on AI.

## Near-term build order

The immediate engineering sequence should be:

```
1. Core mobile application
       ↓
2. Personal Toolbox
       ↓
3. Resource Explorer
       ↓
4. Save external resources
       ↓
5. Deterministic tool retrieval
       ↓
6. Helpfulness feedback
       ↓
7. Therapist/resource permissions
       ↓
8. SootheSpot Worlds
       ↓
9. Agent
       ↓
10. Personal learning
```

The AI should arrive after the product already has something worth intelligently navigating.

## Final vision

SootheSpot should feel less like talking to an AI and more like opening a personal drawer that already contains the things that help you.

The intelligence is what makes that drawer increasingly organized.

The person remains the owner of what goes inside, and the system is designed from the beginning to respect context, culture, privacy, and agency.
