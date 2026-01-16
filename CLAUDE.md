# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Session is a crowdsourced web application for tracking pub prices, reviews, and deals across Dublin. Users can submit pint prices, rate pubs, and find the cheapest drinks nearby.

## Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Guinness-inspired color palette (`stout`, `cream`, `irish-green`)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (email + optional Google OAuth)
- **Maps**: Google Maps API (optional)

## Architecture

### Supabase Client Pattern

Two separate Supabase clients are used:
- `src/lib/supabase.ts` - Browser client using `createBrowserClient` from `@supabase/ssr`
- `src/lib/supabase-server.ts` - Server client using `createServerClient` with cookie handling for SSR

The server client provides `getSession()` and `getUser()` helpers for authentication in Server Components.

### Middleware

`src/middleware.ts` handles session refresh for authenticated requests using Supabase SSR cookies.

### Database Schema

Core tables:
- `pubs` - Pub information with amenities, hours, social links, location
- `drinks` - Reference table for tracked beverages (Guinness, Heineken, etc.)
- `prices` - User-submitted prices with deal flags, verification counts
- `reviews` - Multi-category ratings (pint quality, ambience, staff, safety, value, food)
- `profiles` - User profiles linked to Supabase Auth
- `pub_photos` - Moderated photo uploads
- `amenity_votes` - Crowdsourced amenity verification

Key views:
- `pub_summaries` - Aggregated pub data with ratings and prices

Migrations are in `supabase/migrations/` and should be run in order via Supabase SQL Editor.

### Type System

All TypeScript types are centralized in `src/types/index.ts`, including:
- Entity interfaces (`Pub`, `Price`, `Review`, `Profile`, etc.)
- Form submission types
- Constants for drinks and amenities (drink IDs are stable - do not reorder)

### Page Structure

Uses Next.js App Router:
- Pages use Server Components by default with `revalidate` for ISR
- Dynamic routes use slug or UUID lookup (e.g., `/pubs/[id]`)
- Most data fetching happens in page components via `createServerSupabaseClient()`

### Component Patterns

- Components are in `src/components/`
- Server Components fetch data; Client Components handle interactivity
- Admin-only features check `userProfile?.is_admin`
- Price displays separate deals from regular prices

### Utility Functions

`src/lib/utils.ts` contains:
- `cn()` - Tailwind class merging
- `formatPrice()` - EUR currency formatting
- `isOpenNow()` - Dublin timezone opening hours check
- `getDistanceKm()` - Haversine distance calculation
- `calculateAverageRating()` - Review rating aggregation

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=  # Optional
```

## Key Conventions

- Prices use EUR formatting via `Intl.NumberFormat`
- Times are displayed in Dublin timezone (`Europe/Dublin`)
- Drink IDs in `DRINKS` array must not be reordered (backward compatibility)
- Regular prices vs deals are always separated in UI
- Moderation system requires `is_approved` checks on reviews and photos
