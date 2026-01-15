# Improvement Path – The Session

This document outlines a pragmatic improvement path for **The Session**, a crowdsourced web app for discovering drink prices, deals, and value in Dublin pubs.

The goal is to improve **data trust, usability, and long-term product value** while remaining realistic for a small indie team.

---

## 0. Immediate UX & Bug Fixes (Requested)

These are concrete issues observed/raised that should be tackled early because they directly affect trust and usability.

### 0.1 Ratings display consistency
- Pub pages should display rating **when it exists**, matching homepage behavior.
- Show the numeric rating clearly (e.g., **4.8/5**) on:
  - Pub header (next to review count)
  - Pub cards in lists
  - Leaderboards where relevant
- If no rating exists, show a consistent empty state (e.g., “No ratings yet”).

### 0.2 Share button on pub pages
- Fix the **Share** button so it reliably shares/copies the pub URL.
- Provide a fallback:
  - Copy-to-clipboard with “Copied!” toast
  - Native share sheet on mobile via Web Share API where available

### 0.3 Deals: allow food deals + combos
- Deal submission should support:
  - **Food-only deals** (e.g., burger + chips discount)
  - **Drink + food combos** (e.g., pint + toastie)
  - Multi-item bundles
- Add deal type options (suggested):
  - Drink
  - Food
  - Combo
- Add fields that fit all types:
  - Title
  - Description
  - Price / discount
  - Start/end date or recurring schedule (optional but recommended)

### 0.4 Price submission UX inside pubs (inline entry)
Current desired behavior:
- When viewing a pub’s drink list, clicking a drink name should **expand inline** to allow entering a price and submitting immediately (without navigating to a separate submission screen).

Suggested UI pattern:
- Tap drink row → inline editor opens with:
  - **Add a Price**
  - **Select Drink** (if triggered from a generic “Add price” action)
  - Price input + currency
  - Optional “promo/deal?” toggle
  - Submit button + success toast

---

## 1. Current Strengths

- Clear value proposition: finding the best-value drinks in Dublin
- Simple crowdsourced contribution model
- Strong core features already implemented:
  - Pub listings
  - Drink prices
  - Deals
  - Map view
  - Leaderboards
- Modern, scalable tech stack (Next.js, Supabase, Postgres)
- Live product with real user data

These form a solid foundation. The next phase should focus on **data quality and decision-making**, not feature sprawl.

---

## 2. Core Problem to Solve

### Data staleness & trust
A single “price” without context is misleading:
- Prices change frequently
- Promotions distort reality
- Old submissions appear authoritative

Without trust signals, users cannot confidently answer:
> “Where should I go **right now**?”

---

## 3. Data Model Improvements (High Priority)

### 3.1 Price as an Observation, Not a Fact
Each price submission should be stored as an **observation** with:
- Drink ID
- Pub ID
- Price
- Timestamp
- User ID
- Optional flags (promo, happy hour, student deal)
- Optional notes

Displayed prices should be **derived aggregates**, not raw values.

### 3.2 Recency & Confidence
Every displayed price should show:
- “Last seen X days ago”
- Number of confirmations
- Confidence level (e.g. high / medium / low)

Outliers should be flagged as “Needs confirmation”.

### 3.3 Promotions vs Standard Pricing
Separate:
- Regular prices
- Time-bound deals

Never let a promo overwrite a base price.

---

## 4. Trust, Moderation & Abuse Prevention

### 4.1 User Reputation
Introduce lightweight reputation weighting:
- Account age
- Accepted submissions
- Corroborated prices

Higher reputation = higher weight in aggregates.

### 4.2 Soft Moderation
- Community flagging
- Admin review queue
- Soft deletes + audit logs

Optional (future): receipt photo verification.

---

## 5. UX Improvements

### 5.1 Submission Flow
Submitting data must be fast:
- Single-screen quick add
- Smart defaults (last pub, last drink)
- Minimal required fields

If contributing feels slow, crowdsourcing fails.

### 5.2 Pub Pages as Decision Pages
Each pub page should answer:
- What’s cheapest here?
- What’s best value?
- When is the best time to go?
- How recently was this data confirmed?
- (If rated) What’s the rating (e.g., 4.8/5) and how many reviews is it based on?

### 5.3 Near Me & Map
Improve discovery by:
- Distance + value sorting
- Filters (drink, max price, open now)
- Clear visual density on maps
- Fast geo queries

---

## 6. Leaderboards That Explain Themselves

Leaderboards should:
- Be weighted by recency & confidence
- Clearly explain methodology
- Include categories like:
  - Cheapest nearby
  - Best value
  - Biggest price drops

Avoid “magic rankings”.

---

## 7. Technical & Architecture Improvements

### 7.1 Database & Performance
- Use PostGIS for geo queries
- Index common filters (drink, pub, created_at)
- Materialized views for expensive aggregates

### 7.2 Caching Strategy
- Cache homepage leaderboards
- Revalidate on new submissions
- Avoid recalculating aggregates per request

### 7.3 Supabase Security
- Strict Row Level Security
- Rate limiting on submissions
- Separate read vs write roles
- Abuse prevention at API level

---

## 8. Suggested Roadmap

### Phase 0 – Immediate Fixes (This Week)
- Fix pub page rating display (show rating + 4.8/5 where applicable)
- Fix Share button behavior (Web Share + clipboard fallback)
- Allow food deals + combo deals in deal submission
- Implement inline price entry on pub drink lists (tap drink → add price → submit)

### Phase 1 – Data Quality (Must Have)
- Price observations with timestamps
- Recency & confidence indicators
- Quick submission UX (including inline flow polish)
- Basic moderation

### Phase 2 – Product Differentiation
- Price history charts
- Smarter Near Me results
- Deal expiry + notifications
- Reputation weighting

### Phase 3 – Growth & Expansion
- Pub crawl generator
- Neighborhood following
- City-by-city rollout (not global at once)
- Community badges & roles

---

## 9. Guiding Principle

> Do not add features until existing data feels trustworthy.

The Session wins not by having more features, but by being the **most reliable way to decide where to go for a drink**.

---

End of document.
