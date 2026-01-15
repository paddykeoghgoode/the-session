'use client';

import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const displayRating = hoverRating || rating;

  // Generate unique ID for gradient definitions
  const gradientId = `star-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(maxRating)].map((_, index) => {
        const value = index + 1;
        // Calculate fill percentage for this star
        let fillPercent = 0;
        if (displayRating >= value) {
          fillPercent = 100;
        } else if (displayRating > value - 1) {
          fillPercent = (displayRating - (value - 1)) * 100;
        }

        const starGradientId = `${gradientId}-${index}`;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(value)}
            onMouseEnter={() => interactive && setHoverRating(value)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} focus:outline-none transition-transform`}
          >
            <svg
              className={sizeClasses[size]}
              viewBox="0 0 24 24"
              stroke={fillPercent > 0 ? '#facc15' : '#6b7280'}
              strokeWidth={1.5}
            >
              <defs>
                <linearGradient id={starGradientId}>
                  <stop offset={`${fillPercent}%`} stopColor="#facc15" />
                  <stop offset={`${fillPercent}%`} stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={`url(#${starGradientId})`}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        );
      })}
      {showValue && rating > 0 && (
        <span className="ml-1.5 text-sm font-medium text-cream-100">
          {rating.toFixed(2)}/{maxRating}
        </span>
      )}
    </div>
  );
}
