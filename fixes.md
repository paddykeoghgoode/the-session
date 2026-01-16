# The Session – Product & Implementation Notes

Live site: https://the-session-two.vercel.app/

This README documents **known issues, required fixes, and upcoming features** for *The Session*.  
It is intended to be used by an AI coding assistant (e.g. Claude) or a developer to safely update the site **without breaking trust logic or rankings**.

---

## 1. Critical Fixes (Must Do)

### 1.1 The Stout Index Logic (BUG)
**Problem**
- The *Stout Index* is currently calculated using **all pints**.
- This is incorrect.

**Correct Behaviour**
- The Stout Index **must be based ONLY on Guinness prices**.
- If a pub has no Guinness price, it should be excluded from the Stout Index calculation.

**Acceptance Criteria**
- Guinness-only aggregation
- Average recalculates correctly when non-Guinness prices are added
- UI label remains unchanged

---

### 1.2 Deals Are Polluting Leaderboards (BUG)
**Problem**
- Deals are currently influencing:
  - Cheapest pint logic
  - Leaderboards

**Correct Behaviour**
- **Deals must NEVER be included** in:
  - Cheapest pint calculations
  - Leaderboards
  - Stout Index

**Rule**
> Deals are informational only and must not affect pricing truth.

---

### 1.3 Ratings Display Inconsistency (BUG)

**Problems**
- Ratings appear in some views but **not on pub pages**
- Ratings are **rounded down to whole numbers**

**Correct Behaviour**
- Ratings should appear consistently everywhere ratings are referenced
- Ratings should be rounded to **one decimal place** (e.g. `4.3`, not `4`)

---

### 1.4 Google Maps API (BLOCKER)

**Error**
Google Maps API key is not configured
Please check your Google Maps API configuration.


**Required**
- Configure a valid Google Maps API key
- Ensure map renders on:
  - Pub page
  - Map view
  - “View on Map” button

---

## 2. Admin & Moderation Gaps

### 2.1 Deal Management (Admin)

**Problem**
- Admins cannot edit or manage Active Deals from:
  - Pub pages
  - Deals tab

**Required**
Admins must be able to:
- Create
- Edit
- Expire
- Delete deals

**Locations**
- From within a pub (Admin Edit mode)
- From the Deals tab
- From Admin Dashboard (currently incomplete)

---

### 2.2 Admin Dashboard – Missing Features

Current dashboard is incomplete.

**Required Modules**
- Deal moderation
- Photo moderation
- Review moderation
- User trust management
- Flagged content review

---

## 3. Trust & Validation System (Roadmap)

### 3.1 Verify Button (Low-Friction Validation)
Allow users to confirm:
- “Yes, this price is still correct”

Used to:
- Increase confidence
- Weight prices by freshness

---

### 3.2 Photo Proof
- Users can upload photos of:
  - Pint
  - Menu
  - Price board
- Photos tied to specific prices

---

### 3.3 Menu Scans
- Upload or photograph menus
- OCR later (future)
- Used to confirm pricing accuracy

---

## 4. Deals & Monetisation

### 4.1 Enhanced Deal Structure

#### Deal Types
- Fixed price (e.g. €5 pint)
- Percentage discount
- Bundle (e.g. pint + food)
- Happy hour (time-bound)

#### Applicability
- All pints
- All drinks
- Specific drink only

---

### 4.2 Promoted / Sponsored Deals (IMPORTANT)

**Description**
A paid promotion option for pubs.

**Rules**
- Appears at top of:
  - Nearby
  - Pub pages
- Clearly labelled **“Promoted”**
- **NEVER affects**:
  - Cheapest pint
  - Leaderboards
  - Stout Index

**Purpose**
- Sustainable monetisation
- Zero compromise on trust

---

## 5. Non-Negotiable Principles

- Trust > Monetisation
- No dark patterns
- No deal-based ranking manipulation
- User-submitted data must remain auditable

---

## 6. Summary for AI Assistants

When modifying this project:
1. Do not mix deals with price truth
2. Guinness-only logic for stout metrics
3. Ratings = 1 decimal place
4. Admin tools must exist where admins expect them
5. Promoted ≠ cheaper

If unsure — **do nothing and ask**.

