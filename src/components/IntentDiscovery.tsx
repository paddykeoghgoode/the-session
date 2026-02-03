'use client';

import { useState } from 'react';
import { PUB_INTENTS, type PubIntent } from '@/types';

interface IntentDiscoveryProps {
  onIntentSelect: (intent: PubIntent | null) => void;
  selectedIntent: PubIntent | null;
}

export default function IntentDiscovery({ onIntentSelect, selectedIntent }: IntentDiscoveryProps) {
  const [expanded, setExpanded] = useState(false);

  const popularIntents: PubIntent[] = [
    'watch-sports',
    'cheap-pints',
    'live-trad-music',
    'sunny-day',
    'first-date',
    'pub-food',
  ];

  const allIntents = Object.keys(PUB_INTENTS) as PubIntent[];

  return (
    <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-cream-100">
          🎯 What are you looking for?
        </h2>
        {selectedIntent && (
          <button
            onClick={() => onIntentSelect(null)}
            className="text-sm text-stout-400 hover:text-cream-100"
          >
            Clear
          </button>
        )}
      </div>

      {/* Popular Intents */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        {popularIntents.map((intent) => {
          const config = PUB_INTENTS[intent];
          const isSelected = selectedIntent === intent;

          return (
            <button
              key={intent}
              onClick={() => onIntentSelect(isSelected ? null : intent)}
              className={`p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-irish-green-600 border-irish-green-500 text-white'
                  : 'bg-stout-700 border-stout-600 text-cream-100 hover:border-stout-500'
              }`}
            >
              <div className="text-2xl mb-1">{config.icon}</div>
              <div className="text-xs font-medium leading-tight">
                {config.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expand to show all */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-irish-green-500 hover:text-irish-green-400 w-full text-center py-2"
      >
        {expanded ? '▲ Show Less' : `▼ Show ${allIntents.length - popularIntents.length} More Options`}
      </button>

      {/* All Intents (expanded) */}
      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3 pt-3 border-t border-stout-700">
          {allIntents
            .filter((intent) => !popularIntents.includes(intent))
            .map((intent) => {
              const config = PUB_INTENTS[intent];
              const isSelected = selectedIntent === intent;

              return (
                <button
                  key={intent}
                  onClick={() => onIntentSelect(isSelected ? null : intent)}
                  className={`p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-irish-green-600 border-irish-green-500 text-white'
                      : 'bg-stout-700 border-stout-600 text-cream-100 hover:border-stout-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{config.icon}</div>
                  <div className="text-xs font-medium leading-tight">
                    {config.label}
                  </div>
                </button>
              );
            })}
        </div>
      )}

      {/* Selected Intent Description */}
      {selectedIntent && (
        <div className="mt-4 p-3 bg-irish-green-600/10 border border-irish-green-600/30 rounded-lg">
          <p className="text-sm text-cream-100">
            <span className="font-medium">{PUB_INTENTS[selectedIntent].icon} {PUB_INTENTS[selectedIntent].label}:</span>
            {' '}
            {PUB_INTENTS[selectedIntent].description}
          </p>
        </div>
      )}
    </div>
  );
}
