# Engram Dashboard QA Bug Report

**Date:** 2026-03-18  
**Branch:** `fix/dashboard-qa-bugfixes`  
**Base URL:** `https://engram-dashboard.shuehome.net`  
**API URL:** `https://engram-api.shuehome.net`

## Pages Tested

| # | Page | Route | Status | Issues |
|---|------|-------|--------|--------|
| 1 | Dashboard | `/dashboard` | ✅ Clean | — |
| 2 | Memories | `/memories` | ✅ Clean | — |
| 3 | Graph | `/graph` | ✅ Clean | — |
| 4 | Merge Review | `/memories/merge-review` | ✅ Clean | — |
| 5 | Consolidation | `/consolidation` | ✅ Clean | — |
| 6 | Pools | `/pools` | ✅ Clean | — |
| 7 | Sessions | `/sessions` | ✅ Clean | — |
| 8 | Analytics | `/analytics` | ⚠️ API-only | BUG-1: analytics endpoints 404 |
| 9 | Insights | `/insights` | ✅ Clean | — |
| 10 | Notifications | `/insights/notifications` | ✅ Clean | — |
| 11 | Sources | `/sources` | ✅ Clean | — |
| 12 | Emails | `/emails` | ✅ Clean | — |
| 13 | Identity | `/identity` | ✅ Clean | — |
| 14 | Profiles | `/identity/profiles` | ✅ Clean | — |
| 15 | Agents | `/agents` | ✅ Clean | — |
| 16 | Teams | `/identity/teams` | ❌ CRASH | BUG-2: "Something went wrong" |
| 17 | Contracts | `/identity/contracts` | ✅ Clean | — |
| 18 | Tasks | `/identity/tasks` | ✅ Clean | — |
| 19 | Challenges | `/identity/challenges` | ✅ Clean | — |
| 20 | Trust | `/identity/trust` | ❌ CRASH | BUG-3: "Something went wrong" |
| 21 | Delegation | `/delegation` | ✅ Clean | — |
| 22 | Delegation Recall | `/delegation/recall` | ✅ Clean | — |
| 23 | Identity Recall | `/identity/recall` | ✅ Clean | — |
| 24 | Export | `/identity/export` | ✅ Clean | — |
| 25 | Code Search | `/code` | ✅ Clean | — |
| 26 | Code Projects | `/code/projects` | ✅ Clean | — |
| 27 | Settings | `/settings` | ✅ Clean | — |
| 28 | API Keys | `/api-keys` | ✅ Clean | — |
| 29 | Sync | `/settings/sync` | ✅ Clean | — |
| 30 | Cloud Link | `/settings/cloud` | ✅ Clean | — |
| 31 | Reconcile | `/settings/reconcile` | ✅ Clean | — |
| 32 | Users | `/users` | ✅ Clean | — |
| 33 | Ensemble Drift | `/ensemble/drift` | ✅ Clean | — |
| 34 | Status | `/status` | ✅ Clean | — |
| 35 | Onboarding | `/onboarding` | ✅ Clean | — |
| 36 | Docs | `/docs` | ✅ Clean | — |
| 37 | Forgot Password | `/forgot-password` | ✅ Clean | — |
| 38 | Login | `/login` | ⚠️ Minor | BUG-4: /v1/instance/info 404 (graceful fallback) |
| 39 | Signup | `/signup` | ⚠️ Minor | BUG-5: /terms link 404 |

## Bug Details

### BUG-1: Analytics page — "Failed to Load Analytics" (API-side, not fixable in dashboard)
- **Severity:** Low (cloud-only feature)
- **Page:** `/analytics`
- **Cause:** API has no `/v1/analytics/*` endpoints (summary, timeline, breakdown/type, breakdown/layer). These are cloud-only features not present in the self-hosted API.
- **Dashboard behavior:** Shows "Failed to Load Analytics" error box with retry button. The `useAnalytics` hook catches all errors gracefully.
- **Fix:** Not a dashboard bug. The dashboard already handles this. Could optionally hide the Analytics nav item when `instance/info` indicates self-hosted edition.

### BUG-2: Teams page — "Something went wrong" (CRASH) ✅ FIXED
- **Severity:** HIGH
- **Page:** `/identity/teams`
- **Cause:** `identityApi.listAgents()` returns raw API response `{agents: [...]}` but the Teams page expects a plain `Agent[]` array. When `Promise.all([listTeams(), listAgents()])` resolves, `agents` is an object, and calling `.map()` on it crashes React's error boundary.
- **Root Cause:** API returns `{agents: [...]}` wrapper but `listAgents()` in `identity-api.ts` doesn't unwrap it.
- **Fix:** Added response unwrapping in `listAgents()`: `Array.isArray(res) ? res : (res?.agents ?? [])`

### BUG-3: Trust page — "Something went wrong" (CRASH) ✅ FIXED
- **Severity:** HIGH
- **Page:** `/identity/trust`
- **Cause:** Same as BUG-2. The Trust page calls `identityApi.listAgents()` on mount to populate the agent selector. The `{agents: [...]}` wrapper causes `a.length` to be undefined and `a[0].id` to throw.
- **Fix:** Same fix as BUG-2 — `listAgents()` now unwraps the response.

### BUG-4: Login page — /v1/instance/info 404 (graceful)
- **Severity:** Low
- **Page:** `/login` (and all pages via layout)
- **Cause:** API has no `/v1/instance/info` endpoint. The `useInstanceInfo` hook fetches this on page load.
- **Dashboard behavior:** Falls back to `DEFAULT_INSTANCE_INFO` gracefully. No user-visible error.
- **Fix:** Not needed — already handled. Console 404 is cosmetic only.

### BUG-5: Signup page — /terms link 404
- **Severity:** Low
- **Page:** `/signup`
- **Cause:** Signup form links to `/terms` but no terms page exists in the dashboard.
- **Fix:** Not critical for self-hosted deployment.
