'use client';

import { useEffect, useState } from 'react';

interface PointsAnimationProps {
  points: number;
  onComplete?: () => void;
  duration?: number;
}

export default function PointsAnimation({ points, onComplete, duration = 1500 }: PointsAnimationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="animate-points-float">
        <span className="text-5xl font-bold text-irish-green-500 drop-shadow-lg">
          +{points}
        </span>
      </div>
    </div>
  );
}

// Hook to trigger points animation
export function usePointsAnimation() {
  const [showPoints, setShowPoints] = useState(false);
  const [points, setPoints] = useState(0);

  const trigger = (pointsEarned: number) => {
    setPoints(pointsEarned);
    setShowPoints(true);
  };

  const handleComplete = () => {
    setShowPoints(false);
  };

  return {
    showPoints,
    points,
    trigger,
    PointsComponent: showPoints ? (
      <PointsAnimation points={points} onComplete={handleComplete} />
    ) : null,
  };
}
