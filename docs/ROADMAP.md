# SootheSpot Roadmap

## North Star

SootheSpot is a personal operating layer for emotional regulation.

The product should reduce the distance between:

> **"I need something"**

and

> **"Here is something I already know may help."**

The core loop must remain useful without an AI model:

```
Hard moment
    ↓
Check in
    ↓
Add only the context the person chooses to share
    ↓
See a few transparent options
    ↓
Try something
    ↓
Give lightweight feedback
    ↓
Remember what helped and under what circumstances
    ↓
Improve future matching
```

AI is an enhancement and coordination layer, not the foundation.

---

## Current product state

The active MVP branch already includes:

- [x] Next.js + TypeScript mobile-first application
- [x] calm native-feeling design system
- [x] English / Spanish core UI paths
- [x] emotional check-in
- [x] explicit support pathway separated from ordinary coping retrieval
- [x] deterministic, explainable recommendation engine
- [x] available-time context
- [x] optional user-selected situational context
- [x] language compatibility filtering
- [x] positive and negative feedback influencing future matching
- [x] state-aware feedback history
- [x] situation-aware feedback history
- [x] client-created tools
- [x] Personal Toolbox
- [x] browser-local prototype persistence
- [x] saved external resources
- [x] Resource Explorer
- [x] provenance model
- [x] "What SootheSpot is learning" prototype surface
- [x] three deterministic SootheSpot Worlds
- [x] bounded World timers
- [x] reduced-motion support
- [x] clear-demo-data control
- [x] CI, test infrastructure, and production build validation
- [x] product, privacy, architecture, resource, and interface standards

The current branch proves the core thesis:

> SootheSpot can learn from the person's own reported experience without diagnosing, defining, or surveilling them.

---

# Phase 1 — Harden the Core Personal Toolbox

## Goal
Turn the current prototype loop into a durable, trustworthy personal product.

### Core loop
- [x] Home / check-in
- [x] Tool model
- [x] client-created tools
- [x] provenance model
- [x] saved tools
- [x] helpfulness feedback
- [x] search / filter
- [x] safety pathway
- [x] available-time matching
- [x] explicit situation/context selection
- [x] deterministic recommendation reasons
- [ ] optional post-tool reassessment
- [ ] archive / restore tools
- [ ] richer favorite / pin behavior
- [ ] recent-tool history
- [ ] "use again" flow
- [ ] empty-state onboarding

### Personal coping history
- [x] effectiveness history prototype
- [x] state-specific history
- [x] situation-specific history
- [x] positive and negative weighting
- [x] first "what SootheSpot is learning" surface
- [ ] dedicated tool-usage event model
- [ ] completion / abandonment tracking
- [ ] optional before/after state
- [ ] history by time available
- [ ] history by environment / modality
- [ ] user correction controls
- [ ] hide / reset a learned pattern
- [ ] explain exactly why a recommendation was shown
- [ ] longitudinal personal pattern summaries

### Context
Context must remain explicit and partial. Missing information is never invented.

Current:
- [x] emotional state
- [x] available time
- [x] user-selected situation
- [x] language

Next:
- [ ] preferred modality: movement / sensory / audio / writing / stillness
- [ ] current constraints: discreet / screen-free / no audio / no breathing
- [ ] accessibility preferences
- [ ] optional trigger/context tags
- [ ] configurable context defaults
- [ ] context controls that can be skipped without penalty

Success condition:

> A person can reach a personally relevant option in seconds, and the system becomes more useful from their own feedback without making clinical assumptions.

---

# Phase 2 — Durable Personal Memory

## Goal
Move from a browser-local demo to a real user-owned personal toolbox.

### Accounts + persistence
- [ ] authentication
- [ ] relational database schema
- [ ] durable check-ins
- [ ] durable tool usage
- [ ] durable feedback history
- [ ] durable custom tools
- [ ] durable saved resources
- [ ] saved Worlds
- [ ] sync across devices
- [ ] schema migrations / versioning
- [ ] offline / degraded-mode behavior

### User control
- [ ] export personal data
- [ ] delete individual records
- [ ] delete all personal data
- [ ] reset personalization without deleting the toolbox
- [ ] inspect learned preferences
- [ ] correct learned preferences
- [ ] choose what is remembered
- [ ] retention controls

### Privacy baseline
- [x] minimum-necessary-data principle documented
- [x] client ownership principle documented
- [x] browser-local demo privacy boundary
- [ ] encrypted durable storage
- [ ] least-privilege access controls
- [ ] identity/content separation where practical
- [ ] privacy review for every new context field
- [ ] auditability for sensitive access

Success condition:

> SootheSpot feels like a personal emotional-regulation memory that the user owns and can inspect, correct, export, or erase.

