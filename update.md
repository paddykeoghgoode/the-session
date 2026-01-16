# Admin Live Editing & Pub Page Behaviour – Update Specification

## Overview

This update introduces **admin-only live editing** on pub pages, fixes **routing inconsistencies**, separates **Deals from Pint Prices**, and improves **contact / social link presentation**.

The goal is:

* Allow trusted admins to quickly enrich pub data in-place
* Keep public users read-only
* Make pub pages clearer and more semantically correct
* Improve UX consistency across the app

---

## 1. Admin Live Editing (Pub Page)

### Requirements

* Only users with `role = admin` may edit
* Non-admin users see the existing read-only UI
* Editing happens **inline** on the pub page (no separate admin screen)

### Auth Rules

* Admin status determined server-side (Supabase auth + role column or JWT claim)
* UI should never trust client-only role flags

### Editable Fields

Admins should be able to edit the following directly from the pub page:

**Core info**

* Name
* Address (optional)
* Eircode
* Latitude / Longitude (advanced / hidden behind toggle)

**Amenities** (boolean toggles)

* Food
* Live Music
* Sports
* Outdoor Seating
* Pool Table
* Darts
* Board Games
* Speakeasy

**Contact & Links**

* Phone number
* Website
* Facebook
* Twitter / X
* Instagram
* Email

**Operational info**

* Opening hours (raw text or structured later)

### UI Behaviour

* When admin is logged in:

  * Fields become editable on click (inline input / toggle)
  * Show subtle "Edit" affordance (icon or outline)
  * Autosave on blur or explicit save button
* When not admin:

  * No edit affordances visible

### Persistence

* Updates write directly to `pubs` table
* Partial updates allowed (PATCH semantics)
* Audit fields recommended:

  * `updated_at`
  * `updated_by`

---

## 2. Routing Fix – Nearby Page

### Current Issue

* `/nearby` page links to pubs by **ID** instead of **slug**

### Required Behaviour

* Nearby page must link to canonical pub route:

  * `/pubs/{slug}`
* ID-based routing should only be internal

### Implementation Notes

* Nearby query should return:

  * `id`
  * `slug`
* UI must always use `slug` for navigation
* If slug missing, fallback generation should occur at write-time, not render-time

---

## 3. Deals vs Pint Prices (Critical Fix)

### Current Issue

* Deals are appearing under **Pint Prices**
* Deals are being treated as cheapest pint

### Correct Model

#### Pint Prices

* Represents **standard pint prices**
* One pint can be marked as `cheapest = true`
* Pint prices are **not promotions**

#### Deals (New Section)

* Deals are **time-based or promotional**
* Examples:

  * Happy hour
  * 2-for-1
  * Discounted pints

### Required Behaviour

* Deals must:

  * Never affect cheapest pint logic
  * Never appear under Pint Prices

### UI Rules

* Create a **Deals** section on pub page
* Only render Deals section if ≥1 deal exists
* Pint Prices section should remain unchanged

### Data Expectations

* `deals` should be a separate entity/table
* Fields:

  * title
  * description
  * price (optional)
  * start_time / end_time (optional)
  * is_active

---

## 4. Conditional Section Rendering

### Rules

* Hide empty sections entirely

| Section       | Render Condition             |
| ------------- | ---------------------------- |
| Deals         | At least one active deal     |
| Pint Prices   | At least one pint price      |
| Contact Links | At least one link or phone   |
| Amenities     | Always show (defaults to No) |

---

## 5. Contact & Social Links – Enhanced Display

### Requirements

* If links exist, display them with:

  * Icon / logo
  * Clickable action

### Supported Links

* Phone → `tel:`
* Website → external link
* Facebook
* Twitter / X
* Instagram
* Email → `mailto:`

### UI Guidelines

* Use recognisable brand icons (SVG preferred)
* Display links inline or in a compact row
* Hide link entirely if value is null

Example:

* 📞 +353 1 920 3350
* 🌐 Website
* 📘 Facebook
* 🐦 Twitter

