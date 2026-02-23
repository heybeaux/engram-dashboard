# Graph Visualization v2 — Spec

**Author:** Claude (for Kit)
**Date:** 2026-02-22
**Status:** Draft

---

## 1. Overview

The Engram dashboard's graph page visualizes entity relationships extracted from memories. Today it renders a static, unfiltered force graph capped at 200 nodes. Graph v2 adds temporal controls, filtering, search, and performance scaling so users can explore how their knowledge graph evolved over time, focus on high-signal entities, and handle graphs up to 1,000 nodes smoothly.

## 2. Goals

Ranked by importance:

| # | Goal | Success Criteria |
|---|------|-----------------|
| 1 | **Temporal exploration** | User can scrub a time slider and watch the graph grow/shrink by createdAt range |
| 2 | **Filtering & ranking** | User can filter by layer, confidence, mention count; top-N ranking surfaces strongest entities |
| 3 | **Adjustable scale** | Node count slider 50–1,000 with smooth re-render; default 200 preserved |
| 4 | **Search & highlight** | Type an entity name → node highlights + camera pans to it in <200ms |
| 5 | **Performance at scale** | 500+ nodes render at ≥30fps; 1,000 nodes usable via WebGL fallback |
| 6 | **Accessible** | All controls keyboard-navigable; passes WCAG 2.1 AA color contrast |

## 3. Current State

- **Page:** `src/app/(dashboard)/graph/page.tsx` — uses `react-force-graph-2d`
- **Data fetch:** `engramClient.getGraphData({ limit: 200 })` — hardcoded limit, no filters
- **API:** `GET /v1/graph/data?limit=N` — only accepts `limit`
- **No temporal controls**, no filtering, no confidence threshold, no search
- **Reference:** `public/memory-graph.html` has a d3 time slider (standalone, not integrated)

### Entity/Relationship Schema (relevant fields)

- **Entity:** `normalizedName`, `mentionCount`, `createdAt`, `updatedAt`
- **Relationship:** `confidence` (0–1), `linkType`, `createdAt`
- **Memory node:** `layer`, `importanceScore`, `createdAt`

## 4. User Stories

1. **As a user**, I want to drag a time range slider so I can see which entities and connections existed at a specific point in time.
2. **As a user**, I want to animate the graph from earliest to latest so I can watch my knowledge graph grow over time.
3. **As a user**, I want to adjust the node count so I can zoom out to the full picture or zoom in to the most important entities.
4. **As a user**, I want to filter by memory layer (episodic, semantic, procedural) so I can focus on one type of knowledge.
5. **As a user**, I want to set a minimum edge confidence so I can hide speculative connections and see only strong relationships.
6. **As a user**, I want to search for an entity by name and have it highlighted and centered on screen.
7. **As a user**, I want to see a legend explaining node colors and edge styles so I can interpret the graph without guessing.

