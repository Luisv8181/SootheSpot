# SootheSpot

**Your tools. Your space. A calmer you.**

SootheSpot is a personal emotional-regulation toolbox combining therapist-curated tools, client-created coping strategies, trusted resources, and AI-assisted interactive experiences.

## Core surfaces

- Check-in
- Personal Toolbox
- Therapist-curated tools
- Client-created tools
- Trusted resources
- External Resource Registry
- SootheSpot Worlds
- AI creation studio
- Journal
- Safety pathway

## The idea

When someone is having a hard moment, the right tool should already be close at hand.

Clients can collect things that help them, discover what works through experience, and eventually create personalized interactive SootheSpot Worlds with an agent.

## Start here

Read:

1. AGENTS.md
2. docs/ARCHITECTURE.md
3. docs/PRODUCT_SPEC.md
4. docs/ROADMAP.md

SootheSpot is mobile-first and privacy-, accessibility-, and safety-conscious.

SootheSpot is not an emergency response service or replacement for professional or emergency care.


## MVP implementation

The first running application is now on the `feat/mvp-core-loop` branch.

Implemented:
- Mobile-first Next.js application shell
- Check-in flow
- Deterministic coping-tool retrieval
- Personal Toolbox
- Saved external resources
- Resource Explorer backed by the curated registry
- Lightweight helpfulness feedback
- Browser-local persistence for this prototype
- Context/Culture/Privacy/Agency surface
- Explicit safety boundary
- Unit tests for deterministic retrieval

This prototype intentionally does not call an AI provider. The core product loop must work before AI becomes an enhancement layer.

Next implementation milestone: authentication, durable database persistence, richer client-created tools, and permission-aware sharing.
