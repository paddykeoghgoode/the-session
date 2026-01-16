'use client';

import type { Pub } from '@/types';

interface PubAmenitiesProps {
  pub: Pub;
  variant?: 'full' | 'compact' | 'badges';
}

interface AmenityItem {
  key: string;
  label: string;
  icon: string;
  category: 'feature' | 'payment' | 'special';
}

const ALL_AMENITIES: AmenityItem[] = [
  // Features
  { key: 'has_food', label: 'Serves Food', icon: '🍴', category: 'feature' },
  { key: 'has_live_music', label: 'Live Music', icon: '🎵', category: 'feature' },
  { key: 'has_traditional_music', label: 'Trad Music', icon: '🎻', category: 'feature' },
  { key: 'shows_sports', label: 'Shows Sports', icon: '⚽', category: 'feature' },
  { key: 'has_outdoor_seating', label: 'Outdoor Seating', icon: '🌳', category: 'feature' },
  { key: 'has_beer_garden', label: 'Beer Garden', icon: '🌻', category: 'feature' },
  { key: 'has_pool', label: 'Pool Table', icon: '🎱', category: 'feature' },
  { key: 'has_darts', label: 'Darts', icon: '🎯', category: 'feature' },
  { key: 'has_board_games', label: 'Board Games', icon: '🎲', category: 'feature' },
  { key: 'has_quiz_night', label: 'Quiz Night', icon: '❓', category: 'feature' },
  { key: 'has_snug', label: 'Has Snug', icon: '🛋️', category: 'feature' },
  // Special
  { key: 'is_speakeasy', label: 'Speakeasy', icon: '🕵️', category: 'special' },
  { key: 'is_late_bar', label: 'Late Bar', icon: '🌙', category: 'special' },
  { key: 'is_dog_friendly', label: 'Dog Friendly', icon: '🐕', category: 'special' },
  { key: 'is_wheelchair_accessible', label: 'Wheelchair Access', icon: '♿', category: 'special' },
  { key: 'is_craft_beer_focused', label: 'Craft Beer', icon: '🍻', category: 'special' },
  // Payment
  { key: 'is_cash_only', label: 'Cash Only', icon: '💵', category: 'payment' },
  { key: 'is_card_only', label: 'Card Only', icon: '💳', category: 'payment' },
];

export default function PubAmenities({ pub, variant = 'full' }: PubAmenitiesProps) {
  // Filter to only amenities that are true
  const activeAmenities = ALL_AMENITIES.filter(
    amenity => pub[amenity.key as keyof Pub] === true
  );

  if (activeAmenities.length === 0) {
    return null;
  }

  if (variant === 'badges') {
    return (
      <div className="flex flex-wrap gap-1">
        {activeAmenities.slice(0, 5).map(({ key, label, icon }) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-stout-700 text-stout-300 text-xs rounded-full"
            title={label}
          >
            <span>{icon}</span>
          </span>
        ))}
        {activeAmenities.length > 5 && (
          <span className="inline-flex items-center px-2 py-0.5 bg-stout-700 text-stout-400 text-xs rounded-full">
            +{activeAmenities.length - 5}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {activeAmenities.map(({ key, label, icon }) => (
          <span
            key={key}
            className="inline-flex items-center gap-1 px-2 py-1 bg-stout-700 text-cream-100 text-sm rounded"
            title={label}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </span>
        ))}
      </div>
    );
  }

  // Full variant - grouped by category
  const featureAmenities = activeAmenities.filter(a => a.category === 'feature');
  const specialAmenities = activeAmenities.filter(a => a.category === 'special');
  const paymentAmenities = activeAmenities.filter(a => a.category === 'payment');

  return (
    <div className="space-y-4">
      {/* Features */}
      {featureAmenities.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-stout-400 uppercase tracking-wider mb-2">
            Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {featureAmenities.map(({ key, label, icon }) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-stout-700 text-cream-100 text-sm rounded-lg"
              >
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Special */}
      {specialAmenities.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-stout-400 uppercase tracking-wider mb-2">
            Special
          </h4>
          <div className="flex flex-wrap gap-2">
            {specialAmenities.map(({ key, label, icon }) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-irish-green-500/10 border border-irish-green-500/30 text-irish-green-400 text-sm rounded-lg"
              >
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Payment */}
      {paymentAmenities.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-stout-400 uppercase tracking-wider mb-2">
            Payment
          </h4>
          <div className="flex flex-wrap gap-2">
            {paymentAmenities.map(({ key, label, icon }) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm rounded-lg"
              >
                <span className="text-base">{icon}</span>
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