---

# Phase 3 — Trusted Resources + Therapist Layer

## Goal
Make SootheSpot the organized home for tools that already surround a person's coping process.

### Resource Explorer
- [x] curated external resource catalog foundation
- [x] resource verification metadata
- [x] provenance and contribution workflow
- [x] resource registry CI validation
- [x] Resource Explorer UI
- [x] save external resources to Personal Toolbox
- [ ] richer language metadata
- [ ] regional availability metadata
- [ ] accessibility metadata
- [ ] cultural adaptation metadata
- [ ] cost / access metadata
- [ ] stale-resource detection
- [ ] agent-compatible resource search contract
- [ ] larger reviewed resource set
- [ ] community-informed review workflow

### Therapist layer
- [ ] therapist accounts / role model
- [ ] therapist recommendations
- [ ] therapist-created tools
- [ ] therapist-suggested Worlds
- [ ] permission model
- [ ] client-controlled sharing
- [ ] "share this pattern" control
- [ ] therapist dashboard
- [ ] session-to-tool workflow
- [ ] treatment-goal organization
- [ ] agreed-upon usage summaries
- [ ] revoke sharing at any time

Private by default:
- client-created tools
- journal entries
- private AI conversations
- unrelated personal history
- unshared coping patterns

Success condition:

> A therapist can contribute useful tools without becoming the owner or default observer of the client's private SootheSpot space.

---

# Phase 4 — SootheSpot Worlds

## Goal
Let people create and keep small, beautiful, safe interactive experiences that fit a specific moment.

### Current prototype
- [x] Worlds surface
- [x] Ocean Calm
- [x] Soft Focus
- [x] Grounding Garden
- [x] reduced-motion handling
- [x] bounded timers

### World platform
- [ ] ExperienceSpec
- [ ] schema validation
- [ ] approved component library
- [ ] World renderer
- [ ] sanitization layer
- [ ] sandboxed iframe
- [ ] restrictive CSP
- [ ] narrow postMessage protocol
- [ ] block arbitrary network requests
- [ ] approved audio / visual asset system
- [ ] saved / favorited Worlds
- [ ] World editing
- [ ] World duplication / remixing
- [ ] localization
- [ ] accessibility controls
- [ ] full accessibility audit

### Approved experience components
Potential component palette:

- [ ] breathing rhythm
- [ ] visual focus
- [ ] grounding prompts
- [ ] timer
- [ ] ambient audio
- [ ] journaling prompt
- [ ] movement prompt
- [ ] sensory activity
- [ ] affirmation / reminder
- [ ] user-provided image or phrase
- [ ] low-stimulation sleep mode

Success condition:

> A user can turn a coping intention into a safe interactive experience without giving an AI arbitrary code execution privileges.

---

# Phase 5 — SootheSpot Agent

## Goal
Make AI the connective tissue across a system that is already useful without it.

The agent should organize, search, personalize, and create. It should not impersonate a therapist.

### Core agent architecture
- [ ] provider abstraction
- [ ] structured intent extraction
- [ ] minimum-necessary context selection
- [ ] known-vs-inferred context distinction
- [ ] toolbox search tool
- [ ] resource-search tool
- [ ] World search tool
- [ ] ExperienceSpec generation
- [ ] safety / content validation
- [ ] provenance-preserving responses
- [ ] transparent recommendation reasons
- [ ] preview
- [ ] edit
- [ ] regenerate
- [ ] save / discard
- [ ] agent evaluation suite

### Example target interaction

> "I'm overwhelmed at work. I have five minutes. I don't want a breathing exercise and I need something discreet."

The agent should be able to reason over:

1. the person's own tools
2. what has helped in similar situations
3. therapist-suggested tools the person has accepted
4. saved trusted resources
5. available Worlds
6. explicit preferences and constraints

It should return a few transparent options rather than one authoritative answer.

### Agent boundaries
- [ ] never diagnose
- [ ] never treat model inference as user-provided fact
- [ ] never silently infer culture
- [ ] never become the final classifier for immediate danger
- [ ] never bypass sharing permissions
- [ ] never expose more personal context to a provider than necessary
- [ ] never generate arbitrary executable content into the application DOM

Success condition:

> The agent coordinates the ecosystem without becoming the ecosystem.

---

# Phase 6 — Journal + Reflection

## Goal
Offer optional private reflection without turning SootheSpot into a surveillance diary.

- [ ] private journal
- [ ] structured reflection prompts
- [ ] post-tool notes
- [ ] attach a reflection to a tool use
- [ ] user-controlled tags
- [ ] local/private search
- [ ] explicit therapist sharing per entry or summary
- [ ] export / delete
- [ ] AI reflection assistance only when explicitly invoked
- [ ] no automatic therapist visibility
- [ ] no use of private journal content for recommendations without explicit permission

