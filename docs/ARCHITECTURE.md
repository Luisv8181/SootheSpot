# SootheSpot Architecture

## 1. Product boundary
SootheSpot is a personal emotional-regulation workspace.

Primary use case: "I'm having a hard moment. Show me something I already know may help."

Secondary use case: "Help me create a calming interactive space that fits me."

SootheSpot supports everyday and mild-to-moderate distress. It is not an emergency response service. Explicit safety concerns transition to a deterministic safety pathway.

## 2. Experience architecture

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

## 3. Content provenance
Every resource has explicit provenance.

THERAPIST CURATED
Evidence-informed tools selected or assigned by a clinician.

CLIENT CREATED
Things the client personally identifies as helpful: routines, music, images, reminders, places, people, phrases, activities, etc.

TRUSTED RESOURCE
Reviewed external resources, education, community resources, and safety resources.

AI GENERATED
Interactive experiences generated from user intent and approved templates. These are not clinical recommendations.

A resource must retain provenance when copied, favorited, or reused.

## 4. Recommended application layers

Presentation
- Responsive web/PWA
- Mobile-first
- Calm visual system
- Accessible components
- Main surfaces: Home, Tools, Spaces, Journal, Profile/Safety

Domain
- check-ins
- tool retrieval
- resource provenance
- coping sessions
- effectiveness feedback
- space creation
- permissions
- safety routing

Data
Use relational persistence for durable user-owned data.

Core entities:
users, profiles, tools, tool_sources, tool_usage, spaces, space_assets, check_ins, safety_profiles, resource_catalog.

## 5. Coping retrieval engine
Do not start with an LLM. The first retrieval system should be deterministic and explainable.

Inputs:
- current state
- optional distress level
- preferred tools
- trigger tags
- recent helpfulness
- therapist-curated status
- favorites

Output:
- 3 to 5 relevant tools
- a clear reason for each
- no unsupported clinical claims

Example:
state = overwhelmed
preferences = sensory + movement
history = walking helpful 8/10

Result:
1. Walk outside
2. Grounding Garden
3. 60-second breathing

Later, an AI ranking layer can sit behind the same interface.

## 6. SootheSpot Agent
The agent is a constrained creation assistant.

Pipeline:
user intent
-> structured intent
-> safety/content check
-> approved component palette
-> ExperienceSpec
-> renderer
-> sanitization and validation
-> sandbox
-> preview
-> save, edit, or discard

Generate a structured ExperienceSpec first rather than trusting arbitrary model HTML.

ExperienceSpec should support:
- title
- mood
- duration
- visual theme
- breathing
- ambient audio
- prompts
- journal
- timers
- approved assets

The renderer converts the specification into the interactive experience.

## 7. HTML sandbox security
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

## 8. Safety architecture

CHECK-IN
|
+-- okay -> normal toolbox
|
+-- struggling -> coping mode -> try tool -> reassess
|
+-- explicit safety concern -> safety plan / trusted support / crisis resources / emergency services when appropriate

Do not use an LLM as the final classifier for immediate danger.

## 9. Therapist architecture
Therapist functionality is additive, not controlling.

Therapists can:
- recommend tools
- curate resources
- create assignments
- view agreed-upon usage summaries
- add resources with appropriate permissions

Private journal entries and client-created content should not be visible to therapists by default. Sharing requires explicit client permission.

## 10. Privacy architecture
Default flow:

Client device
-> SootheSpot API
-> relational database / encrypted object storage
-> optional AI provider

For AI:
- send minimum necessary context
- avoid identifying information
- separate identity from content where practical
- document external processors
- make provider selection configurable
- never expose API keys in the browser

Keep the architecture compatible with future local/private AI.

## 11. Suggested technical stack
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

## 12. Repository structure

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
    spaces/
    safety/
    permissions/
  lib/
    db/
    auth/
    ai/
    safety/
    validation/
    analytics/
  tests/
    unit/
    e2e/
  docs/
  AGENTS.md
  README.md

If the existing implementation adopts a different framework, preserve these logical boundaries instead of rewriting solely to match this tree.

## 13. Agent contracts
Every coding agent should receive:
- objective
- files it may modify
- acceptance criteria
- tests required
- security considerations
- dependencies
- definition of done

Agents should not silently redesign unrelated architecture.

## 14. Core product loop
Notice -> Check in -> Retrieve personal tools -> Try something -> Reassess -> Remember what helped.

The central design goal is simple:

When someone is having a hard moment, reduce the distance between "I need something" and "here is something I already know can help."
