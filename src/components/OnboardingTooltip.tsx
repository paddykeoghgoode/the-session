'use client';

import { useState, useEffect, ReactNode } from 'react';

interface OnboardingTooltipProps {
  id: string;
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export default function OnboardingTooltip({
  id,
  children,
  content,
  position = 'bottom',
  delay = 500,
}: OnboardingTooltipProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(`tooltip-${id}`);
    if (!seen) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [id, delay]);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(`tooltip-${id}`, 'seen');
  };

  if (!show) return <>{children}</>;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-irish-green-600',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-irish-green-600',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-irish-green-600',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-irish-green-600',
  };

  return (
    <div className="relative inline-block">
      {children}

      {/* Tooltip */}
      <div className={`absolute z-50 ${positionClasses[position]}`}>
        <div className="bg-irish-green-600 text-white px-4 py-3 rounded-lg shadow-xl max-w-xs animate-scale-in">
          <div className="text-sm leading-relaxed mb-2">{content}</div>
          <button
            onClick={dismiss}
            className="text-xs underline hover:no-underline font-medium"
          >
            Got it!
          </button>
        </div>
        {/* Arrow */}
        <div
          className={`absolute w-0 h-0 border-8 border-transparent ${arrowClasses[position]}`}
        />
      </div>

      {/* Backdrop highlight */}
      <div className="absolute inset-0 rounded-lg ring-2 ring-irish-green-500 ring-offset-2 ring-offset-stout-950 animate-pulse pointer-events-none" />
    </div>
  );
}

// Preset tooltips for common features
export function SubmitPriceTooltip({ children }: { children: ReactNode }) {
  return (
    <OnboardingTooltip
      id="submit-price"
      content={
        <>
          <strong>Submit your first price</strong> and earn 5 points! Points help you climb the
          leaderboard and unlock rewards.
        </>
      }
    >
      {children}
    </OnboardingTooltip>
  );
}

export function FilterTooltip({ children }: { children: ReactNode }) {
  return (
    <OnboardingTooltip
      id="filter-chips"
      content={
        <>
          <strong>Tap to filter pubs</strong> by amenities like WiFi, outdoor seating, or live
          music. Select multiple filters at once!
        </>
      }
      position="bottom"
    >
      {children}
    </OnboardingTooltip>
  );
}

export function NearMeTooltip({ children }: { children: ReactNode }) {
  return (
    <OnboardingTooltip
      id="near-me"
      content={
        <>
          <strong>Find pubs near you</strong> using your location. We'll show you the closest pubs
          with live prices and reviews.
        </>
      }
      position="bottom"
    >
      {children}
    </OnboardingTooltip>
  );
}

export function VerifyTooltip({ children }: { children: ReactNode }) {
  return (
    <OnboardingTooltip
      id="verify-price"
      content={
        <>
          <strong>Verify prices</strong> to help keep the community accurate! Earn 2 points for
          each verification.
        </>
      }
      position="top"
    >
      {children}
    </OnboardingTooltip>
  );
}

export function LeaderboardTooltip({ children }: { children: ReactNode }) {
  return (
    <OnboardingTooltip
      id="leaderboard"
      content={
        <>
          <strong>Compete for monthly prizes!</strong> Top contributors win pub vouchers and
          premium membership.
        </>
      }
      position="bottom"
    >
      {children}
    </OnboardingTooltip>
  );
}