Success condition:

> Reflection can deepen personal understanding while remaining private by default.

---

# Phase 7 — Global, Cultural, Accessibility + Regional Expansion

## Goal
Make SootheSpot genuinely usable across languages, countries, communities, and access needs without using stereotypes as shortcuts.

### Localization
- [x] English / Spanish foundation
- [ ] complete Spanish localization
- [ ] locale-aware formatting
- [ ] scalable translation architecture
- [ ] additional languages
- [ ] right-to-left support readiness

### Context + culture
- [x] culture / language / region separation documented
- [x] no culture inference from language, nationality, ethnicity, or location
- [ ] explicit user-controlled cultural preferences
- [ ] community-informed adaptation metadata
- [ ] culturally adapted resource review
- [ ] communication-style preferences
- [ ] user-controlled cultural references in Worlds

### Regional resources
- [ ] country / region scope
- [ ] local care-system metadata
- [ ] regional crisis / safety resources
- [ ] explicit region confirmation where routing matters
- [ ] access requirements by region
- [ ] regional terminology and limitations

### Accessibility
- [x] reduced-motion baseline
- [x] visible keyboard focus baseline
- [ ] screen-reader audit
- [ ] modal focus trapping / return
- [ ] contrast audit
- [ ] dynamic text / zoom audit
- [ ] low-vision modes
- [ ] hearing-accessible alternatives
- [ ] motor-accessible interaction review
- [ ] cognitive-load usability review

Success condition:

> The product adapts to explicitly provided context and access needs without pretending that demographic labels explain a person.

---

# Phase 8 — Privacy, Security + Scale

## Goal
Make the mature product trustworthy enough for long-term personal use and optional care-team integration.

- [ ] external AI provider controls
- [ ] configurable provider selection
- [ ] private / local model experimentation
- [ ] data-minimization review
- [ ] permission audit
- [ ] sensitive-access audit logging
- [ ] formal threat model
- [ ] formal security review
- [ ] abuse / misuse review
- [ ] dependency and supply-chain review
- [ ] backup / recovery strategy
- [ ] incident-response plan
- [ ] production observability without collecting unnecessary personal content
- [ ] performance testing
- [ ] scalable resource operations
- [ ] scalable localization operations

Success condition:

> Privacy, security, and agency remain architectural properties as the product grows.

---

# Full-Potential Product

At maturity, SootheSpot should function as a user-owned emotional-regulation memory.

It can contain:

- things the person already knows help
- therapist-suggested tools they chose to keep
- trusted external resources
- personally created routines
- saved SootheSpot Worlds
- optional private reflections
- explicit preferences
- accessibility needs
- context-specific helpfulness history
- user-approved shared insights

The system should increasingly be able to answer:

> **"Given how I feel, the situation I'm in, the time I have, my preferences, and my own past experience, what are a few things worth trying right now?"**

without turning that answer into a diagnosis or a claim of clinical efficacy.

At full potential, the intelligence should mostly feel invisible.

The product should feel less like talking to an AI and more like opening a personal drawer that is already organized around the things that help.

---

# Product Success Measures

Prefer usefulness measures over engagement measures.

Potential measures:

- time from opening the app to opening a chosen tool
- number of taps to reach something useful
- percentage of sessions where a user chooses an option
- self-reported helpfulness
- repeat use of personal tools
- percentage of recommendations with a transparent reason
- recommendation correction / dismissal rate
- percentage of personalization the user can inspect and modify
- successful data export / deletion
- accessibility task completion
- user-reported sense of control
- therapist-sharing opt-in / revoke success

Avoid optimizing for:

- streaks
- time spent in app
- compulsive return behavior
- social engagement
- notification volume
- guilt-based retention

---

# Build-Order Rules

Build in dependency order, not novelty order.

Do not implement AI World generation before:

1. the Personal Toolbox works
2. personal history is durable
3. ExperienceSpec exists
4. approved components exist
5. the sandbox exists
6. safety/content validation exists

Do not make therapist data sharing the default.

Do not expand context by silently collecting or inferring information.

Do not optimize personalization by removing user control.

Do not make an LLM the final authority for immediate danger.

---

# MVP Definition

The core MVP is complete when a person can comfortably go:

```
hard moment
    ↓
check-in
    ↓
optional time + situation
    ↓
personal recommendation
    ↓
try tool
    ↓
feedback
    ↓
future matching improves
```

without requiring an AI model.

The next milestone after the current browser-local prototype is **durable personal memory**: authentication, real persistence, explicit tool-usage records, inspectable personalization, and user-controlled export / deletion.
