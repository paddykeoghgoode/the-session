'use client';

import { useState, useMemo } from 'react';
import type { Pub, PubIntent } from '@/types';
import IntentDiscovery from './IntentDiscovery';
import PubCard from './PubCard';
import { rankPubsByIntent } from '@/lib/intent-scoring';

interface PubsWithIntentProps {
  pubs: Pub[];
  userLatitude?: number;
  userLongitude?: number;
}

export default function PubsWithIntent({ pubs, userLatitude, userLongitude }: PubsWithIntentProps) {
  const [selectedIntent, setSelectedIntent] = useState<PubIntent | null>(null);

  const displayedPubs = useMemo(() => {
    if (!selectedIntent) return pubs;

    return rankPubsByIntent(pubs, selectedIntent, {
      userLatitude,
      userLongitude,
    });
  }, [pubs, selectedIntent, userLatitude, userLongitude]);

  return (
    <div>
      <IntentDiscovery
        selectedIntent={selectedIntent}
        onIntentSelect={setSelectedIntent}
      />

      {selectedIntent && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-stout-400 text-sm">
            Showing {displayedPubs.length} pubs ranked by relevance
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedPubs.map((pub) => (
          <PubCard key={pub.id} pub={pub} />
        ))}
      </div>

      {displayedPubs.length === 0 && (
        <div className="text-center py-12 bg-stout-800 rounded-lg border border-stout-700">
          <p className="text-stout-400 mb-2">No pubs match your search criteria</p>
          <button
            onClick={() => setSelectedIntent(null)}
            className="text-irish-green-500 hover:text-irish-green-400 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
