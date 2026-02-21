# Engram Dashboard — API Wiring Readiness Audit

**Date:** 2026-02-21  
**Author:** Kit 🦊  
**Purpose:** Assess dashboard readiness for wiring up new identity API endpoints (HEY-281 through HEY-286)

---

## Executive Summary

The dashboard is **well-prepared** for wiring up the new endpoints. Most pages already exist as full implementations (not just stubs), comprehensive TypeScript types are defined, and two API client patterns are established. The main work is **aligning the existing client functions with Rook's final endpoint shapes** and cleaning up some duplicated patterns.

---

## 1. Current Architecture

### Tech Stack
- **Framework:** Next.js 14.2 (App Router, `"use client"` pages)
- **UI:** Radix primitives + shadcn/ui components, Tailwind CSS, Recharts for charts
- **Language:** TypeScript throughout
- **Testing:** Vitest + Testing Library + Playwright (e2e) + Storybook
- **No SWR/React Query** — all data fetching is manual `useEffect` + `useState`

### API Client Patterns (⚠️ Two Competing Patterns)

| Pattern | File | Used By | Base URL |
|---------|------|---------|----------|
| **`identityFetch()`** | `src/lib/identity-api.ts` | Identity sub-pages (`/identity/*`) | `/api/engram` (Next.js proxy) |
| **`apiFetch()`** | `src/lib/api-config.ts` | `delegation-client.ts`, `engram-client.ts`, `account-api.ts` | Direct API (`getApiBaseUrl()`) |
| **Raw fetch** | Inline in pages | `/challenges`, `/teams`, `/sources`, `/settings/reconcile` | Mixed (`/api/engram` or `getApiBaseUrl()`) |

The **Next.js proxy** at `src/app/api/engram/[...path]/route.ts` forwards `/api/engram/*` to the real API, avoiding CORS.

### Auth Pattern
- `buildAuthHeaders()` in `api-config.ts` — API key or browser JWT token
- Some older pages (`/challenges`, `/teams`, `/sources`) duplicate auth header logic inline

---

## 2. Endpoint-by-Endpoint Readiness

### HEY-281: Contracts CRUD ✅ Ready

| Item | Status |
|------|--------|
| **Page exists?** | ✅ Full implementation at `/identity/contracts/page.tsx` |
| **API client?** | ✅ `getContracts()`, `getContract()`, `createContract()` in `identity-api.ts` |
| **Types?** | ✅ `DelegationContract`, `ContractStatus`, `CreateContractRequest` defined |
| **UI?** | ✅ Full table view with status badges, create dialog, filtering by status |
| **Gap:** | Missing `completeContract()` function — needs new client method for the complete endpoint |

Also: `delegation-client.ts` has a **separate** `getContracts()` hitting `/v1/delegation-contracts` (different endpoint path). Needs reconciliation with Rook's final endpoint.

### HEY-282: Challenges CRUD ✅ Ready

| Item | Status |
|------|--------|
| **Page exists?** | ✅ Two implementations: `/identity/challenges/page.tsx` (full) and `/challenges/page.tsx` (simpler) |
| **API client?** | ✅ `getChallenges()`, `createChallenge()`, `resolveChallenge()` in `identity-api.ts` |
| **Types?** | ✅ `Challenge`, `ChallengeType`, `ChallengeResolution`, `CreateChallengeRequest`, `ResolveChallengeRequest` |
| **UI?** | ✅ Table view with type icons, create dialog, resolve dialog with resolution types |
| **Gap:** | Duplicate page at `/challenges` uses raw fetch + different types from `delegation-types.ts`. Should consolidate. |

### HEY-283: Teams List + Collaboration Scoring ✅ Ready

| Item | Status |
|------|--------|
| **Page exists?** | ✅ Two implementations: `/identity/teams/page.tsx` (full with collaboration grid) and `/teams/page.tsx` (simpler card grid) |
| **API client?** | ✅ `identityApi.listTeams()`, `identityApi.getTeam()`, `identityApi.createTeam()` in `identity-api.ts` |
| **Types?** | ✅ `Team`, `CollaborationPair`, `CreateTeamRequest` in `identity-api.ts`; also `Team`, `TeamDetail`, `TeamMember` in `delegation-types.ts` |
| **UI?** | ✅ `CollaborationGrid` component for pair visualization, team detail view with member list |
| **Gap:** | Duplicate page at `/teams` uses raw fetch + inline types. Two competing type definitions for `Team`. |

### HEY-284: Trust History + Bulk Trust Profiles ✅ Ready

| Item | Status |
|------|--------|
| **Page exists?** | ✅ `/identity/trust/page.tsx` — full implementation with radar chart + line chart |
| **API client?** | ✅ `identityApi.getTrustProfile()` in `identity-api.ts`; also `getAgentTrustProfile()` for per-agent view |
| **Types?** | ✅ `TrustProfile`, `TrustDomain`, `TrustHistoryPoint`, `AgentTrustProfile`, `DomainScore` |
| **UI?** | ✅ `TrustGauge` component, recharts `RadarChart` + `LineChart` for history, trend icons |
| **Gap:** | No **bulk** trust profiles endpoint wired — current UI loads one agent at a time via dropdown. Need a `getBulkTrustProfiles(agentIds[])` method. |

### HEY-285: Reconciliation Preview/Execute ✅ Ready

