'use client';

import { useState } from 'react';
import { useOptimisticLike } from '@/hooks/useOptimistic';

interface LikeButtonProps {
  initialLiked: boolean;
  initialCount: number;
  onToggle: (liked: boolean) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  variant?: 'heart' | 'star';
  className?: string;
}

export default function LikeButton({
  initialLiked,
  initialCount,
  onToggle,
  size = 'md',
  showCount = true,
  variant = 'heart',
  className = '',
}: LikeButtonProps) {
  const { liked, count, toggle, isUpdating } = useOptimisticLike(initialLiked, initialCount, onToggle);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handleClick = async () => {
    setIsAnimating(true);
    await toggle();
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isUpdating}
      className={`flex items-center gap-2 transition-all ${
        liked ? 'text-red-500' : 'text-stout-400 hover:text-cream-100'
      } ${isAnimating ? 'scale-125' : 'scale-100'} ${className}`}
      aria-label={liked ? 'Unlike' : 'Like'}
      aria-pressed={liked}
    >
      {variant === 'heart' ? (
        <svg
          className={`${sizeClasses[size]} transition-all ${isAnimating ? 'animate-heart-beat' : ''}`}
          fill={liked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={liked ? 0 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ) : (
        <svg
          className={`${sizeClasses[size]} transition-all ${
            isAnimating ? 'animate-star-pop' : ''
          } ${liked ? 'fill-yellow-400' : ''}`}
          fill={liked ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={liked ? 0 : 2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}

      {showCount && (
        <span className={`font-medium ${textSizeClasses[size]}`}>
          {count > 0 ? count.toLocaleString() : ''}
        </span>
      )}
    </button>
  );
}
