# SootheSpot Digital Bookshelf Roadmap

Last updated: 2026-10-10

The Bookshelf is a navigational library, not a clinical ranking engine. It has seven shelves: Read, Listen, Practice, Watch, Sleep & Rest, Understand Yourself, and Reach Out. The core library must work without AI and preserve source attribution, privacy, user choice, and safety boundaries.

## Dependency order

1. Catalog integrity: validate external resources and book references together, detect duplicate IDs, validate URLs/dates/shelves/durations/provenance, and require bibliographic metadata for books. Run the checks in CI.
2. Metadata normalization: add a controlled format field separate from device/platform, standardize language and locale metadata, distinguish publisher region from confirmed availability, clarify duration semantics, and document source-backed accessibility, privacy, and cultural-context reviews.
3. Resource expansion: balance trustworthy primary-source resources across all seven shelves, languages, formats, price points, and regions. Mark unknowns as unknown. Do not infer cultural fit from language or geography and do not copy protected text.
4. Deterministic retrieval: add transparent filters for format, region, cost, accessibility, and independent versus therapist-supported use. Unknown metadata must not satisfy a hard filter. Never use popularity ordering or hidden efficacy scores.
5. Shelf UX and accessibility: expose format, publisher, language, duration when known, limitations, provenance, and external-link behavior. Audit keyboard, screen reader, focus, contrast, reduced motion, mobile layouts, and empty states.
6. Maintenance: produce non-mutating broken-link and stale-metadata reports. Require human review for clinical, privacy, cultural, and regional changes.

## Current snapshot

The default-branch catalog currently contains 20 external-resource records and 5 bibliographic book records. This is a count, not a quality claim. Verified metadata does not mean SootheSpot independently established clinical effectiveness.

## Book reference rule

Store bibliographic metadata and link to the publisher or authoritative catalog. Do not store copied chapters, passages, worksheets, or proprietary summaries. Record author, edition/title, publisher, publication year, ISBN when available, source URL, access/format, limitations, and review date.
