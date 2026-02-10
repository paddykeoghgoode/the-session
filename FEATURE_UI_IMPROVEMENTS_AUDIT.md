# Feature + UI Improvement Audit (Session)

This audit reviews the current implementation and proposes improvements that would materially improve activation, retention, and day-to-day usability.

## What I looked at
- Homepage structure, quick actions, and discovery flows.
- Pub listing search/filter mechanics.
- Pub detail contribution and decision UX.
- Navigation and mobile ergonomics.

---

## Priority 1 (High impact, relatively fast)

### 1) Fix filter behavior so users can stack filters without losing state
**Problem**
- Filter chips currently generate one-param URLs (`/pubs?food=true`, etc.), which drops existing filters and sort options.

**Why it matters**
- Users expect additive filtering (e.g., Open Now + Live Music + Dog Friendly).
- Resetting state creates friction and lowers conversion to pub detail clicks.

**Recommendation**
- Replace simple anchor `href` generation with URLSearchParams merge logic.
- Add a visible “Clear all” chip when any filter is active.

**Implementation notes**
- Update `FilterButton` behavior in `src/app/pubs/page.tsx`.
- Preserve `search`, `sort`, and active boolean filters when toggling.

---

### 2) Wire “intent” entry points to actual listing logic
**Problem**
- Homepage quick actions link to `/pubs?intent=...`, but listing logic does not read `intent` today.

**Why it matters**
- Top-of-funnel CTA cards can feel broken when users don’t see tailored results.

**Recommendation**
- Add `intent` to listing search params and map each intent to a filter preset/sort strategy.
  - `cheap-pints` → sort by price
  - `watch-sports` → `sports=true`
  - `late-night` → `latebar=true`
  - `live-trad-music` → `music=true` or `trad=true`

**Implementation notes**
- Align `QuickActionGrid` links and `getPubs` query builder.

---

### 3) Add true typeahead search from homepage and listing
**Problem**
- Homepage “search bar” is currently just a link to `/pubs`.
- Listing search is request/submit only and not optimized for fast narrowing.

**Why it matters**
- For local discovery apps, search speed is core UX value.

**Recommendation**
- Reuse `SmartSearch` in homepage hero and pub listing header.
- Support matched highlights (name, area, landmark).

**Implementation notes**
- Replace the static homepage search CTA with `SmartSearch` and quick recent searches.

---

### 4) Improve “open now” reliability and transparency
**Problem**
- “Open now” is client-side filtered after query fetch and depends on available opening-hours quality.

**Why it matters**
- Incorrect open/closed status can damage trust quickly.

**Recommendation**
- Add confidence labels: “Live hours”, “Estimated hours”, “No hours data”.
- Surface “last verified opening hours” on pub detail.

**Implementation notes**
- Extend `OpenStatus` + pub metadata model with source and verification fields.

---

## Priority 2 (Experience quality + retention)

### 5) Add ranking explanations (“Why this pub is shown”)
**Problem**
- Results and homepage carousels show ranking outcomes but not ranking reasons.

**Recommendation**
- Show concise badges per card:
  - “Top rated this week”
  - “Verified price 2d ago”
  - “Best value nearby”

**Outcome**
- Increases trust and click-through by making ranking legible.

---

### 6) Add list performance controls (pagination or infinite scroll)
**Problem**
- Pub list fetches all matching results in one query; no pagination.

**Recommendation**
- Add limit/offset or cursor pagination with 24-card pages.
- Keep sticky controls visible on mobile while scrolling.

**Outcome**
- Better perceived performance and lower server load.

---

### 7) Improve contribution UX on pub detail
**Problem**
- Contribution tools are powerful but visually dispersed in long pages.

**Recommendation**
- Introduce a sticky mobile action bar on pub detail:
  - Add price
  - Write review
  - Upload photo
- Add lightweight “contribution complete” micro celebration + next step suggestion.

---

### 8) Strengthen review quality and trust
**Recommendation**
- Add review sorting: “Most recent”, “Most helpful”, “Highest rated”, “Local verified first”.
- Add “helpful” vote and report quick actions on each review card.
- Display short moderation/trust cue for accepted reviews.

---

## Priority 3 (Differentiation bets)

### 9) Personalized “Tonight Plan” generator
**Concept**
- Let user choose mood + budget + location + group size.
- Return 3-pub mini crawl with timing, prices, and event overlays.

**Why this is strong**
- Uses existing strengths (prices + events + amenities) to create a unique utility loop.

---

### 10) Neighborhood intelligence views
**Concept**
- Add compact area pages (Temple Bar, Smithfield, Ranelagh...) with:
  - median pint price trend
  - busiest nights
  - top value picks

**Why this is strong**
- Supports SEO and gives users planning context beyond individual pub pages.

---

### 11) “Price confidence score” for each shown price
**Concept**
- Composite of recency, number of confirmations, and trusted-contributor weight.

**Why this is strong**
- Makes crowdsourced data feel more dependable and actionable.

---

## UI changes to implement alongside features

1. **Consolidate the visual hierarchy on homepage**
   - Keep one primary CTA above fold: “Search pubs”.
   - Reduce competing blocks before first interaction.

2. **Make filter chips horizontally scrollable on mobile with sticky row**
   - Keep search + sort + active filter count visible.

3. **Unify component spacing and density at card level**
   - Pub cards, deals cards, and event cards should share consistent typography scale and stat placement.

4. **Use explicit empty-state pathways**
   - “No pubs found” should offer one-tap fallbacks: clear filters, widen radius, show top rated nearby.

5. **Add skeleton loaders to key list transitions**
   - Improve perceived speed during filtering/sorting/search.

---

## Suggested execution order (4-week sprint)

- **Week 1:** Filter-state fix + intent mapping + empty-state upgrades.
- **Week 2:** SmartSearch integration on homepage/listing + ranking reason badges.
- **Week 3:** Pagination + sticky mobile filter bar + review sorting.
- **Week 4:** Sticky pub-detail contribution bar + price confidence indicators.

If you want, I can convert this into an implementation backlog (tickets with acceptance criteria and effort estimates).
