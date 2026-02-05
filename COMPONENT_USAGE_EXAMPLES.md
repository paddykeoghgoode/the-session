# Component Usage Examples

Guide for using the new UX/UI components.

## 🍞 Toast Notifications

### Basic Usage

```tsx
'use client';

import { useToast } from '@/components/Toast';

export function MyComponent() {
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      await submitPrice();
      toast.success('Price submitted! +10 points', {
        icon: '🍺',
        duration: 3000
      });
    } catch (error) {
      toast.error('Failed to submit price. Please try again.');
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
}
```

### With Actions

```tsx
toast.success('Price submitted! +10 points', {
  icon: '🍺',
  action: {
    label: 'View Leaderboard',
    onClick: () => router.push('/leaderboard')
  }
});
```

### Toast Types

```tsx
// Success (green)
toast.success('Operation completed successfully');

// Error (red)
toast.error('Something went wrong');

// Info (blue)
toast.info('New feature available!');

// Custom icon
toast.success('Check-in recorded', { icon: '📍' });
```

---

## 🎯 Filter Chips

### On Pub Listing Page

```tsx
'use client';

import { useState } from 'react';
import FilterChips, { PUB_FILTERS } from '@/components/FilterChips';

export function PubList() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
    // Refetch pubs with filters
    fetchPubs({ filters });
  };

  return (
    <div>
      <FilterChips
        filters={PUB_FILTERS}
        onChange={handleFilterChange}
        initialActive={activeFilters}
      />
      {/* Pub list */}
    </div>
  );
}
```

### Custom Filters

```tsx
const MY_FILTERS = [
  { id: 'cheap', label: 'Under €6', icon: '💰', value: { maxPrice: 6 } },
  { id: 'verified', label: 'Verified', icon: '✓', value: { verified: true } },
];

<FilterChips filters={MY_FILTERS} onChange={handleChange} />
```

### Preset Filter Sets

```tsx
import { PUB_FILTERS, PRICE_FILTERS, VIBE_FILTERS } from '@/components/FilterChips';

// Amenity filters
<FilterChips filters={PUB_FILTERS} onChange={handleChange} />

// Price filters
<FilterChips filters={PRICE_FILTERS} onChange={handleChange} />

// Vibe filters
<FilterChips filters={VIBE_FILTERS} onChange={handleChange} />
```

---

## 💀 Skeleton Loading

### Pub List

```tsx
import { PubCardListSkeleton } from '@/components/Skeleton';

export function PubList() {
  const { data: pubs, isLoading } = usePubs();

  if (isLoading) {
    return <PubCardListSkeleton count={6} />;
  }

  return <div>{/* Pub cards */}</div>;
}
```

### Available Skeletons

```tsx
// Pub cards grid
<PubCardListSkeleton count={6} />

// Single pub detail page
<PubDetailSkeleton />

// Price table
<PriceTableSkeleton rows={5} />

// Review list
<ReviewListSkeleton count={3} />

// Photo grid
<PhotoGridSkeleton count={6} />

// List items (leaderboard, etc.)
<ListSkeleton count={10} />

// Table
<TableSkeleton rows={10} cols={4} />

// Search results
<SearchResultsSkeleton />

// Stat cards
<StatGridSkeleton count={4} />
```

---

## 🎈 Floating Action Button

Already integrated! Just shows on all pages except:
- `/prices/add`
- `/deals/add`
- `/auth/login`
- `/auth/register`

To customize:

```tsx
// src/components/FloatingActionButton.tsx

// Add more hidden paths
const hiddenPaths = [
  '/prices/add',
  '/deals/add',
  '/auth/login',
  '/auth/register',
  '/my-custom-page'  // Add here
];
```

---

## 📱 Mobile Bottom Navigation

Already integrated! Shows only on mobile (`md:hidden`).

Navigation items:
1. 🏠 Home
2. 🔍 Search (Pubs)
3. ➕ Add (Highlighted, elevated)
4. 🗺️ Map
5. 👤 Profile (or Login if not authenticated)

To customize navigation items:

```tsx
// src/components/MobileBottomNav.tsx

const navItems = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/pubs', label: 'Search', icon: SearchIcon },
  { href: '/prices/add', label: 'Add', icon: PlusIcon, highlight: true },
  { href: '/map', label: 'Map', icon: MapIcon },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];
```

---

## 🎨 Animations

All animations are in `globals.css`:

### Slide In Right
```tsx
<div className="animate-slide-in-right">
  Slides in from right
</div>
```

### Bounce Slow
```tsx
<div className="animate-bounce-slow">
  Bounces gently (2s loop)
</div>
```

### Fade In
```tsx
<div className="animate-fade-in">
  Fades in smoothly
</div>
```

### Hide Scrollbar
```tsx
<div className="scrollbar-hide overflow-x-auto">
  Content with hidden scrollbar
</div>
```

---

## 📋 Complete Example: Pub Listing with All Features

```tsx
'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';
import FilterChips, { PUB_FILTERS } from '@/components/FilterChips';
import { PubCardListSkeleton } from '@/components/Skeleton';
import PubCard from '@/components/PubCard';

export function PubListingPage() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pubs, setPubs] = useState([]);
  const toast = useToast();

  const fetchPubs = async (filters: string[]) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pubs?filters=${filters.join(',')}`);
      const data = await response.json();
      setPubs(data);

      toast.info(`Found ${data.length} pubs`, {
        icon: '🍺',
        duration: 2000
      });
    } catch (error) {
      toast.error('Failed to load pubs. Tap to retry', {
        action: {
          label: 'Retry',
          onClick: () => fetchPubs(filters)
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
    fetchPubs(filters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-cream-100 mb-6">
        Find a Pub
      </h1>

      {/* Filter Chips */}
      <div className="mb-6">
        <FilterChips
          filters={PUB_FILTERS}
          onChange={handleFilterChange}
          initialActive={activeFilters}
        />
      </div>

      {/* Pub List or Loading */}
      {isLoading ? (
        <PubCardListSkeleton count={6} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pubs.map((pub) => (
            <PubCard key={pub.id} pub={pub} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && pubs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-stout-400 text-lg mb-4">
            No pubs found with these filters
          </p>
          <button
            onClick={() => setActiveFilters([])}
            className="text-irish-green-500 hover:text-irish-green-400"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 Performance Tips

### Lazy Load Components

```tsx
import dynamic from 'next/dynamic';

const FilterChips = dynamic(() => import('@/components/FilterChips'), {
  loading: () => <div className="h-12 bg-stout-800 rounded animate-pulse" />
});
```

### Debounce Toast Notifications

```tsx
import { useCallback } from 'react';
import { useToast } from '@/components/Toast';
import { debounce } from 'lodash';

const toast = useToast();

const debouncedToast = useCallback(
  debounce((message: string) => {
    toast.info(message);
  }, 500),
  []
);
```

### Optimize Skeleton Rendering

```tsx
// Only show skeleton for slow loads (> 500ms)
const [showSkeleton, setShowSkeleton] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setShowSkeleton(true), 500);
  return () => clearTimeout(timer);
}, []);

if (isLoading && showSkeleton) {
  return <PubCardListSkeleton />;
}
```

---

## 🎯 Next Steps

1. **Add filter chips to `/pubs` page**
2. **Use toast notifications for all user actions**
3. **Replace loading spinners with skeletons**
4. **Test mobile navigation on actual device**
5. **Customize FAB tooltip/icon if needed**

All components are production-ready! 🚀
