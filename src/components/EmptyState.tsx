'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface Action {
  label: string;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actions?: Action[];
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actions = [],
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 animate-fade-in ${className}`}>
      {/* Icon */}
      <div className="text-6xl mb-4 animate-bounce-slow">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-cream-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-stout-400 max-w-md mb-6">
        {description}
      </p>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actions.map((action, index) => {
            const buttonClasses = action.primary
              ? 'bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors'
              : 'bg-stout-700 hover:bg-stout-600 text-cream-100 px-5 py-2.5 rounded-lg transition-colors';

            if (action.href) {
              return (
                <Link key={index} href={action.href} className={buttonClasses}>
                  {action.label}
                </Link>
              );
            }

            return (
              <button
                key={index}
                onClick={action.onClick}
                className={buttonClasses}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function NoPubsNearby({
  onExpandRadius,
  currentRadius = 1,
}: {
  onExpandRadius?: () => void;
  currentRadius?: number;
}) {
  return (
    <EmptyState
      icon="📍"
      title="No pubs nearby"
      description={`Try expanding your search radius beyond ${currentRadius}km or explore other neighborhoods`}
      actions={[
        { label: 'Expand to 5km', onClick: onExpandRadius },
        { label: 'View All Pubs', href: '/pubs' },
      ]}
    />
  );
}

export function NoReviews({ pubSlug }: { pubSlug: string }) {
  return (
    <EmptyState
      icon="✍️"
      title="Be the first to review!"
      description="Share your experience and help fellow Dubliners find the best pints"
      actions={[
        {
          label: 'Write Review',
          href: `/pubs/${pubSlug}/review`,
          primary: true,
        },
      ]}
    />
  );
}

export function NoPrices({ pubSlug }: { pubSlug: string }) {
  return (
    <EmptyState
      icon="💰"
      title="Help the community"
      description="Know the price? Submit it and earn 5 points"
      actions={[
        {
          label: 'Submit Price',
          href: `/pubs/${pubSlug}/prices/add`,
          primary: true,
        },
      ]}
    />
  );
}

export function NoSearchResults({ query, onClear }: { query: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description={`We couldn't find any pubs matching "${query}". Try different keywords or browse all pubs.`}
      actions={[
        { label: 'Clear Search', onClick: onClear },
        { label: 'Browse All Pubs', href: '/pubs' },
      ]}
    />
  );
}

export function NoDeals() {
  return (
    <EmptyState
      icon="🏷️"
      title="No active deals right now"
      description="Check back later for happy hour specials and limited-time offers"
      actions={[
        { label: 'View All Pubs', href: '/pubs' },
        { label: 'Submit a Deal', href: '/deals/add', primary: true },
      ]}
    />
  );
}

export function NoEvents() {
  return (
    <EmptyState
      icon="🎉"
      title="No events tonight"
      description="Looking for live music, quiz nights, or trad sessions? Check back later."
      actions={[{ label: 'Explore Pubs', href: '/pubs' }]}
    />
  );
}

export function NoFavorites() {
  return (
    <EmptyState
      icon="⭐"
      title="No favorites yet"
      description="Start exploring pubs and save your favorites for easy access"
      actions={[
        { label: 'Find Pubs', href: '/pubs', primary: true },
        { label: 'View Map', href: '/map' },
      ]}
    />
  );
}

export function NoFriends() {
  return (
    <EmptyState
      icon="👥"
      title="No friends yet"
      description="Connect with other pub enthusiasts to share recommendations and plan pub crawls"
      actions={[
        { label: 'Find Friends', href: '/users', primary: true },
        { label: 'Join Tonight Feed', href: '/tonight' },
      ]}
    />
  );
}