| Item | Status |
|------|--------|
| **Page exists?** | ✅ `/settings/reconcile/page.tsx` — full wizard (Preview → Options → Execute → Results) |
| **API client?** | ⚠️ Raw fetch inline, not using shared client |
| **Types?** | ✅ Inline types: `PreviewData`, `ReconcileResult`, `Strategy` |
| **UI?** | ✅ Multi-step wizard with progress bar, strategy selection (push-all/pull-all/selective) |
| **Gap:** | Uses `getApiBaseUrl()` directly (not proxy), duplicates auth headers. Should migrate to `apiFetch()` or `identityFetch()`. Types should move to shared file. |

### HEY-286: Signal Sources CRUD ✅ Ready

| Item | Status |
|------|--------|
| **Page exists?** | ✅ `/sources/page.tsx` — full implementation |
| **API client?** | ⚠️ Raw fetch inline |
| **Types?** | ✅ Inline `Source` interface with id, name, type, enabled, status, signalCount |
| **UI?** | ✅ Card grid with status indicators, enable/disable toggle, create/edit dialog |
| **Gap:** | Uses raw fetch with inline auth. Should migrate to shared client. Types should move to shared file. |

---

## 3. Shared UI Components Available

### Identity-Specific (`src/components/identity/`)
- **TrustGauge** — circular trust score visualization (with Storybook)
- **CapabilityChart** — radar chart for agent capabilities (with Storybook)
- **StatusBadge** — status indicator with variants
- **StatusDot** — simple colored dot
- **EmptyState** — empty state placeholder with icon/message
- **AgentCard** — agent summary card (with Storybook)
- **ConfidenceBadge** — confidence level indicator
- **FeedbackActions** — thumbs up/down feedback buttons
- **InsightTypeBadge** — badge for insight types

### General UI (`src/components/ui/`)
Full shadcn/ui kit: Card, Badge, Button, Input, Dialog, DropdownMenu, Table, Tabs, Skeleton, Progress, Switch, Tooltip, Avatar, Separator, Sheet, DataList

### Charts
Recharts is installed and used extensively: BarChart, RadarChart, LineChart, ResponsiveContainer

---

## 4. Tech Debt & Blockers

### 🔴 Critical: Dual API Client Patterns
Three different fetch patterns coexist:
1. `identityFetch()` → proxy-based, used by identity pages
2. `apiFetch()` → direct API, used by delegation-client
3. Raw `fetch()` → inline in `/challenges`, `/teams`, `/sources`, `/settings/reconcile`

**Impact:** When Rook ships endpoint changes, updates need to happen in multiple places.  
**Fix:** Consolidate everything onto `identityFetch()` (proxy pattern) or `apiFetch()`.

### 🟡 Moderate: Duplicate Pages
- `/challenges` and `/identity/challenges` — two separate implementations
- `/teams` and `/identity/teams` — two separate implementations

**Fix:** Pick one location (recommend `/identity/*`), redirect the other.

### 🟡 Moderate: Duplicate Type Definitions
- `DelegationContract` defined in both `identity-api.ts` and `delegation-types.ts` with different shapes
- `Team` defined in both files with different fields
- `Challenge` defined in both files with different fields

**Fix:** Consolidate into `identity-api.ts` types (which are more complete), deprecate `delegation-types.ts`.

### 🟢 Minor: No Data Fetching Library
All fetching is manual `useEffect`/`useState`. No caching, deduplication, or optimistic updates. Not a blocker but would improve UX.

---

## 5. Recommended Approach for Adding New Pages

### The work is mostly "wiring", not "building"

Since pages and types already exist, the approach should be:

1. **Get Rook's final OpenAPI/endpoint spec** for each HEY ticket
2. **Update `identity-api.ts`** — adjust function signatures and endpoint paths to match the real API
3. **Add missing client methods:**
   - `completeContract(id)` for HEY-281
   - `getBulkTrustProfiles(agentIds[])` for HEY-284
4. **Migrate raw-fetch pages** (`/sources`, `/settings/reconcile`, `/challenges`, `/teams`) to use `identityFetch()` from `identity-api.ts`
5. **Consolidate duplicate pages** — keep `/identity/*` versions, add redirects from old paths
6. **Consolidate types** — merge `delegation-types.ts` into `identity-api.ts`, update imports
7. **Test against real endpoints** — the UI is built, just needs real data

### Estimated Effort Per Ticket

| Ticket | Work Required | Estimate |
|--------|--------------|----------|
| HEY-281 | Add `completeContract()`, verify endpoint paths | ~1h |
| HEY-282 | Consolidate duplicate page, verify endpoint paths | ~1-2h |
| HEY-283 | Consolidate duplicate page, wire collaboration scoring | ~1-2h |
| HEY-284 | Add bulk trust profiles method + UI for multi-agent view | ~2-3h |
| HEY-285 | Migrate reconcile page to shared client, verify endpoints | ~1-2h |
| HEY-286 | Migrate sources page to shared client, verify endpoints | ~1-2h |

**Total: ~8-12 hours** of wiring work, assuming Rook's endpoints match the current type shapes closely.

---

## 6. File Reference

| File | Purpose |
|------|---------|
| `src/lib/identity-api.ts` | Primary identity API client + types (recommended canonical location) |
| `src/lib/delegation-client.ts` | Older delegation API client (should be consolidated) |
| `src/lib/delegation-types.ts` | Older delegation types (should be consolidated) |
| `src/lib/api-config.ts` | Base URL resolution, `apiFetch()`, `buildAuthHeaders()` |
| `src/lib/types.ts` | Core Engram types (Memory, User, etc.) + identity types at bottom |
| `src/components/identity/` | 9 reusable identity UI components with tests + stories |
| `src/app/(dashboard)/identity/` | 7 identity sub-pages (all implemented) |
| `src/app/api/engram/[...path]/route.ts` | Next.js API proxy to Engram backend |