## 5. UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  Graph Visualization                          [⚙] [?]  │
├────────────┬────────────────────────────────────────────┤
│            │                                            │
│  CONTROLS  │              GRAPH CANVAS                  │
│  PANEL     │         (react-force-graph-2d              │
│  (280px)   │          or WebGL fallback)                │
│            │                                            │
│ ┌────────┐ │                                            │
│ │Search  │ │                                            │
│ └────────┘ │                                            │
│            │                                            │
│ Nodes: 200 │                                            │
│ ──●─────── │                                            │
│ 50    1000 │                                            │
│            │                                            │
│ Confidence │                                            │
│ ──●─────── │                                            │
│ 0.0    1.0 │                                            │
│            │                                            │
│ Layers     │                                            │
│ ☑ episodic │                                            │
│ ☑ semantic │                                            │
│ ☑ procedu… │                                            │
│            │                                            │
│ Sort by    │                                            │
│ [strength▾]│                                            │
│            │                                            │
│ ┌────────┐ │                                            │
│ │ LEGEND │ │                                            │
│ └────────┘ │                                            │
├────────────┴────────────────────────────────────────────┤
│  TIME SLIDER                                            │
│  ├──────●════════●──────┤   [▶ Play]  Speed: [1x▾]     │
│  2024-01            2026-02                             │
│  Showing: 2024-06-01 → 2025-12-31                      │
└─────────────────────────────────────────────────────────┘
```

## 6. Controls

### 6.1 Time Range Slider
- Dual-handle range slider spanning the full `createdAt` range of all data
- Left handle = `since`, right handle = `until`
- **Play/animate:** press ▶ to advance the right handle from the left handle's position to the end at configurable speed (1x, 2x, 5x, 10x — where 1x = 1 month/second)
- Debounce API calls: 300ms after handle release

### 6.2 Node Count Slider
- Range: 50–1,000, step 50, default 200
- Maps to `limit` query param
- Label shows current value

### 6.3 Edge Confidence Threshold
- Range: 0.0–1.0, step 0.05, default 0.0 (show all)
- Client-side filter (edges below threshold hidden, orphaned nodes hidden)
- Maps to `minConfidence` query param for server-side pre-filter

### 6.4 Entity Ranking / Sort
- Dropdown: `strength` (default), `mentionCount`, `importanceScore`, `recent`
- `strength` = `mentionCount + importanceScore` (computed server-side)
- Controls which top-N entities are returned when limit < total
- Maps to `sortBy` query param

### 6.5 Layer Filter
- Checkboxes for each layer: episodic, semantic, procedural (and any others returned by API)
- Unchecking a layer removes its memory nodes and associated entities/edges
- Maps to `layers` query param (comma-separated)

### 6.6 Search / Highlight
- Text input with typeahead (client-side filter on loaded `normalizedName` values)
- On match: highlight node (bright ring + scale 2x), dim others to 20% opacity, pan camera to node
- Esc or clear input to reset

## 7. API Changes

Extend `GET /v1/graph/data` with new query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | 200 | Max nodes returned (existing) |
| `minMentions` | int | 0 | Minimum `mentionCount` for included entities |
| `since` | ISO 8601 | — | Only include entities/relationships created on or after |
| `until` | ISO 8601 | — | Only include entities/relationships created on or before |
| `minConfidence` | float | 0.0 | Minimum relationship confidence |
| `layers` | string | all | Comma-separated layer names (e.g. `episodic,semantic`) |
| `sortBy` | string | `strength` | Ranking for top-N: `strength`, `mentionCount`, `importanceScore`, `recent` |

**Response shape** (unchanged structure, new metadata):

```json
{
  "nodes": [...],
  "links": [...],
  "meta": {
    "totalEntities": 1842,
    "totalRelationships": 5210,
    "dateRange": { "earliest": "2024-01-15T...", "latest": "2026-02-22T..." },
    "availableLayers": ["episodic", "semantic", "procedural"]
  }
}
```

The `meta` field is new — it lets the client populate the time slider range and layer checkboxes without a separate request.

## 8. Component Architecture

```
graph/page.tsx
├── GraphControls (left panel)
│   ├── EntitySearch (text input + typeahead)
│   ├── NodeCountSlider
│   ├── ConfidenceSlider
│   ├── LayerFilter (checkboxes)
│   ├── SortBySelect (dropdown)
│   └── GraphLegend
├── GraphCanvas (main area)
│   └── ForceGraph2D or ForceGraph3D/WebGL (conditional)
└── TimeSlider (bottom bar)
    ├── DualRangeSlider
    ├── PlayButton
    └── SpeedSelect
```

### State management

Use a `useGraphParams` hook (or Zustand store) holding all filter state:

```ts
interface GraphParams {
  limit: number;
  since: string | null;
  until: string | null;
  minConfidence: number;
  minMentions: number;
  layers: string[];
  sortBy: 'strength' | 'mentionCount' | 'importanceScore' | 'recent';
  searchQuery: string;
}
```

Controls write to this store → debounced effect triggers API fetch → data flows to GraphCanvas.

## 9. Data Flow

```
User adjusts control
  → GraphParams state updates
  → 300ms debounce
  → fetch GET /v1/graph/data?limit=N&since=...&until=...&...
  → Response: { nodes, links, meta }
  → Client-side transforms:
      1. Apply confidence threshold (belt-and-suspenders with server filter)
      2. Compute node sizes from mentionCount + importanceScore
      3. Color nodes by layer
      4. Apply search highlight if active
  → Pass to react-force-graph-2d (or WebGL renderer)
  → Graph re-renders with d3-force simulation warm-start (preserve positions)
