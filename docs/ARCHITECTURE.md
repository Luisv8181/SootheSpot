# SootheSpot Architecture

## 1. Product boundary
SootheSpot is a personal emotional-regulation workspace.

Primary use case: "I'm having a hard moment. Show me something I already know may help."

Secondary use case: "Help me create a calming interactive space that fits me."

SootheSpot supports everyday and mild-to-moderate distress. It is not an emergency response service. Explicit safety concerns transition to a deterministic safety pathway.

## 2. Core design constraints: Context, Culture, Privacy, Agency

These are cross-cutting architectural concerns.

**Context** is represented separately from diagnosis. Relevant context may include current situation, environment, time, goals, constraints, preferences, trigger/context tags, prior tool use, and effectiveness history.

**Culture** is not a single inferred attribute. The system should support language, communication norms, community context, cultural references, local care systems, and user-provided preferences. Language, nationality, ethnicity, and location must not be treated as interchangeable proxies for culture.

**Privacy** means least-necessary collection and access. Personal context should be partitioned by purpose and permission. External AI providers receive only the minimum context required for a specific operation.

**Agency** means the user controls saved content, personalization, sharing, and generated experiences.

Every feature should document which context it needs, which cultural adaptation it supports, what data it exposes, and what control the user has.

## 3. Experience architecture

                         SOOTHESPOT
                              |
        +---------------------+---------------------+
        |                     |                     |
     CHECK IN              TOOLBOX              CREATE
        |                     |                     |
   current state       personal tools        agent studio
        |                     |                     |
        +----------+----------+----------+----------+
                   |                     |
             REGULATION LOOP       SOOTHESPOT WORLDS
                   |                     |
             try -> reassess       sandboxed HTML
                   |                     |
                   +----------+----------+
                              |
                         SAFETY GATE

## 4. Content provenance and scope

Every resource has explicit provenance and, when known, geographic/language/cultural scope.

THERAPIST CURATED
Evidence-informed tools selected or assigned by a clinician.

CLIENT CREATED
Things the client personally identifies as helpful: routines, music, images, reminders, places, people, phrases, activities, etc.

TRUSTED RESOURCE
Reviewed external resources, education, community resources, and safety resources.

AI GENERATED
Interactive experiences generated from user intent and approved templates. These are not clinical recommendations.

A resource must retain provenance, scope, and review status when copied, favorited, or reused.

## 5. Experience and personalization context

Context should be structured rather than hidden inside prompts.

Possible context dimensions:
- current state
- situation/trigger
- environment
- available time
- preferred modality
- language/locale
- accessibility needs
- user-selected cultural/context preferences
- geographic availability
- prior helpfulness
- therapist-shared context, only with permission

The retrieval system should be able to operate with partial context. Missing information should not be invented.

## 6. Recommended application layers

Presentation
- Responsive web/PWA
- Mobile-first
- Calm visual system
- Accessible components
- Main surfaces: Home, Tools, Spaces, Journal, Profile/Safety
- Localization-ready from the start

Domain
- check-ins
- tool retrieval
- resource provenance
- resource scope/context
- coping sessions
- effectiveness feedback
- space creation
- permissions
- safety routing
- localization/context adaptation

Data
Use relational persistence for durable user-owned data.

Core entities:
users, profiles, tools, tool_sources, tool_usage, spaces, space_assets, check_ins, safety_profiles, resource_catalog, resource_locales, resource_scopes, resource_reviews, sharing_permissions.

## 7. Coping retrieval engine
Do not start with an LLM. The first retrieval system should be deterministic and explainable.

Inputs:
- current state
- optional distress level
- preferred tools
- trigger/context tags
- language/locale
- accessibility preferences
- geographic scope
- cultural/context preferences explicitly provided by the user
- recent helpfulness
- therapist-curated status
- favorites

Output:
- 3 to 5 relevant tools
- a clear reason for each
- provenance and scope when relevant
- no unsupported clinical claims

Example:
state = overwhelmed
preferences = sensory + movement
history = walking helpful 8/10

Result:
1. Walk outside
2. Grounding Garden
3. 60-second breathing

