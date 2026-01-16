# Update v2 – Product Expansion, Trust & Differentiation

This document defines **Version 2 feature additions** for The Session. All items here are **new enhancements**, building on the existing admin, pricing, and pub infrastructure already in place.

The focus of v2 is:

* Trust & verification
* Cultural relevance (Dublin-first)
* Data storytelling
* Sustainable monetisation
* Community contribution without toxicity

---

## 1. Data & Analytics

### 1.1 Price History Graph

**Description**
Each pub page should display a simple line graph showing the price history of a standard pint (e.g. Guinness) over time.

**Requirements**

* Default view: last 6 months
* Toggle: 6 months / 12 months
* Only show verified prices (or visually distinguish confidence)
* Hover tooltip shows:

  * Price
  * Date
  * Verification count

**Purpose**

* Visualise inflation and price changes
* Highly shareable and discussion-driven

---

### 1.2 The Stout Index (Homepage Feature)

**Description**
A homepage widget showing the **average price of a Guinness across Dublin**, compared to previous periods.

**Example**

> 🍺 The Stout Index
> Avg Guinness today: €6.38
> ↑ €0.22 since last month

**Requirements**

* City-wide weighted average
* Comparison to last week / month
* Refresh daily

**Purpose**

* Becomes a signature metric for the site
* Press- and share-friendly

---

## 2. Verification & Media

### 2.1 Verify Button (Low-Friction Validation)

**Description**
Instead of full submissions, users can quickly confirm existing prices.

**UI**

> “Is this price still €6.00?”
> [ Yes ] [ No ]

**Behaviour**

* **Yes**:

  * Refresh timestamp
  * Increase confidence score
  * Credit contributor
* **No**:

  * Prompt for new price submission

---

### 2.2 Photo Proof

**Description**
Allow optional photo uploads of receipts or price boards.

**Rules**

* Optional, not required
* Adds “Verified by photo” badge
* OCR is future enhancement (not required for v2)

---

### 2.3 Menu Scans

**Description**
Allow pubs to display uploaded drink menus.

**Behaviour**

* “View Menu” opens image gallery/modal
* Admin uploads first
* User uploads later via moderation

---

## 3. Deals & Monetisation

### 3.1 Enhanced Deal Structure

**Deal Types**

* Fixed price (e.g. €5 pints)
* Percentage discount
* Bundle (e.g. 2-for-1)
* Happy hour (time-bound)

**Target Applicability**

* All Pints
* All Drinks
* Specific Drink

---

### 3.2 Promoted / Sponsored Deals

**Description**
A paid promotion option for pubs to surface deals.

**Rules**

* Appears at top of Nearby and pub pages
* Clearly labelled “Promoted”
* Never affects cheapest pint logic or rankings

**Purpose**

* Sustainable monetisation
* Does not compromise trust

---

## 4. Search, Filters & Logistics

### 4.1 Open Now & Late Bar Filters

**Filters**

* Open now
* Open after midnight
* Late bar (Fri/Sat)

---

### 4.2 Amenities Tags & Filters

**Tags**

* Beer Garden
* Dog Friendly
* Live Music
* Sports Screens
* Late Bar
* Wheelchair Accessible
* Traditional Music
* Quiz Night
* Snug
* Craft Beer Focused

**Behaviour**

* Filterable on Nearby & Map
* Admin-editable first

---

### 4.3 Snug Finder

**Description**
Specific attribute for pubs with private snugs.

**Purpose**

* Highly Dublin-specific
* High cultural value

---

### 4.4 Cash / Card Alerts

**Description**
Flag pubs as:

* Cash only
* Card only

---

## 5. Community & Gamification (Low-Toxicity)

### 5.1 Contributor Leaderboards

**Description**
Monthly leaderboard recognising contributors.

**Examples**

* Top Scout of the Month
* Most Verified Prices

**Rules**

* Monthly reset
* No lifetime dominance

---

### 5.2 Likes / Upvotes on Pubs

**Description**
Allow users to “like” pubs.

**Rules**

* Likes do not affect rankings
* Display as social signal only

---

## 6. Guinness & Culture Features

### 6.1 The Cream Index

**Description**
A dedicated rating system for Guinness quality.

**Criteria**

* Creaminess
* Temperature
* Stick

**Display**

* Separate from overall pub rating
* Average Cream Score shown

---

### 6.2 Annual Guinness Awards

**Examples**

* Best Pint of Plain
* Best Cream Score
* Most Improved Pint

**Purpose**

* Cultural relevance
* Press & social engagement

---

## 7. Events & Social Utility

### 7.1 Events / The Session Listings

**Types**

* Traditional sessions
* Quiz nights
* Live music
* Match-day specials

**Rules**

* Lightweight listings
* Time-bound
* Admin-curated initially

---

### 7.2 Pub Crawl Planner

**Description**
Generate curated pub routes.

**Examples**

* Cheapest crawl
* Best-rated crawl
* Classic pubs crawl

---

## 8. Visualisation & Discovery

### 8.1 Average Price Heatmap

**Description**
Map overlay showing price density by area.

**Purpose**

* Discover affordable vs expensive neighbourhoods
* Strong visual differentiation

---

## 9. Trust, Moderation & Data Quality

### 9.1 Report an Inaccuracy

**Quick Flags**

* Price wrong
* Deal expired
* Pub closed

**Behaviour**

* No comments
* Feeds into admin queue

---

### 9.2 Confidence Indicators

**Examples**

* Verified today
* Updated recently
* Low confidence

---

## 10. Technical & UX Enhancements

### 10.1 Offline Mode (Add Price)

**Description**
Allow submissions offline.

**Behaviour**

* Save locally
* Sync when connection restored

---

### 10.2 Canonical URLs Everywhere

**Rule**

* All public navigation uses `/pubs/{slug}`
* IDs remain internal only

---

## Acceptance Criteria

* New analytics and cultural features integrated without breaking trust
* Community participation encouraged with low friction
* Monetisation is transparent and optional
* The Session feels distinctly Dublin-focused

---

## Final Note

Version 2 should reinforce **accuracy, culture, and usefulness** rather than social noise. Every feature here exists to make choosing a pub easier, fairer, and more fun.
