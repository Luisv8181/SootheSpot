# Digital Bookshelf & Resource Library Roadmap

**Last reconciled:** 2026-10-09  
**Repository:** [Luisv8181/SootheSpot](https://github.com/Luisv8181/SootheSpot)  
**Follow-up issue:** [#22](https://github.com/Luisv8181/SootheSpot/issues/22)

## Product goal

Make SootheSpot's Digital Bookshelf a calm, navigable, trustworthy library people can use with or without AI. It should help a person choose a resource by need, format, language, time, access constraints, and personal preference without hiding a ranking or implying that a resource is clinically effective for that person.

The seven shelves are **Read**, **Listen**, **Practice**, **Watch**, **Sleep & Rest**, **Understand Yourself**, and **Reach Out**. A resource may appear on more than one shelf where metadata supports it.

## Non-negotiable constraints

- Prefer primary-source pages and keep publisher/source attribution.
- Store links and bibliographic metadata, not copyrighted book chapters, copied source text, or unlicensed quotes.
- Unknown metadata stays unknown. Do not guess duration, price, language availability, accessibility conformance, cultural adaptation, privacy practices, or region eligibility.
- Distinguish **language**, **region**, **cultural context**, **accessibility**, and **intended population** rather than treating one as a proxy for another.
- No opaque resource ranking, hidden effectiveness score, or engagement-maximization pattern.
- Keep the explicit safety/support pathway separate from ordinary coping suggestions. A resource such as a safety-plan app must not be returned as an ordinary coping item.
- Minimize personal data; opening third-party links/embeds may expose connection or interaction data. Prefer direct source links where privacy matters.
- The library must remain searchable and useful without an AI provider. Retrieval should be deterministic and explainable.

## Current state (verified against `main` on 2026-10-09)

- The resource registry contains **20 entries** in `resources/resources.json`, including four NIMH Watch videos.
- `resources/books.json` contains metadata-only bibliographic book references with publisher links.
- Explicit shelf/need retrieval, visual shelf navigation, and a resource metadata quality gate have been merged in earlier PRs.
- The repository's existing validator `scripts/validate_resources.py` validates the resource catalog's JSON structure, unique IDs within that catalog, HTTPS official URLs, required fields, tags, access arrays, review statuses, and provenance for verified records.
- Current CI for the default branch has a failed browser test in the unrelated Ocean Calm paused-canvas behavior. Unit tests and production build passed in that run; do not describe the entire CI suite as green until a fresh run confirms it.
- The older bookshelf presentation PR #9 was closed as superseded. Do not merge it as-is; cherry-pick/reimplement only clearly missing changes on a fresh branch from current `main`.

Counts above describe current source files and are not efficacy ratings or completeness claims.

## Dependency-ordered roadmap

### 1. Establish a consistent metadata contract
- [ ] Define canonical resource and book schemas, including ID, title, creator/author where applicable, publisher, format, official URL, access/cost, languages, intended population, shelf(s), needs, duration semantics, region scope, accessibility, cultural-context notes, provenance, review state/date, and limitations.
- [ ] Distinguish exact media duration, estimated activity time, and book page count. Never treat page count as duration. A duration-filtered query must exclude records without a verified duration unless the UI explicitly offers an “unknown duration” section.
- [ ] Define the primary shelf field and the secondary-shelf field clearly. Normalize duplicate values rather than letting two fields disagree.
- [ ] Record whether metadata was publisher-confirmed, independently verified, inferred from source text (with attribution), or not available.
- [ ] Use explicit review states (for example, unreviewed, screened, verified, clinically reviewed, deprecated) and define what each state means.

### 2. Strengthen data validation before catalog growth
- [ ] Validate both `resources/resources.json` and `resources/books.json`.
- [ ] Detect duplicate IDs across both catalogs.
- [ ] Validate shelf/need vocabulary, date formats, HTTPS provenance URLs, access metadata, review states, and type-appropriate duration/page-count fields.
- [ ] Report missing optional metadata without inventing values. Require stronger evidence/provenance when a record claims to be verified.
- [ ] Add regression tests for multi-shelf records, primary/secondary shelf consistency, unknown duration behavior, and cross-catalog duplication.

### 3. Make browse and need-based retrieval understandable
- [ ] Confirm every shelf has a useful description, empty state, count, and reliable English/Spanish navigation.
- [ ] Allow straightforward filtering by format, language, available time, population, access/cost, region, and accessibility, with unknown values treated transparently.
- [ ] Show “why this appears” using explicit matching metadata, not opaque scoring.
- [ ] Offer a small set of options and allow the person to choose, skip, save, or return to browsing.
- [ ] Explain that shelf placement is not a quality/effectiveness ranking.
- [ ] Keep ordinary resource retrieval and the safety/support route distinct, with explicit region confirmation when location-specific help is needed.

### 4. Improve source reliability and review operations
- [ ] Add scheduled/manual stale-link checks with clear failure reporting; do not automatically mark a source verified merely because it returns HTTP 200.
- [ ] Create a human review trail: reviewer, date, source page checked, fields confirmed, fields left unknown, and next review due.
- [ ] Keep provenance and limitations visible in the resource details.
- [ ] Re-verify high-impact health, sleep, crisis/support, and safety content against primary sources before changing its description or intended use.
- [ ] Deprecate broken/outdated resources with a reason and a replacement only when a legitimate replacement has been verified.

### 5. Fill collection gaps only after quality gates pass
- [ ] Add trustworthy non-meditation audio options, including plain-language educational audio and culturally/community-reviewed material where available.
- [ ] Broaden Sleep & Rest beyond sleep-training apps: sleep-health education, rest routines, shift-work constraints, caregiving realities, and low-stimulation alternatives.
- [ ] Add Watch resources with confirmed duration, transcripts/captions/audio description status when available, and an official landing page.
- [ ] Expand Reach Out with non-emergency peer/community/professional support pathways, access requirements, population scope, and explicit regional limits.
- [ ] Add resources across age groups, languages, disability/access needs, and different cultural contexts without assuming any group has a single preference.
- [ ] Maintain legitimate book references through publisher/catalogue metadata only; do not reproduce book text.

### 6. Verify product usability and safeguards
- [ ] Test mobile widths, keyboard-only browsing, focus visibility, semantic headings, screen-reader names, contrast, and readable text resizing.
- [ ] Test loading, empty, stale/broken external-link, and validation-error states.
- [ ] Test English/Spanish labels and avoid silently claiming that a resource itself has a Spanish edition just because the UI is translated.
- [ ] Confirm external video embeds are opt-in or provide a direct source link with a privacy note.
- [ ] Confirm saves/deletes do not leak sensitive check-in context to external publishers.
- [ ] Keep the resource library functional when AI is unavailable or disabled.
- [ ] Run resource validation, unit tests, type checks, production build, and Playwright tests before calling a change complete.

## Immediate next task

Start with **issue #22**: audit the two catalogs, formalize canonical primary/secondary shelves and duration semantics, and add cross-catalog validation tests. Do this on a new branch from the latest `main`, not on the closed PR #9 branch. Then implement retrieval tests and UI transparency before adding a large new resource batch.

## Definition of done

A resource-library change is ready when the metadata is source-grounded, unknowns are explicit, the feature remains AI-optional, safety and privacy boundaries are tested, mobile/accessibility basics are checked, the docs reflect the implementation, and the complete CI run for the exact commit succeeds.
