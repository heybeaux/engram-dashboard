# Playwright Visual Audit

Engram Dashboard has two Playwright layers:

- `pnpm test:e2e` — normal CI E2E smoke tests.
- `pnpm test:e2e:visual` — opt-in visual audit suite for broad page coverage, screenshot evidence, console errors, page errors, bad HTTP responses, and obvious placeholder copy.

The visual audit is intentionally **not** part of the default E2E run yet. The first sweep exposed multiple existing UI/API integration failures, so the audit should be used to generate evidence and then fixed in batches until it can be promoted into required CI.

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

Routes live in `e2e/page-manifest.ts`. The opt-in suite uses `playwright.visual.config.ts` so `e2e/visual-audit.ts` is not discovered by normal `pnpm test:e2e` runs. and are grouped as:

- auth pages
- public docs pages
- authenticated dashboard pages

Authenticated dashboard routes use a minimal unsigned JWT cookie because the middleware accepts decoded JWTs when `JWT_SECRET` is unset in local/test mode. The audit does not fake successful backend data; API failures still surface as console errors or bad responses.

## First-run findings from this PR

A local Chromium sweep produced 55 passing checks and 16 failing checks. The failures are useful backlog signal, not harness defects:

- docs pages with generic `404`/placeholder-like text trips
- authenticated dashboard routes redirecting to `/login`
- missing API proxy route: `/api/engram/v1/notifications/config`
- unauthorized user fetches on `/users`
- Engram Code project route fetch errors
- several data-dependent pages that render but emit console/API failures

## Promotion path

1. Land the audit harness.
2. Fix failing pages in small batches.
3. Reduce allowlisted console noise.
4. Add visual snapshots for stable pages.
5. Move `pnpm test:e2e:visual` into required CI once the suite is green and stable.
