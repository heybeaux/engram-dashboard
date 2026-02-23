# Graph V2 Spec — Review Notes

**Reviewer:** Kit 🦊
**Date:** 2026-02-22
**Spec:** `docs/specs/graph-v2-spec.md`

---

## Decision: Use d3 Directly

**Per Beaux:** Use d3 as the core visualization library — not react-force-graph-2d or other wrappers. d3 will be the standard charting/visualization library across the entire dashboard (graph, timelines, heatmaps, embedding clusters, recall metrics).

Reference: `public/memory-graph.html` already has a working d3 force graph with time slider prototype.

**Implications for spec:**
- Replace all references to `react-force-graph-2d` / `ForceGraph2D` with `d3-force` + Canvas rendering
- WebGL fallback (Task 14) becomes: Canvas 2D for ≤500 nodes, OffscreenCanvas or WebGL shader for >500 (or accept Canvas perf ceiling and optimize d3 tick budget)
- Animation playback is more natural in d3 (direct control over simulation alpha, tick, transitions)
- Warm-start is native — just don't reset `node.x`/`node.y` when updating data

---

## Issues

### 1. Layer Names Are Wrong
Spec references "episodic, semantic, procedural" — these don't exist in our schema.

**Correct values** (from `MemoryLayer` enum):
- `IDENTITY`
- `PROJECT`
- `SESSION`
- `TASK`
- `INSIGHT`

Fix throughout spec: user stories, layer filter checkboxes, API examples.

### 2. Strength Sort Needs Normalization
`strength = mentionCount + importanceScore` mixes an unbounded integer with a 0–1 float. A node with 50 mentions + 0.3 importance shouldn't rank the same as 1 mention + 49.3 importance (impossible anyway).

**Suggestion:** Normalize both to 0–1 range, then weight:
```
strength = 0.6 * normalize(mentionCount) + 0.4 * importanceScore
```
Or use `mentionCount * importanceScore` for a simple product ranking.

### 3. TimeSlider (Task 10) Is Underestimated
Rated "L" but includes:
- Custom dual-range slider with date formatting
- Animation engine (play/pause/resume, variable speed, frame stepping)
- Pre-fetch strategy and client-side time filtering
- Debounced API integration

**Recommendation:** Split into two tasks:
- **10a (M):** Static dual-range time slider with debounced API calls
- **10b (L):** Animation playback engine (play/pause, speed control, frame stepping)

### 4. Responsive Controls Panel — Needs Detail
Task 4 mentions "responsive collapse" but no spec for behavior.

**Suggestion:**
- Desktop (≥1024px): Fixed 280px side panel
- Tablet (768–1023px): Collapsible drawer, toggle button overlaid on graph
- Mobile (<768px): Bottom sheet or full-screen filter modal

### 5. Entity vs Memory Node Toggle
Current graph renders both entity nodes and memory nodes. Spec only addresses filtering memories by layer.

**Add:** A toggle or tab for view mode:
- **Full graph** (default): entities + memories + edges
- **Entity-only**: just entities and their relationships (cleaner for high-level exploration)
- **Memory-only**: memories with edges based on shared entities

### 6. d3 Component Pattern
For React + d3 integration, recommend the "useRef + useEffect" pattern:
- React owns the DOM container and state
- d3 owns the Canvas/SVG rendering inside the container
- State changes trigger d3 transitions, not React re-renders

This avoids the React-vs-d3 DOM ownership conflict.

---

## Summary

Spec is solid structurally. Main fixes needed:
1. ✅ Switch to d3 (directive from Beaux)
2. 🔧 Fix layer enum names
3. 🔧 Normalize strength ranking
4. 🔧 Split TimeSlider task
5. ➕ Add responsive detail
6. ➕ Add entity/memory view toggle
7. ➕ Document d3-React integration pattern

Estimated impact on timeline: +1 day (from 4–6 → 5–7 days) due to d3 direct implementation being more work than wrapper library, but far more flexible long-term.