---

## 6. Permissions Summary

| Action                 | Public | Admin |
| ---------------------- | ------ | ----- |
| View pub               | ✅      | ✅     |
| Edit pub fields        | ❌      | ✅     |
| Add / edit pint prices | ❌      | ✅     |
| Add / edit deals       | ❌      | ✅     |
| Delete deals           | ❌      | ✅     |

---

## 7. Non-Goals (Out of Scope)

* No public editing or suggestions
* No version history UI (logging only)
* No moderation workflow yet

---

## 8. Acceptance Criteria

* Admin can edit pub details live
* Public users cannot see edit controls
* Nearby page links use slug
* Deals are separated from pint prices
* Deals section only appears when relevant
* Contact links show icons and are clickable

---

## 9. Admin Deactivation / Reactivation of Pubs

### Purpose

Allow admins to remove pubs from public view without deleting data.

### Behaviour

* Deactivated pubs:

  * Are hidden from all public pages (Nearby, Search, Map, Direct slug access)
  * Still exist in the database
  * Are visible only in the Admin section

### Data Model

* `is_active` (boolean, default true)
* `deactivated_at` (timestamptz)
* `deactivated_by` (uuid)

### Admin UI

* Toggle on pub page: **Deactivate / Reactivate**
* Deactivated pubs appear greyed out in admin lists
* Optional reason field for future use

---

## 10. Open Now & Closing Soon Indicators

### Purpose

Improve usefulness for real-world decisions.

### Behaviour

* Use `opening_hours_raw` to determine:

  * Open now
  * Closing soon (e.g. within 30 minutes)
  * Closed

### UI

* Status badge on pub card and pub page
* Filters:

  * Open now
  * Open late

---

## 11. Price Freshness Indicators (Trust Signal)

### Purpose

Help users trust price data.

### Behaviour

* Display how recently prices were updated:

  * “Updated 8m ago”
  * “Last confirmed 3 days ago”
* Visually de-emphasise stale prices

### Admin Controls

* Ability to mark prices as verified
* Optional auto-expiry for old prices

---

## 12. Deals vs Prices – Global Separation

### Rule

* Deals are promotions, not prices
* Deals must never influence cheapest pint logic

### Behaviour

* Dedicated Deals section on pub page
* Deals section only renders if deals exist
* Pint Prices section remains unchanged

---

## 13. Duplicate Detection (Admin)

### Purpose

Prevent duplicate pubs from imports and user submissions.

### Detection Heuristics

* Distance threshold (e.g. < 20m)
* Similar name matching

### Admin Tools

* Flag possible duplicates
* Merge tool (future)

---

## 14. Admin Audit Log

### Purpose

Track changes without exposing public UI.

### Logged Events

* Pub edits
* Deactivation / reactivation
* Deal creation / edits
* Price edits

### Data Model

* `entity_type`
* `entity_id`
* `action`
* `changed_by`
* `changed_at`

---

## 15. Soft Moderation Flags

### Purpose

Represent real-world pub states without deletion.

### Examples

* Temporarily closed
* Renovation
* Private / members-only
* Permanently closed

### Notes

* These flags affect visibility and messaging, not existence

---

## 16. Nearby Filters That Matter

### Filters

* Open now
* Cheapest pint nearby
* Deals nearby
* Wheelchair accessible
* Outdoor seating

---

## 17. Canonical URLs Everywhere

### Rule

* Slugs are the only public identifier
* IDs are internal only

### Behaviour

* `/pubs/{slug}` is canonical
* Nearby, map, search must link by slug

---

## 18. Pub Completeness Score (Admin/Internal)

### Purpose

Surface data quality gaps.

### Scoring Signals

* Has prices
* Has opening hours
* Has contact info
* Recently updated

### Usage

* Admin dashboard sorting
* Identify pubs needing attention

---

## Notes for Future Iteration

* Structured opening hours parsing
* Verified badges for admin-reviewed data
* Owner / staff limited edit access
