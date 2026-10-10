# SootheSpot Digital Bookshelf & Resource Library Roadmap

Last updated: 2026-10-10

## Product contract

The Bookshelf is a navigational library, not a clinical ranking engine. Its seven shelves are **Read**, **Listen**, **Practice**, **Watch**, **Sleep & Rest**, **Understand Yourself**, and **Reach Out**. People must be able to browse without AI, filter by a stated need, and open the original source. Results should expose provenance, scope, limits, and unknowns well enough for an informed choice.

Never infer cultural fit from language, nationality, ethnicity, or region. Translation is not proof of cultural adaptation. Keep crisis and safety resources on the dedicated safety pathway when appropriate; ordinary coping retrieval must not replace crisis routing. Store bibliographic metadata for books, not copied chapters, passages, worksheets, or proprietary summaries.

## Dependency-ordered work

### 0. Catalog integrity and release gates
- [ ] Validate the external-resource and book catalogs together.
- [ ] Detect duplicate IDs across catalogs.
- [ ] Validate HTTPS URLs, ISO verification dates, review states, shelf IDs, duration values, and provenance for verified entries.
- [ ] Require book author, publication year, ISBN checksum, Read shelf, and a bibliographic-only license note.
- [ ] Run catalog validation and unit tests in CI.
- [ ] Add schema-level validation against resources/schema.json and keep the schema synchronized with runtime types.
- [ ] Add a non-destructive report for missing or stale metadata; never silently upgrade review status.

### 1. Normalize metadata before expanding the catalog
- [ ] Add a controlled formats field distinct from device/platform support: article, audio, video, interactive exercise, print book, eBook, mobile app, and similar.
- [ ] Separate publisher region from confirmed availability regions; unknown availability must not read as verified coverage.
- [ ] Standardize language/locale codes while retaining human-readable labels for display.
- [ ] Define duration semantics: exact session length, selectable options, estimated reading time, or unknown. Unknown duration must not satisfy a time cap.
- [ ] Add provenance and review timestamps for scope, privacy, and cultural-context checks where relevant.
- [ ] Keep accessibility claims source-backed; otherwise state that conformance has not been independently audited.

### 2. Expand trustworthy coverage shelf by shelf
- [ ] Prioritize primary publishers, public health agencies, established nonprofit providers, libraries, and community-reviewed organizations.
- [ ] Balance coverage across all seven shelves rather than adding near-duplicates to one category.
- [ ] Include free and paid options, different formats, multilingual sources, and resources outside the United States.
- [ ] Record intended population, independent-use suitability, account/cost requirements, data practices, accessibility evidence, geographic availability, limitations, and what was actually checked.
- [ ] Preserve attribution and link to original publishers. Do not copy copyrighted content.
- [ ] Use community-informed status only when a documented review process supports it.

### 3. Improve deterministic, need-based retrieval
- [x] Browse by explicit shelf, search, need, language, and available duration.
- [x] Avoid popularity ordering and hidden efficacy scores.
- [ ] Add filters for format, region, cost, accessibility, and independent versus therapist-supported use.
- [ ] When a user applies a constraint, exclude records whose metadata is unknown and provide a clear way to relax that constraint.
- [ ] Show a plain-language reason for a match based only on recorded metadata.
- [ ] Keep safety routing separate from ordinary retrieval and add regression tests for safety-resource isolation.

### 4. Make each shelf useful and accessible
- [x] Provide shelf navigation and counts.
- [x] Show publisher, language, duration when known, and a collapsible limits/context section.
- [ ] Distinguish resource format from device/platform on each card.
- [ ] Audit keyboard navigation, screen-reader labels, focus visibility, contrast, and reduced motion.
- [ ] Make external-link behavior clear before a user leaves SootheSpot.
- [ ] Test shelf counts, search, filters, and saved-resource flows on mobile and desktop.

### 5. Maintain the library
- [ ] Produce scheduled, non-mutating broken-link and redirect reports.
- [ ] Flag records beyond a documented freshness window.
- [ ] Require human review before changing clinical, privacy, cultural, or regional claims.
- [ ] Track corrections and deprecations with provenance instead of silently deleting history.
- [ ] Provide a contribution/review workflow with reviewer, rationale, and date.

## Current catalog snapshot

The default-branch catalog contains 20 external-resource records and 5 bibliographic book records at the time of this update. This count is a snapshot, not a quality claim: a verified record means its cited metadata was checked against source material, not that SootheSpot independently established clinical effectiveness.

## Definition of done for a new record

1. Official publisher/source URL checked.
2. Short factual description, not copied protected text.
3. Explicit primary shelf and need tags.
4. Language, format, duration, region, access, accessibility, privacy, and cultural-context fields filled where evidence exists; unknowns marked rather than guessed.
5. Intended population, use context, limitations, and provenance recorded.
6. No unsupported claim that the resource is universally best or clinically effective.
7. Automated validation passes and safety boundaries remain intact.
