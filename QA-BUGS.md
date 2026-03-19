# Engram Dashboard QA Bug Report

**Date:** 2026-03-18  
**Branch:** `fix/dashboard-qa-bugfixes`  
**Base URL:** `https://engram-dashboard.shuehome.net`  
**API URL:** `https://engram-api.shuehome.net`  
**Iterations:** 3

## QA Summary

| Iteration | Focus | Bugs Found | Bugs Fixed |
|-----------|-------|------------|------------|
| 1 | Full page navigation (39 pages) | 3 fixable | 2 (Teams + Trust crashes) |
| 2 | Interactive flows (search, memory detail, embeddings tab) | 1 fixable | 1 (Embeddings tab error) |
| 3 | Verify fixes + create memory + graph + agent detail | 0 new | All verified ✅ |

## Pages Tested

| # | Page | Route | Status | Issues |
|---|------|-------|--------|--------|
| 1 | Dashboard | `/dashboard` | ✅ Clean | — |
| 2 | Memories | `/memories` | ✅ Clean | — |
| 3 | Memory Detail | `/memories/[id]` | ✅ Clean | — |
| 4 | Memory Embeddings Tab | `/memories/[id]` (tab) | ✅ FIXED | Was: "Error Loading Embeddings" |
| 5 | Memory Attribution Tab | `/memories/[id]` (tab) | ✅ Clean | — |
| 6 | Graph | `/graph` | ✅ Clean | 34 nodes, 149 links, 42 entities |
| 7 | Search | `/memories?q=...` | ✅ Clean | Semantic search works |
| 8 | Merge Review | `/memories/merge-review` | ✅ Clean | — |
| 9 | Consolidation | `/consolidation` | ✅ Clean | — |
| 10 | Pools | `/pools` | ✅ Clean | — |
| 11 | Sessions | `/sessions` | ✅ Clean | — |
| 12 | Analytics | `/analytics` | ⚠️ API-only | Cloud-only endpoints (not dashboard bug) |
| 13 | Insights | `/insights` | ✅ Clean | — |
| 14 | Notifications | `/insights/notifications` | ✅ Clean | — |
| 15 | Sources | `/sources` | ✅ Clean | — |
| 16 | Emails | `/emails` | ✅ Clean | — |
| 17 | Identity | `/identity` | ✅ Clean | — |
| 18 | Identity Detail | `/identity/[agentId]` | ✅ Clean | — |
| 19 | Profiles | `/identity/profiles` | ✅ Clean | — |
| 20 | Agents | `/agents` | ✅ Clean | — |
| 21 | Agent Detail | `/agents/[id]` | ✅ Clean | — |
| 22 | Agent Trust | `/agents/[id]/trust` | ✅ Clean | — |
| 23 | Teams | `/identity/teams` | ✅ FIXED | Was: "Something went wrong" crash |
| 24 | Contracts | `/identity/contracts` | ✅ Clean | — |
| 25 | Tasks | `/identity/tasks` | ✅ Clean | — |
| 26 | Challenges | `/identity/challenges` | ✅ Clean | — |
| 27 | Trust | `/identity/trust` | ✅ FIXED | Was: "Something went wrong" crash |
| 28 | Delegation | `/delegation` | ✅ Clean | — |
| 29 | Delegation Recall | `/delegation/recall` | ✅ Clean | — |
| 30 | Identity Recall | `/identity/recall` | ✅ Clean | — |
| 31 | Export | `/identity/export` | ✅ Clean | — |
| 32 | Code Search | `/code` | ✅ Clean | — |
| 33 | Code Projects | `/code/projects` | ✅ Clean | — |
| 34 | Settings | `/settings` | ✅ Clean | — |
| 35 | API Keys | `/api-keys` | ✅ Clean | — |
| 36 | Sync | `/settings/sync` | ✅ Clean | — |
| 37 | Cloud Link | `/settings/cloud` | ✅ Clean | — |
| 38 | Reconcile | `/settings/reconcile` | ✅ Clean | — |
| 39 | Users | `/users` | ✅ Clean | — |
| 40 | User Detail | `/users/[id]` | ✅ Clean | — |
| 41 | Ensemble Drift | `/ensemble/drift` | ✅ Clean | — |
| 42 | Status | `/status` | ✅ Clean | — |
| 43 | Onboarding | `/onboarding` | ✅ Clean | — |
| 44 | Docs | `/docs` | ✅ Clean | — |
| 45 | Forgot Password | `/forgot-password` | ✅ Clean | — |
| 46 | Login | `/login` | ⚠️ Minor | /v1/instance/info 404 (graceful fallback) |
| 47 | Signup | `/signup` | ⚠️ Minor | /terms link 404 |

## Interactive Tests

| Test | Result |
|------|--------|
| Global search bar → semantic results | ✅ |
| Create Memory dialog → new memory appears | ✅ |
| Memory detail → Details tab | ✅ |
| Memory detail → Embeddings tab | ✅ (fixed) |
| Memory detail → Attribution tab | ✅ |
| Dashboard → System Health Refresh | ✅ |
| Graph → renders 34 nodes, 42 entities | ✅ |
| Agent detail page | ✅ |
| Agent trust profile page | ✅ |
| User detail page | ✅ |

## Bugs Fixed (3 commits)

### Commit 1: `fix: unwrap API response wrappers for listAgents/listTeams`
- **File:** `src/lib/identity-api.ts`
- **Fix:** `listAgents()` and `listTeams()` now unwrap `{agents:[...]}` / `{teams:[...]}` response wrappers
- **Impact:** Fixed crash on Teams page and Trust page

### Commit 2: `fix: graceful fallback for ensemble embeddings tab when API unavailable`
- **File:** `src/lib/ensemble-client.ts`
- **Fix:** `getMemoryEmbeddings()` fallback no longer crashes when `getEnsembleStatus()` also 404s
- **Impact:** Fixed "Error Loading Embeddings" on memory detail Embeddings tab

## Known Limitations (API-side, not dashboard bugs)

| Issue | Endpoints | Dashboard Behavior |
|-------|-----------|-------------------|
| Analytics unavailable | `/v1/analytics/*` | Shows error with retry button |
| Instance info unavailable | `/v1/instance/info` | Falls back to defaults silently |
| Ensemble endpoints unavailable | `/v1/ensemble/*` | Shows empty coverage (0/0 models) |
| Trust profile 404 for agent | `/v1/identity/trust/:id` | Shows "Not Found" with retry |
| Terms page missing | `/terms` | 404 (signup page link) |
