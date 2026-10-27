# RPG-Inspired Coping Skills Atlas MVP

## Status

Prototype implementation on `feat/rpg-coping-skill-tree`. This is an educational prototype, not a clinically validated curriculum. Skill content and therapeutic labels require qualified review before being presented as clinician-curated.

## Experience

The Atlas is an optional, visual progression layer for the existing SootheSpot toolbox. It uses RPG conventions—branch selection, connected skill nodes, a personal loadout, and visible practice history—without streaks, leaderboards, penalties, or gating access to immediate coping and support.

Route: `/skills/`

## Initial branches

- Resilience
- Emotional Mastery
- Mental Flexibility
- Action & Discipline
- Connection
- Purpose & Wisdom

The initial catalog contains 25 skill cards. Each card includes a plain-language use case, short practice steps, a conceptual approach label, and a caution where appropriate. Related-skill links support exploration across branches.

## Progress and privacy

Prototype progress is stored in browser-local storage under `soothespot.skill-tree.v1`:
- practiced skill IDs
- user-selected helpfulness response per skill
- saved skill IDs for a quick-access loadout

No account or AI provider is required. Users can reset progress from the Atlas, and the existing clear-demo-data flow resets Atlas progress as well. Browser-local storage is not an encrypted vault or durable backup.

## Product rules

- Any skill can be opened without satisfying prerequisites; the connections suggest possible learning paths rather than locking users out.
- Recording practice means the user tried a skill, not that they mastered it or achieved clinical improvement.
- Skills are educational and not individualized treatment.
- Immediate coping and safety/support routes remain separate from progression.
- Do not add XP pressure, streaks, penalties, leaderboards, or guilt-based prompts.
- Keep the existing home check-in and Personal Toolbox as the primary coping loop.
- Respect keyboard focus, mobile layouts, and reduced-motion preferences.
- Keep the experience usable if browser storage is unavailable.

## Next steps before production

1. Add source URLs and provenance metadata to each skill record.
2. Have qualified reviewers evaluate accuracy, cautions, and language.
3. Expand English/Spanish skill content with bilingual review rather than direct machine translation alone.
4. Validate local-storage failure/recovery and export behavior.
5. Add automated tests for catalog IDs, branch membership, related/prerequisite references, and persistence.
6. Test the exported GitHub Pages build and mobile/screen-reader interactions.