```

**Warm-start:** When filters change, carry over existing node positions so the graph doesn't re-explode. New nodes enter at the centroid of their connected neighbors.

## 10. Performance

| Concern | Strategy |
|---------|----------|
| Slider spam | Debounce all control changes by 300ms before API call |
| Large graphs (>500 nodes) | Switch from Canvas 2D to WebGL renderer (`react-force-graph-2d` supports `forceEngine="d3"` with canvas; for WebGL use `react-force-graph-2d` with `enableNodeDrag` or swap to `react-force-graph-3d` in 2D mode) |
| Initial load | Fetch with default params (limit=200) — fast first paint |
| Animation playback | Pre-fetch full date range at current limit on play start; step through client-side time filter per frame (no per-frame API calls) |
| Node rendering | Disable labels when >300 nodes; show on hover only |
| Edge rendering | Use straight lines (no curves) when >200 edges; hide edge labels always |
| Re-simulation | Use `d3Force('charge').strength()` scaled inversely with node count |

## 11. Accessibility

- **Keyboard navigation:** Tab through all controls; Enter/Space to toggle checkboxes; Arrow keys for sliders
- **Screen reader:** ARIA labels on all controls; graph summary text ("Showing 200 nodes, 450 edges, filtered by episodic layer")
- **Color contrast:** Node colors meet WCAG 2.1 AA (4.5:1 against background); provide shape differentiation (circle vs diamond vs square) in addition to color for layer distinction
- **Reduced motion:** Respect `prefers-reduced-motion`; disable animation playback auto-start; reduce simulation alpha
- **Focus indicators:** Visible focus rings on all interactive elements

## 12. Tasks

| # | Task | Size | Notes |
|---|------|------|-------|
| 1 | Add API query params (`since`, `until`, `minConfidence`, `minMentions`, `layers`, `sortBy`) | M | Backend route + DB query changes |
| 2 | Add `meta` field to graph data response | S | totalEntities, dateRange, availableLayers |
| 3 | Create `useGraphParams` state hook | S | Zustand or React context |
| 4 | Build `GraphControls` panel layout | M | Container + responsive collapse |
| 5 | Build `NodeCountSlider` component | S | |
| 6 | Build `ConfidenceSlider` component | S | |
| 7 | Build `LayerFilter` checkboxes | S | Dynamic from `meta.availableLayers` |
| 8 | Build `SortBySelect` dropdown | S | |
| 9 | Build `EntitySearch` with typeahead + highlight | M | Client-side filter, camera pan |
| 10 | Build `TimeSlider` with dual-range handles | L | Custom or use rc-slider; date formatting |
| 11 | Build animation playback (Play/Speed) | M | Client-side time stepping over pre-fetched data |
| 12 | Build `GraphLegend` | S | Layer colors + edge type meanings |
| 13 | Integrate controls → API fetch → graph render pipeline | M | Debounce, warm-start positions |
| 14 | WebGL fallback for >500 nodes | M | Conditional renderer swap |
| 15 | Accessibility pass (ARIA, keyboard, reduced motion) | M | |
| 16 | Tests: unit for hooks/transforms, integration for control→render | M | |

**Estimated total:** ~4–6 days of focused work

## 13. Definition of Done

- [ ] All 6 controls functional and wired to API
- [ ] Time slider animates graph evolution smoothly
- [ ] Search highlights and pans to matched entity
- [ ] Graph handles 1,000 nodes at ≥30fps (WebGL fallback active)
- [ ] API accepts all new query params; invalid values return 400 with message
- [ ] `meta` field present in all graph data responses
- [ ] All controls keyboard-accessible
- [ ] Screen reader summary text updates on filter change
- [ ] Node colors pass WCAG AA contrast
- [ ] Unit tests for `useGraphParams`, data transforms, ranking logic
- [ ] Integration test: adjust slider → verify API call params → verify render
- [ ] No regressions to existing graph functionality at default settings

## 14. Out of Scope

- 3D graph mode (future consideration)
- Graph editing (add/remove/merge entities from the UI)
- Real-time / WebSocket live updates
- Export graph as image or data file
- Clustering / community detection algorithms
- Mobile-optimized layout (desktop-first; responsive collapse of controls panel is in scope)
- Node right-click context menu
- Multi-select / bulk operations on nodes
