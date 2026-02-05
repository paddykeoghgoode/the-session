# Complete Component Guide

Comprehensive documentation for all UI components in The Session.

---

## 📦 Table of Contents

1. [Card System](#-card-system)
2. [Hero Sections](#-hero-sections)
3. [Search Components](#-search-components)
4. [Empty States](#-empty-states)
5. [Progress Indicators](#-progress-indicators)
6. [Mobile Features](#-mobile-features)
7. [Micro-interactions](#-micro-interactions)
8. [Optimistic UI](#-optimistic-ui)
9. [Animations](#-animations)

---

## 🃏 Card System

Unified card component with multiple variants for consistent UI.

### Basic Usage

```tsx
import Card, { CardImage, CardHeader, CardTitle, CardSubtitle, CardStats, Stat, CardActions } from '@/components/Card';

<Card variant="pub" elevation="hover" href="/pubs/the-temple-bar">
  <CardImage
    src="/pub-photo.jpg"
    alt="The Temple Bar"
    aspectRatio="video"
  />
  <CardHeader>
    <CardBadge variant="verified">Verified Prices</CardBadge>
    <CardTitle>The Temple Bar</CardTitle>
    <CardSubtitle>Temple Bar, Dublin 2</CardSubtitle>
  </CardHeader>
  <CardStats>
    <Stat icon="⭐" value="4.5" />
    <Stat icon="💰" value="€6.50" />
    <Stat icon="📍" value="0.5km" />
  </CardStats>
  <CardActions>
    <button>View Menu</button>
    <button>Directions</button>
  </CardActions>
</Card>
```

### Card Variants

- `pub` - Standard pub listing (default)
- `deal` - Special offers with amber accent
- `event` - Tonight feed events with green accent
- `review` - User review cards
- `profile` - User profile cards

### Card Elevations

- `none` - No shadow
- `sm` - Small shadow
- `md` - Medium shadow
- `hover` - Shadow + scale on hover (recommended for clickable cards)

### Image Aspect Ratios

- `video` - 16:9 (default, best for pub photos)
- `square` - 1:1
- `portrait` - 3:4

### Example: Deal Card

```tsx
<Card variant="deal" elevation="hover">
  <CardImage src="/deal.jpg" alt="Happy Hour" />
  <CardHeader>
    <CardBadge variant="hot">🔥 Hot Deal</CardBadge>
    <CardTitle>Happy Hour Special</CardTitle>
    <CardSubtitle>€5 Pints • 4-7pm Daily</CardSubtitle>
  </CardHeader>
  <CardContent>
    <p>All house pints €5 during happy hour!</p>
  </CardContent>
</Card>
```

---

## 🎯 Hero Sections

### Main Hero (Homepage)

Full-featured hero with search, stats, and animated background.

```tsx
import Hero from '@/components/Hero';

<Hero
  stats={{
    users: 5247,
    pubs: 328,
    reviews: 12439
  }}
/>
```

Features:
- Animated pint icon
- Gradient background with pulse effect
- Live stats display
- Integrated smart search
- Search suggestions

### Simple Hero (Internal Pages)

Lightweight hero for pages that don't need search.

```tsx
import { SimpleHero } from '@/components/Hero';

<SimpleHero
  title="Find the Best Deals"
  description="Discover happy hours and special offers across Dublin"
  icon="🏷️"
  backgroundGradient="from-amber-900 to-stout-800"
/>
```

---

## 🔍 Search Components

### Smart Search with Autocomplete

Intelligent search with recent searches, keyboard navigation, and categorized results.

```tsx
import SmartSearch from '@/components/SmartSearch';

<SmartSearch
  placeholder="Search pubs, neighborhoods, or drinks..."
  onSelect={(result) => {
    console.log('Selected:', result);
    router.push(result.href);
  }}
  autoFocus
/>
```

Features:
- **Recent searches** - Saved to localStorage
- **Fuzzy matching** - "temple" matches "The Temple Bar"
- **Keyboard navigation** - Arrow keys, Enter, Escape
- **Categorized results** - Pubs, Neighborhoods, Drinks
- **Loading states** - Spinner while searching
- **Search tips** - Helpful suggestions when empty

### Search Result Types

```typescript
interface SearchResult {
  type: 'pub' | 'neighborhood' | 'drink';
  id: string;
  name: string;
  subtitle?: string;
  icon: string;
  href: string;
  badge?: string;
}
```

---

## 💀 Empty States

Contextual empty states with helpful CTAs.

### Generic Empty State

```tsx
import EmptyState from '@/components/EmptyState';

<EmptyState
  icon="📍"
  title="No pubs nearby"
  description="Try expanding your search radius or explore other neighborhoods"
  actions={[
    { label: 'Expand to 5km', onClick: () => setRadius(5) },
    { label: 'View All Pubs', href: '/pubs' }
  ]}
/>
```

### Preset Empty States

```tsx
import {
  NoPubsNearby,
  NoReviews,
  NoPrices,
  NoSearchResults,
  NoDeals,
  NoEvents,
  NoFavorites,
  NoFriends
} from '@/components/EmptyState';

// No pubs nearby
<NoPubsNearby
  onExpandRadius={() => setRadius(5)}
  currentRadius={1}
/>

// No reviews
<NoReviews pubSlug="the-temple-bar" />

// No prices
<NoPrices pubSlug="the-temple-bar" />

// No search results
<NoSearchResults
  query="asdfgh"
  onClear={() => setQuery('')}
/>

// No deals, events, favorites, or friends
<NoDeals />
<NoEvents />
<NoFavorites />
<NoFriends />
```

---

## 📊 Progress Indicators

### Progress Bar

```tsx
import ProgressBar from '@/components/Progress';

<ProgressBar
  value={60}
  max={100}
  size="md"
  color="green"
  showLabel
/>
```

**Sizes:** `sm`, `md`, `lg`
**Colors:** `green`, `amber`, `blue`

### Progress Card with Checklist

```tsx
import { ProgressCard, Checklist, ChecklistItem } from '@/components/Progress';

<ProgressCard
  title="Complete Your Profile"
  description="Finish these steps to unlock rewards"
  value={2}
  max={5}
>
  <Checklist>
    <ChecklistItem done>Add profile photo</ChecklistItem>
    <ChecklistItem done>Set home location</ChecklistItem>
    <ChecklistItem href="/reviews/new">Write first review</ChecklistItem>
    <ChecklistItem onClick={submitPrice}>Submit 3 prices</ChecklistItem>
    <ChecklistItem>Add 5 friends</ChecklistItem>
  </Checklist>
</ProgressCard>
```

### Circular Progress

```tsx
import { CircularProgress } from '@/components/Progress';

<CircularProgress
  value={75}
  max={100}
  size={120}
  color="green"
  showLabel
>
  {/* Optional custom content */}
  <div>
    <span className="text-2xl">🏆</span>
    <p>75%</p>
  </div>
</CircularProgress>
```

### Profile Completion Card

```tsx
import { ProfileCompletionCard } from '@/components/Progress';

<ProfileCompletionCard
  profileComplete={60}
  tasksCompleted={{
    photo: true,
    location: true,
    review: false,
    prices: false,
    friends: false
  }}
/>
```

---

## 📱 Mobile Features

### Near Me Button

Location-based discovery with geolocation.

```tsx
import NearMeButton from '@/components/NearMeButton';

<NearMeButton
  onLocationFound={(coords) => {
    console.log('Lat:', coords.latitude);
    console.log('Lng:', coords.longitude);
    fetchNearbyPubs(coords);
  }}
  onError={(error) => {
    toast.error(error);
  }}
/>
```

Features:
- Requests geolocation permission
- Loading state while locating
- Error handling for denied permissions
- Timeout after 10 seconds

### Pull to Refresh

Native mobile pull-to-refresh gesture.

```tsx
import PullToRefresh from '@/components/PullToRefresh';

<PullToRefresh
  onRefresh={async () => {
    await refetchData();
  }}
  enabled={isMobile}
>
  <PubList pubs={pubs} />
</PullToRefresh>
```

Features:
- Only triggers at top of page
- Visual feedback with rotating icon
- "Release to refresh" text when threshold reached
- Smooth animations

### Pull to Refresh Hook (Advanced)

```tsx
import usePullToRefresh from '@/hooks/usePullToRefresh';

const { isRefreshing, pullDistance, isPulling } = usePullToRefresh({
  onRefresh: async () => {
    await fetchData();
  },
  threshold: 80,
  resistance: 2.5,
  enabled: true
});

// Custom UI based on pull state
{isPulling && (
  <div style={{ transform: `translateY(${pullDistance}px)` }}>
    Refreshing...
  </div>
)}
```

---

## ✨ Micro-interactions

### Like Button with Animation

```tsx
import LikeButton from '@/components/LikeButton';

<LikeButton
  initialLiked={pub.is_liked}
  initialCount={pub.like_count}
  onToggle={async (liked) => {
    await api.toggleLike(pub.id, liked);
  }}
  variant="heart"
  size="md"
  showCount
/>
```

**Variants:** `heart`, `star`
**Sizes:** `sm`, `md`, `lg`

Features:
- Heart beat animation on like
- Star pop animation
- Optimistic updates (instant feedback)
- Automatic rollback on error

### Points Animation

```tsx
import { usePointsAnimation } from '@/components/PointsAnimation';

const { showPoints, points, trigger, PointsComponent } = usePointsAnimation();

const handleSubmit = async () => {
  await submitPrice();
  trigger(10); // Show "+10" animation
};

return (
  <>
    <button onClick={handleSubmit}>Submit Price</button>
    {PointsComponent}
  </>
);
```

Features:
- Floats up and fades out
- Customizable duration
- onComplete callback
- Non-blocking (fixed position overlay)

---

## ⚡ Optimistic UI

### Optimistic Like Hook

```tsx
import { useOptimisticLike } from '@/hooks/useOptimistic';

const { liked, count, toggle, isUpdating } = useOptimisticLike(
  pub.is_liked,
  pub.like_count,
  async (newLikedState) => {
    await supabase
      .from('pub_likes')
      .insert({ pub_id: pub.id });
  }
);

<button onClick={toggle} disabled={isUpdating}>
  {liked ? '❤️' : '🤍'} {count}
</button>
```

### Optimistic List Operations

```tsx
import { useOptimisticList } from '@/hooks/useOptimistic';

const { items, pendingItems, addOptimistic, removeOptimistic } = useOptimisticList(pubs);

// Add with optimistic update
await addOptimistic(
  { id: 'temp-123', name: 'New Pub', ...otherData },
  async () => {
    const { data } = await supabase.from('pubs').insert(newPub);
    return data;
  }
);

// Remove with optimistic update
await removeOptimistic('pub-id', async () => {
  await supabase.from('pubs').delete().eq('id', 'pub-id');
});

// Show pending state
{items.map(item => (
  <div className={pendingItems.has(item.id) ? 'opacity-50' : ''}>
    {item.name}
  </div>
))}
```

### General Optimistic Updates

```tsx
import { useOptimisticUpdate } from '@/hooks/useOptimistic';

const { state, execute, isLoading, error } = useOptimisticUpdate({
  count: 0,
  liked: false
});

const handleLike = async () => {
  await execute(
    { liked: true, count: state.count + 1 }, // Optimistic update
    {
      execute: async () => {
        return await api.like(pubId);
      },
      onSuccess: (result) => {
        console.log('Like successful:', result);
      },
      onError: (error) => {
        toast.error('Failed to like');
      }
    }
  );
};
```

---

## 🎨 Animations

All animations are defined in `globals.css` and available as Tailwind classes.

### Available Animations

```tsx
// Slide in from right (toasts)
<div className="animate-slide-in-right">Toast</div>

// Slow bounce (hero icon)
<div className="animate-bounce-slow">🍺</div>

// Fade in
<div className="animate-fade-in">Content</div>

// Heart beat (like animation)
<button className="animate-heart-beat">❤️</button>

// Star pop (favorite animation)
<button className="animate-star-pop">⭐</button>

// Points float (gamification)
<div className="animate-points-float">+10</div>

// Shimmer (skeleton loading)
<div className="animate-shimmer bg-gradient-to-r...">Loading</div>

// Pulse ring (FAB, badges)
<div className="animate-pulse-ring">•</div>

// Slide up (dropdown menus)
<div className="animate-slide-up">Menu</div>

// Scale in (modals)
<div className="animate-scale-in">Modal</div>
```

### Custom Animation Durations

```tsx
// Override duration with inline styles
<div
  className="animate-bounce-slow"
  style={{ animationDuration: '3s' }}
>
  Slower bounce
</div>
```

### Hiding Scrollbars

```tsx
// Hide scrollbar but keep scroll functionality
<div className="overflow-x-auto scrollbar-hide">
  <FilterChips ... />
</div>
```

---

## 🎯 Complete Examples

### Pub Listing Page with All Features

```tsx
'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';
import Card, { CardImage, CardHeader, CardTitle, CardSubtitle, CardStats, Stat } from '@/components/Card';
import FilterChips, { PUB_FILTERS } from '@/components/FilterChips';
import { PubCardListSkeleton } from '@/components/Skeleton';
import PullToRefresh from '@/components/PullToRefresh';
import NearMeButton from '@/components/NearMeButton';
import { NoPubsNearby } from '@/components/EmptyState';
import SmartSearch from '@/components/SmartSearch';

export default function PubListPage() {
  const [pubs, setPubs] = useState([]);
  const [filters, setFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchPubs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pubs?filters=${filters.join(',')}`);
      const data = await response.json();
      setPubs(data);
    } catch (error) {
      toast.error('Failed to load pubs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationFound = (coords) => {
    toast.success('Location found!', { icon: '📍' });
    // Fetch nearby pubs
  };

  return (
    <PullToRefresh onRefresh={fetchPubs}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <SmartSearch placeholder="Search pubs..." />
        </div>

        {/* Near Me */}
        <NearMeButton
          onLocationFound={handleLocationFound}
          onError={(err) => toast.error(err)}
          className="mb-6"
        />

        {/* Filters */}
        <FilterChips
          filters={PUB_FILTERS}
          onChange={setFilters}
          initialActive={filters}
        />

        {/* Pub List */}
        {isLoading ? (
          <PubCardListSkeleton count={6} />
        ) : pubs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {pubs.map((pub) => (
              <Card key={pub.id} variant="pub" elevation="hover" href={`/pubs/${pub.slug}`}>
                <CardImage src={pub.photo_url} alt={pub.name} />
                <CardHeader>
                  <CardTitle>{pub.name}</CardTitle>
                  <CardSubtitle>{pub.neighborhood}</CardSubtitle>
                </CardHeader>
                <CardStats>
                  <Stat icon="⭐" value={pub.rating} />
                  <Stat icon="💰" value={`€${pub.cheapest_price}`} />
                  <Stat icon="📍" value={`${pub.distance}km`} />
                </CardStats>
              </Card>
            ))}
          </div>
        ) : (
          <NoPubsNearby
            onExpandRadius={() => setRadius(5)}
            currentRadius={1}
          />
        )}
      </div>
    </PullToRefresh>
  );
}
```

### Profile Page with Progress Tracking

```tsx
import { ProgressCard, Checklist, ChecklistItem } from '@/components/Progress';
import { CircularProgress } from '@/components/Progress';
import { usePointsAnimation } from '@/components/PointsAnimation';

export default function ProfilePage({ user, profile }) {
  const { trigger, PointsComponent } = usePointsAnimation();

  const completeTask = async (task) => {
    await markTaskComplete(task);
    trigger(5); // Show "+5 points"
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Level Progress */}
      <div className="mb-8 text-center">
        <CircularProgress
          value={profile.xp}
          max={profile.next_level_xp}
          size={150}
          color="green"
        >
          <div>
            <span className="text-3xl font-bold">Lvl {profile.level}</span>
          </div>
        </CircularProgress>
      </div>

      {/* Profile Completion */}
      <ProgressCard
        title="Complete Your Profile"
        value={profile.completion}
        max={100}
      >
        <Checklist>
          <ChecklistItem
            done={profile.has_photo}
            onClick={() => completeTask('photo')}
          >
            Add profile photo (+5 points)
          </ChecklistItem>
          <ChecklistItem
            done={profile.has_location}
            onClick={() => completeTask('location')}
          >
            Set home location (+5 points)
          </ChecklistItem>
          <ChecklistItem
            done={profile.reviews_count > 0}
            href="/reviews/new"
          >
            Write first review (+10 points)
          </ChecklistItem>
        </Checklist>
      </ProgressCard>

      {PointsComponent}
    </div>
  );
}
```

---

## 🚀 Best Practices

### Performance

1. **Lazy load images** - All CardImage components use Next.js Image with lazy loading
2. **Debounce search** - SmartSearch debounces API calls (300ms)
3. **Optimistic updates** - Use for likes, favorites, and other quick actions
4. **Skeleton loading** - Always show skeletons instead of blank screens

### Accessibility

1. **ARIA labels** - All interactive elements have proper labels
2. **Keyboard navigation** - SmartSearch supports arrow keys, Enter, Escape
3. **Focus states** - All buttons have visible focus indicators
4. **Semantic HTML** - Proper heading hierarchy, nav, button vs a tags

### Mobile

1. **Touch targets** - All buttons minimum 44x44px
2. **Safe areas** - Mobile nav respects safe-area-bottom
3. **Pull to refresh** - Only enable on touch devices
4. **Responsive images** - Use appropriate aspect ratios for mobile

### Error Handling

1. **Optimistic rollback** - Always rollback UI on API errors
2. **Toast errors** - Show user-friendly error messages
3. **Empty states** - Provide helpful CTAs when no data
4. **Loading states** - Show skeletons or spinners during loads

---

## 📚 Migration Guide

### Upgrading Existing Pages

1. **Replace old cards:**
   ```tsx
   // Before
   <div className="bg-stout-800 rounded-lg p-4">...</div>

   // After
   <Card variant="pub" elevation="hover">
     <CardHeader>...</CardHeader>
   </Card>
   ```

2. **Add empty states:**
   ```tsx
   // Before
   {pubs.length === 0 && <p>No pubs found</p>}

   // After
   <NoSearchResults query={query} onClear={() => setQuery('')} />
   ```

3. **Add progress indicators:**
   ```tsx
   // Before
   <div>{profile.completion}% complete</div>

   // After
   <ProgressBar value={profile.completion} max={100} showLabel />
   ```

4. **Use optimistic updates:**
   ```tsx
   // Before
   const handleLike = async () => {
     setIsLoading(true);
     await api.like(id);
     refetch();
     setIsLoading(false);
   };

   // After
   const { liked, toggle } = useOptimisticLike(
     initialLiked,
     initialCount,
     api.like
   );
   ```

---

All components are production-ready and follow The Session's design system! 🍺
