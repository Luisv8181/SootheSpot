# Resource metadata quality gate

This task is the next implementation step after explicit shelf/need discovery. It improves trust without inventing facts or requiring an AI provider.

## Scope

- [x] Validate both the general-resource catalog and bibliographic book catalog.
- [x] Detect duplicate IDs across both catalogs, not only within one file.
- [x] Validate explicit shelf and need values against the application vocabulary.
- [x] Validate HTTPS official and provenance URLs.
- [x] Validate positive numeric duration options.
- [x] Require provenance and a verification date for verified or clinically reviewed records.
- [x] Report missing high-value metadata fields instead of silently treating unknown as a match.
- [ ] Add regression fixtures covering invalid shelf/need values, duplicate cross-catalog IDs, missing provenance, and invalid durations.
- [ ] Update records using primary sources, distinguishing "not listed" from "not checked".
- [ ] Add UI filter behavior tests for unknown duration, region, language, and accessibility.
- [ ] Run the Python validator, unit tests, typecheck, production build, and browser tests in CI.

## Guardrails

The metadata validator checks catalog integrity; it does not verify clinical efficacy or prove that a resource is culturally adapted, accessible, regionally available, or suitable for an individual. The linked source and verification status must remain visible. Missing values should be reported as gaps, not guessed from language, platform, publisher location, or resource type.