Later, an AI ranking layer can sit behind the same interface, but it must preserve the same provenance, safety, privacy, and scope controls.

## 8. SootheSpot Agent
The agent is a constrained creation and navigation assistant.

Pipeline:
user intent
-> structured intent
-> context extraction
-> cultural/localization constraints
-> safety/content check
-> approved component palette
-> ExperienceSpec
-> renderer
-> sanitization and validation
-> sandbox
-> preview
-> save, edit, or discard

Generate a structured ExperienceSpec first rather than trusting arbitrary model HTML.

The agent should use the minimum necessary personal context and should distinguish known user-provided context from model inference.

## 9. HTML sandbox security
Generated experiences are untrusted content.

Minimum requirements:
- isolated iframe
- restrictive CSP
- no parent DOM access
- no application cookies or tokens
- no access to app storage
- block arbitrary network requests
- allowlist assets
- sanitize markup
- validate specifications before rendering
- narrow postMessage protocol
- never inject generated HTML into the main application DOM

The parent application owns persistence and authentication. The generated experience does not.

## 10. Safety architecture

CHECK-IN
|
+-- okay -> normal toolbox
|
+-- struggling -> coping mode -> try tool -> reassess
|
+-- explicit safety concern -> region-aware safety plan / trusted support / crisis resources / emergency services when appropriate

Do not use an LLM as the final classifier for immediate danger.

Location-specific safety routing must use an explicit or appropriately confirmed region. Do not infer a crisis jurisdiction from weak signals.

## 11. Therapist architecture
Therapist functionality is additive, not controlling.

Therapists can:
- recommend tools
- curate resources
- create assignments
- view agreed-upon usage summaries
- add resources with appropriate permissions
- provide context or cultural preferences when the client has chosen to share them

Private journal entries and client-created content should not be visible to therapists by default. Sharing requires explicit client permission.

## 12. Privacy architecture
Default flow:

Client device
-> SootheSpot API
-> relational database / encrypted object storage
-> optional AI provider

Privacy requirements:
- data minimization
- purpose limitation
- least-privilege access
- explicit sharing permissions
- clear retention/deletion behavior
- separate identity from content where practical
- avoid sending identifying information to AI providers when unnecessary
- configurable provider selection
- auditability for sensitive access
- compatibility with future local/private AI

For AI:
- send minimum necessary context
- avoid identifying information
- separate identity from content where practical
- document external processors
- make provider selection configurable
- never expose API keys in the browser

## 13. Suggested technical stack
MVP recommendation:
- Next.js + TypeScript
- Tailwind CSS
- accessible component primitives
- PostgreSQL
- Supabase Auth/Postgres/Storage or equivalent
- PWA support
- Vitest
- Playwright
- Zod
- provider abstraction for LLM calls

Keep vendor-specific AI code behind lib/ai with provider interfaces. The domain layer must not depend directly on one model vendor.

## 14. Repository structure

SootheSpot/
  app/
    auth/
    home/
    tools/
    spaces/
    journal/
    profile/
    safety/
  components/
    ui/
    toolbox/
    check-in/
    spaces/
    agent/
    safety/
  domain/
    coping/
    tools/
    resources/
    context/
    localization/
    spaces/
    safety/
    permissions/
  lib/
    db/
    auth/
    ai/
    safety/
    localization/
    validation/
    analytics/
  tests/
    unit/
    e2e/
    localization/
    privacy/
    safety/
    resources/
  docs/
  AGENTS.md
  README.md

If the existing implementation adopts a different framework, preserve these logical boundaries instead of rewriting solely to match this tree.

## 15. Agent contracts
Every coding agent should receive:
- objective
- files it may modify
- acceptance criteria
- tests required
- security considerations
- dependencies
- definition of done

Agents should not silently redesign unrelated architecture.

## 16. Core product loop
Notice -> Check in -> Retrieve personal tools -> Try something -> Reassess -> Remember what helped.

The central design goal is simple:

When someone is having a hard moment, reduce the distance between "I need something" and "here is something I already know can help."

The system should achieve that across languages, cultures, contexts, regions, and accessibility needs without sacrificing privacy or user agency.
