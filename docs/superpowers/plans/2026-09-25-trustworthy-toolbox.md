# Trustworthy Toolbox Implementation Plan

**Goal:** Make the browser-local SootheSpot loop reliable, actionable, and controllable.
**Architecture:** Keep retrieval pure. Add a validated storage boundary and pure data
operations; expose them through a hook and focused support/control components.
**Tech Stack:** Next.js, TypeScript, Zod, Vitest, Playwright.

## Execution

- [x] Install dependencies, confirm the original 10 tests, and verify production builds.
- [x] Add failing behavior tests in `tests/storage.test.ts`, `tests/personalization.test.ts`,
  and `tests/support.test.ts`. Verify failure for missing guarantees.
- [x] Implement `domain/data/storage.ts`, `domain/data/actions.ts`,
  `domain/safety/support.ts`; filter excluded IDs in `domain/tools/retrieve.ts`.
- [x] Wire `components/usePersonalData.ts`, `components/PersonalDataControls.tsx`,
  `components/SupportOptions.tsx`, and dialog focus behavior into `app/page.tsx`.
  Keep restored collections independent; failed writes leave visible state unchanged.
- [x] Add bilingual empty states and preserve existing CSS tokens in `app/globals.css`.
- [x] Exercise the complete browser interaction in `tests/e2e/toolbox.spec.ts`.
- [x] Update CI/deployment to `npm ci`, lock dependencies, and validate static paths.
- [x] Run tests, resource validation, build, browser checks, and inspect the diff.
- [ ] Update README/implementation notes, commit only intended files, and publish a
  reviewable PR based on the existing MVP. Verify CI before enabling/deploying Pages.

## Acceptance fixtures

Corrupt `soothespot.customTools` must not hide valid saved IDs. Quota errors must
leave the original stored value and UI unchanged. A failed multi-key delete must
restore prior values when storage permits and report any rollback failure.
Excluding a highly rated tool removes it from retrieval; restoring it returns it.
Deleting a custom tool clears associated history. Resetting feedback preserves the
toolbox and explicit exclusions. No region yields no regional phone number.

## Local verification evidence

- `npm test`: 24 passing unit/contract tests.
- Pages-mode `npm run build`: static export succeeds (149 kB first-load JS).
- Pages-mode `npm run test:e2e`: 16 passing desktop/mobile Chromium checks.
- `python scripts/validate_resources.py`: 10 resource records validated.
- `npm audit --audit-level=moderate`: zero vulnerabilities.
- `node scripts/prove-regressions.mjs`: all five deliberate regressions caught;
  source bytes restored after every probe.
- Independent review caught stale-tab writes and focus loss; browser regressions
  reproduced both before fixes. A follow-up caught exclusion-toggle inversion;
  two-tab tests now verify hide requests remain idempotent.
- Desktop/mobile screenshots inspected. Existing design system was the visual
  reference; React Bits/Motion Primitives catalogs were checked, but new animation
  dependencies were unnecessary for these native controls.
