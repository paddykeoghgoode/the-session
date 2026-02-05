'use client';

import { useState } from 'react';

interface NearMeButtonProps {
  onLocationFound?: (coords: { latitude: number; longitude: number }) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function NearMeButton({ onLocationFound, onError, className = '' }: NearMeButtonProps) {
  const [isLocating, setIsLocating] = useState(false);

  const handleClick = () => {
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by your browser';
      onError?.(error);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        onLocationFound?.({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        setIsLocating(false);
        let errorMessage = 'Unable to get your location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        onError?.(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLocating}
      className={`w-full bg-gradient-to-r from-irish-green-600 to-irish-green-700 hover:from-irish-green-700 hover:to-irish-green-800 disabled:from-stout-700 disabled:to-stout-700 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] ${className}`}
    >
      {isLocating ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Finding your location...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Show pubs near me</span>
        </>
      )}
    </button>
  );
}
