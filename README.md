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

The application started on `feat/mvp-core-loop`; the next reliability milestone is on
`feat/trustworthy-toolbox`. The default branch may still show the original planning
documents while the application PRs are under review.

Demo address: [SootheSpot](https://luisv8181.github.io/SootheSpot/).
Deployment status is available in the **Deploy SootheSpot Demo** Actions workflow.

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

The public demo uses browser-local storage only. It does not require an account and should not be used for sensitive personal information. Production authentication, durable persistence, and permission-aware sharing remain separate from the demo.

## Run and verify

Use Node.js 24 (CI uses the same major version):

```sh
npm ci
npm run dev
```

Verification:

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
python scripts/validate_resources.py
```

Browser tests serve the production export from `out/` on localhost port 3107, including
desktop and mobile Chromium. Run the build before those tests. For the Pages deployment,
set `DEPLOY_TARGET=github-pages` for both build and browser tests; it adds `/SootheSpot`
to the asset and preview paths. Ordinary CI does not imply a Pages build.

## Your data and recommendations

- Save, feedback, and deletion failures are visible. Unreadable collections are left
  untouched; export includes their raw stored values for recovery.
- **You → Your memory, your choice** exports a JSON backup, removes individual feedback,
  resets learned history, restores hidden suggestions, or clears all demo data.
- **Don't recommend this** excludes a tool without removing it from your toolbox.
- Removing a saved resource or seeded tool does not erase feedback. Deleting a custom
  tool also deletes its feedback and exclusion. Destructive history/tool deletion asks
  for confirmation.
- Writes are serialized across app tabs using Web Locks and fresh storage reads. Use
  a modern browser on HTTPS or localhost. Browsers without Web Locks can browse tools
  but cannot save changes or export. Browser-local storage is not an encrypted vault
  or durable cloud backup. Export is a readable JSON file; import is not implemented.

Support options are available from **I need support** and **You**. US/Canada numbers
only appear after an explicit country choice. Other locations can use Find A Helpline.
The phone field opens the device dialer and is never saved by SootheSpot. Region is
temporary, never inferred from language. These links send no check-in/toolbox content.

## Deployment and dependencies

Pages must be enabled with GitHub Actions as its source. The deployment workflow tests
the exported site before uploading it, deploys `main` after merge, and uses the committed
npm lockfile. Main is not automatically merged. The existing `github-pages` environment
only permits `main`; preview branches must not bypass that deployment policy.

The PostCSS override pins 8.5.28 to avoid the transitive advisories in Next.js 15's
older pinned version. Vitest is on 4.1.11 or later for its mocker security fix.
Recheck the override when upgrading Next.js. No forced major framework upgrade is used.
