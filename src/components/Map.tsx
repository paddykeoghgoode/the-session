'use client';

import { useEffect, useState, useRef } from 'react';
import type { Pub } from '@/types';
import { formatPrice } from '@/lib/utils';

// Dynamic import for Leaflet (client-side only)
import dynamic from 'next/dynamic';

interface MapProps {
  pubs: Pub[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPubSelect?: (pub: Pub) => void;
  showUserLocation?: boolean;
  radiusKm?: number;
}

// We need to create a separate component that uses Leaflet
// because Leaflet doesn't support SSR
const MapContent = dynamic(() => import('./MapContent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-stout-800 rounded-lg flex items-center justify-center">
      <div className="text-stout-400">Loading map...</div>
    </div>
  ),
});

export default function Map(props: MapProps) {
  return <MapContent {...props} />;
}
