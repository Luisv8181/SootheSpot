# SootheSpot Roadmap

## Phase 0 - Foundation
- [ ] Next.js/TypeScript app
- [ ] design tokens
- [ ] authentication
- [ ] database schema
- [ ] test infrastructure
- [ ] privacy/security baseline
- [ ] CI

## Phase 1 - Personal Toolbox
- [ ] Home/check-in
- [ ] Tool model
- [ ] Client-created tools
- [ ] provenance model
- [ ] favorites
- [ ] tool usage
- [ ] helpfulness feedback
- [ ] search/filter
- [ ] safety pathway

## Phase 2 - Trusted Resources + Therapist Layer
- [x] curated external resource catalog foundation
- [x] resource verification metadata
- [x] resource provenance and contribution workflow
- [x] resource registry CI validation
- [ ] Resource Explorer UI
- [ ] Save external resources to My Toolbox
- [ ] agent resource-search tool
- [ ] therapist recommendations
- [ ] permission model
- [ ] client-controlled sharing
- [ ] therapist dashboard
- [ ] session-to-tool workflow

## Phase 3 - SootheSpot Worlds
- [ ] ExperienceSpec
- [ ] approved component library
- [ ] World renderer
- [ ] sandboxed iframe
- [ ] audio/visual assets
- [ ] save/favorite
- [ ] reduced-motion mode
- [ ] accessibility audit

## Phase 4 - SootheSpot Agent
- [ ] provider abstraction
- [ ] intent extraction
- [ ] ExperienceSpec generation
- [ ] safety/content validation
- [ ] preview
- [ ] edit
- [ ] regenerate
- [ ] save
- [ ] agent evaluation suite

## Phase 5 - Personalization
- [ ] trigger-to-tool matching
- [ ] effectiveness history
- [ ] preference learning
- [ ] "what tends to help you" surface
- [ ] client-controlled personalization
- [ ] optional therapist insights

## Phase 6 - Privacy + Scale
- [ ] external AI provider controls
- [ ] data minimization review
- [ ] audit logging
- [ ] export/delete
- [ ] regional resources
- [ ] private/local model experimentation
- [ ] formal security review

## Agent priority rule
Build in roadmap order unless a task explicitly depends on later architecture.

Never implement the AI World generator before:
1. basic toolbox works
2. ExperienceSpec exists
3. sandbox exists
4. safety/content validation exists

## MVP definition
MVP is complete when a client can go:
hard moment -> check-in -> personal tool -> try -> feedback

without requiring an AI model. AI is an enhancement, not the foundation.
