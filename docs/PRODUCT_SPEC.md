# SootheSpot Product Specification

## Product statement
SootheSpot is a personal space for real-life emotional regulation.

It brings together:
- therapist-curated tools
- client-created coping tools
- trusted online resources
- personalized interactive experiences
- optional AI-assisted creation

## Primary user
A person experiencing everyday emotional distress who wants quick access to coping strategies that are personally meaningful.

## Core navigation
Home: check in and access relevant tools.
Tools: personal coping toolbox.
Spaces: interactive SootheSpot experiences.
Journal: optional reflection, private by default.
You: preferences, accessibility, privacy, and safety settings.

## Primary screen
The first screen asks: "How are you right now?"

Do not make users navigate a large library before getting help.

## Tool object
Every tool supports:
- title
- short description
- category
- provenance
- trigger states
- instructions
- optional media
- optional duration
- favorite
- archive
- helpfulness feedback

## Client creation
A client can create a tool from:
- text
- image
- audio
- link
- routine
- contact
- reminder
- custom experience

Example:
"When I feel overwhelmed, walk outside for five minutes."

The system can turn that into a structured tool.

## Agent creation
Natural-language requests should work:
"Make me something calming."
"Make a grounding exercise with ocean sounds."
"Create a nighttime space where I can journal."

Ask only the minimum clarifying questions needed.

## SootheSpot World
A World is an interactive experience containing approved components:
- breathing animation
- ambient sound
- visual scene
- grounding prompts
- journal
- timer
- affirmation
- movement prompt
- sensory activity

Worlds should feel like small beautiful tools, not games.

## Feedback
After a tool:
"Did this help?"
Options:
- A lot
- A little
- Not really

Optional: "How do you feel now?"

Keep feedback lightweight.

## Non-goals
SootheSpot does not:
- diagnose
- replace therapy
- provide autonomous psychotherapy
- determine clinical safety
- promise to prevent self-harm
- replace emergency services
- generate unrestricted medical treatment plans

## MVP acceptance criteria
A new user can:
1. create an account
2. complete a check-in
3. see personal coping tools
4. open a tool
5. create a custom tool
6. mark a tool helpful
7. create a basic SootheSpot World from a template
8. return to a saved World
9. access the safety pathway
10. delete their content

The core loop must work comfortably on a phone.
