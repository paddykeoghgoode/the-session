'use client';

import { useState } from 'react';

export interface FilterOption {
  id: string;
  label: string;
  icon?: string;
  value: any;
}

interface FilterChipsProps {
  filters: FilterOption[];
  onChange: (activeFilters: string[]) => void;
  initialActive?: string[];
}

export default function FilterChips({ filters, onChange, initialActive = [] }: FilterChipsProps) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(initialActive));

  const toggleFilter = (filterId: string) => {
    const newFilters = new Set(activeFilters);

    if (newFilters.has(filterId)) {
      newFilters.delete(filterId);
    } else {
      newFilters.add(filterId);
    }

    setActiveFilters(newFilters);
    onChange(Array.from(newFilters));
  };

  const clearAll = () => {
    setActiveFilters(new Set());
    onChange([]);
  };

  return (
    <div className="flex items-center gap-2 pb-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
        {filters.map((filter) => {
          const isActive = activeFilters.has(filter.id);

          return (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all
                ${
                  isActive
                    ? 'bg-irish-green-600 text-white shadow-lg scale-105'
                    : 'bg-stout-800 text-cream-100 border border-stout-700 hover:border-irish-green-600 hover:bg-stout-700'
                }
              `}
              aria-pressed={isActive}
            >
              {filter.icon && <span className="text-base">{filter.icon}</span>}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {activeFilters.size > 0 && (
        <button
          onClick={clearAll}
          className="text-irish-green-500 hover:text-irish-green-400 font-medium text-sm whitespace-nowrap px-3"
        >
          Clear {activeFilters.size}
        </button>
      )}
    </div>
  );
}

// Preset filter configurations
export const PUB_FILTERS: FilterOption[] = [
  { id: 'has_guinness', label: 'Guinness', icon: '🍺', value: { drink_id: 1 } },
  { id: 'sports_tv', label: 'Sports TV', icon: '📺', value: { amenity: 'sports-tv' } },
  { id: 'beer_garden', label: 'Beer Garden', icon: '🌳', value: { amenity: 'outdoor-seating' } },
  { id: 'live_music', label: 'Live Music', icon: '🎵', value: { amenity: 'live-music' } },
  { id: 'wheelchair', label: 'Accessible', icon: '♿', value: { amenity: 'wheelchair-accessible' } },
  { id: 'dog_friendly', label: 'Dog Friendly', icon: '🐕', value: { amenity: 'dog-friendly' } },
  { id: 'craft_beer', label: 'Craft Beer', icon: '🍻', value: { amenity: 'craft-beer' } },
  { id: 'food', label: 'Food', icon: '🍔', value: { amenity: 'food-menu' } },
  { id: 'wifi', label: 'WiFi', icon: '📶', value: { amenity: 'wifi' } },
  { id: 'pool_table', label: 'Pool Table', icon: '🎱', value: { amenity: 'pool-table' } },
];

export const PRICE_FILTERS: FilterOption[] = [
  { id: 'under_6', label: 'Under €6', icon: '💰', value: { maxPrice: 6.00 } },
  { id: 'under_7', label: 'Under €7', icon: '💵', value: { maxPrice: 7.00 } },
  { id: 'deals', label: 'Deals Only', icon: '🏷️', value: { hasDeals: true } },
  { id: 'verified', label: 'Verified', icon: '✓', value: { verified: true } },
];

export const VIBE_FILTERS: FilterOption[] = [
  { id: 'quiet', label: 'Quiet', icon: '🤫', value: { vibe: 'quiet' } },
  { id: 'lively', label: 'Lively', icon: '🎉', value: { vibe: 'lively' } },
  { id: 'traditional', label: 'Traditional', icon: '🎻', value: { vibe: 'traditional' } },
  { id: 'modern', label: 'Modern', icon: '✨', value: { vibe: 'modern' } },
  { id: 'touristy', label: 'Touristy', icon: '📸', value: { vibe: 'touristy' } },
  { id: 'local', label: 'Local', icon: '🏠', value: { vibe: 'local' } },
];
