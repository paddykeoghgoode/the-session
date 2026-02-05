# SEO Metadata Additions

Quick reference for adding metadata to remaining pages. Use the `generateMetadata` helper from `/src/lib/metadata.ts`.

## Implementation Pattern

```typescript
import { generateMetadata as createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Page Title',
  description: 'Page description',
  path: '/page-url',
  keywords: ['keyword1', 'keyword2'],
});
```

---

## Pages Needing Metadata

### /map
```typescript
export const metadata = createMetadata({
  title: 'Dublin Pub Map - Find Pubs Near You',
  description: 'Interactive map of Dublin pubs. Find the nearest pub, compare prices, and discover new spots in your area.',
  path: '/map',
  keywords: ['Dublin pub map', 'pubs near me', 'Dublin pub locations', 'find pubs Dublin'],
});
```

### /leaderboard
```typescript
export const metadata = createMetadata({
  title: 'Leaderboard - Top Contributors',
  description: 'See the top contributors who help keep Dublin pub prices accurate. Compete for points and monthly prizes.',
  path: '/leaderboard',
  keywords: ['pub leaderboard', 'top contributors', 'gamification', 'pub community Dublin'],
});
```

### /tonight
```typescript
export const metadata = createMetadata({
  title: 'Tonight - What\'s Happening in Dublin Pubs',
  description: 'Find out what\'s happening tonight in Dublin pubs. Live music, trad sessions, quiz nights, and more.',
  path: '/tonight',
  keywords: ['Dublin tonight', 'live music Dublin', 'trad session', 'quiz night Dublin', 'pub events'],
});
```

### /for-you
```typescript
export const metadata = createMetadata({
  title: 'Recommended Pubs For You',
  description: 'Personalized pub recommendations based on your preferences, check-ins, and reviews.',
  path: '/for-you',
  keywords: ['personalized pubs', 'pub recommendations Dublin', 'discover pubs'],
});
```

### /nearby
```typescript
export const metadata = createMetadata({
  title: 'Pubs Near You - Find the Closest Pub',
  description: 'Find pubs near your current location with real-time distances, prices, and reviews.',
  path: '/nearby',
  keywords: ['pubs near me', 'nearest pub', 'Dublin pubs nearby', 'pub finder'],
});
```

### /friends
```typescript
export const metadata = createMetadata({
  title: 'Friends - Connect with Pub Enthusiasts',
  description: 'Connect with friends, share pub recommendations, and plan pub crawls together.',
  path: '/friends',
  keywords: ['pub friends', 'Dublin pub community', 'pub crawl planning', 'social drinking'],
});
```

### /premium
```typescript
export const metadata = createMetadata({
  title: 'Premium Membership - Unlock Exclusive Features',
  description: 'Get ad-free browsing, advanced filters, and exclusive badges with Premium membership.',
  path: '/premium',
  keywords: ['premium membership', 'pub app premium', 'exclusive features'],
});
```

### /sponsors
```typescript
export const metadata = createMetadata({
  title: 'Our Sponsors - Support The Session',
  description: 'Meet the sponsors who help make The Session possible. Support local businesses and pubs.',
  path: '/sponsors',
  keywords: ['pub sponsors', 'Dublin breweries', 'support local pubs'],
});
```

### /pubs (listing page)
```typescript
export const metadata = createMetadata({
  title: 'Browse All Dublin Pubs',
  description: 'Explore 300+ Dublin pubs with prices, reviews, ratings, and amenities. Filter by location, drink type, and features.',
  path: '/pubs',
  keywords: ['Dublin pubs list', 'all pubs Dublin', 'pub directory', 'find pubs'],
});
```

### /owner (pub owner dashboard)
```typescript
export const metadata = createMetadata({
  title: 'Pub Owner Dashboard',
  description: 'Manage your pub listing, respond to reviews, and update information on The Session.',
  path: '/owner',
  keywords: ['pub owner', 'business dashboard', 'manage pub listing'],
});
```

---

## Already Has Metadata ✓

- `/` (homepage) ✓
- `/deals` ✓
- `/about` ✓
- `/contact` ✓
- `/guides` ✓
- `/privacy` ✓
- `/terms` ✓
- `/profile/preferences` ✓
- `/pubs/[id]` (dynamic) ✓

---

## Priority Order

1. **High traffic**: /map, /pubs, /nearby, /tonight
2. **Conversion**: /premium, /sponsors
3. **Social**: /friends, /for-you, /leaderboard
4. **Business**: /owner

---

## Testing Metadata

1. Check social sharing preview: https://www.opengraph.xyz/
2. Validate Twitter cards: https://cards-dev.twitter.com/validator
3. Test Google search preview: https://technicalseo.com/tools/serp-simulator/

---

## Notes

- All metadata uses the helper function for consistency
- OG images should be 1200x630px
- Descriptions are 150-160 characters for optimal display
- Keywords focus on Dublin + pub + specific feature
- Canonical URLs prevent duplicate content issues
