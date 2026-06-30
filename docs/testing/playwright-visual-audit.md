# Playwright Visual Audit

Engram Dashboard has two Playwright layers:

- `pnpm test:e2e` — normal CI E2E smoke tests.
- `pnpm test:e2e:visual` — opt-in visual audit suite for broad page coverage, screenshot evidence, console errors, page errors, bad HTTP responses, and obvious placeholder copy.

The visual audit is intentionally separate from default E2E. It is designed to generate page-by-page visual evidence and catch UI regressions across the whole product surface without depending on a live seeded Engram backend.

## Run locally

```bash
pnpm install
pnpm test:e2e:visual
```

The command sets `PLAYWRIGHT_VISUAL_AUDIT=1` and runs Chromium only.

Artifacts:

- `playwright-report/` — HTML report
- `test-results/` — screenshots, traces, and error contexts

## Route manifest

Routes live in `e2e/page-manifest.ts`. The opt-in suite uses `playwright.visual.config.ts` so `e2e/visual-audit.ts` is not discovered by normal `pnpm test:e2e` runs.

The manifest is grouped as:

- auth pages
- public docs pages
- authenticated dashboard pages

## Authentication and API data

Authenticated dashboard routes use a signed visual-audit JWT plus matching `localStorage` state. This exercises the same middleware/client auth paths as the dashboard without requiring a real user login.

The suite also installs representative read-only API mocks for broad page rendering:

- dashboard stats/account data
- memories/users
- merge candidates
- sessions
- consolidation reports
- pools
- notifications config
- ensemble status/coverage/eval/re-embedding
- Engram Code projects

This keeps the visual audit deterministic and focused on UI rendering. Live backend/API integration coverage should remain in normal E2E or dedicated integration tests.

## Current state

After the first fix pass, the local Chromium visual audit is green:

```bash
pnpm test:e2e:visual
# 71 passed
```

The initial sweep exposed these classes of issues and the harness now covers them:

- synthetic auth needed to seed both cookie and `localStorage`
- docs pages legitimately mention terms like `404` and should not be treated as generic 404 pages
- notification settings uses `GET /v1/notifications/config` and `POST /v1/notifications/configure`
- API-backed pages need deterministic data to be visually audited without a live seeded backend
- optional Engram Code service failures should render as page state, not noisy console errors

## Promotion path

1. Keep expanding the route manifest as new pages ship.
2. Add stable visual snapshots for the most important pages once layout churn slows down.
3. Add live-backend integration tests for auth/API behavior separately from this mocked visual layer.
4. Move `pnpm test:e2e:visual` into required CI once the suite is stable enough and artifact volume is acceptable.
