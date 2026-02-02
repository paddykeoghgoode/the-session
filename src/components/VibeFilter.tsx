'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { VIBE_CATEGORIES, VIBE_ICONS } from '@/types';

interface VibeFilterProps {
  selectedVibes: string[];
  onVibesChange: (vibes: string[]) => void;
  pubId?: string; // If provided, show vibes for a specific pub
}

interface PubVibeData {
  vibe: string;
  vote_count: number;
}

export default function VibeFilter({ selectedVibes, onVibesChange, pubId }: VibeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pubVibes, setPubVibes] = useState<PubVibeData[]>([]);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // Load pub vibes if pubId is provided
  useEffect(() => {
    if (!pubId) return;

    async function loadPubVibes() {
      setLoading(true);
      const { data } = await supabase
        .from('pub_vibes')
        .select('vibe, vote_count')
        .eq('pub_id', pubId)
        .order('vote_count', { ascending: false })
        .limit(10);

      if (data) {
        setPubVibes(data);
      }
      setLoading(false);
    }

    loadPubVibes();
  }, [pubId, supabase]);

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      onVibesChange(selectedVibes.filter(v => v !== vibe));
    } else {
      onVibesChange([...selectedVibes, vibe]);
    }
  };

  const clearAll = () => {
    onVibesChange([]);
  };

  // If viewing a specific pub, show its vibes
  if (pubId) {
    return (
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
        <h3 className="text-sm font-semibold text-cream-100 mb-3">Pub Vibes</h3>

        {loading ? (
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-7 w-20 bg-stout-700 rounded-full animate-pulse" />
            ))}
          </div>
        ) : pubVibes.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {pubVibes.map(({ vibe, vote_count }) => (
              <span
                key={vibe}
                className="inline-flex items-center gap-1 px-3 py-1 bg-stout-700 text-cream-100 rounded-full text-sm"
              >
                <span>{VIBE_ICONS[vibe] || '✨'}</span>
                <span className="capitalize">{vibe.replace('-', ' ')}</span>
                {vote_count > 1 && (
                  <span className="text-xs text-stout-400">+{vote_count - 1}</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stout-400">No vibes added yet</p>
        )}
      </div>
    );
  }

  // Filter mode - for searching pubs by vibe
  return (
    <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-cream-100">Filter by Vibe</h3>
        <div className="flex items-center gap-2">
          {selectedVibes.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-stout-400 hover:text-cream-100"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-stout-400 hover:text-cream-100"
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Selected vibes preview */}
      {selectedVibes.length > 0 && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {selectedVibes.map(vibe => (
            <button
              key={vibe}
              onClick={() => toggleVibe(vibe)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-irish-green-600 text-white rounded-full text-sm"
            >
              <span>{VIBE_ICONS[vibe] || '✨'}</span>
              <span className="capitalize">{vibe.replace('-', ' ')}</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Expanded vibe categories */}
      {isExpanded && (
        <div className="space-y-4">
          {Object.entries(VIBE_CATEGORIES).map(([category, { label, vibes }]) => (
            <div key={category}>
              <h4 className="text-xs font-medium text-stout-400 mb-2">{label}</h4>
              <div className="flex flex-wrap gap-2">
                {vibes.map(vibe => {
                  const isSelected = selectedVibes.includes(vibe);
                  return (
                    <button
                      key={vibe}
                      onClick={() => toggleVibe(vibe)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                        isSelected
                          ? 'bg-irish-green-600 text-white'
                          : 'bg-stout-700 text-stout-300 hover:bg-stout-600 hover:text-cream-100'
                      }`}
                    >
                      <span>{VIBE_ICONS[vibe] || '✨'}</span>
                      <span className="capitalize">{vibe.replace('-', ' ')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Component for adding vibes to a pub
interface AddVibeProps {
  pubId: string;
  userId?: string;
}

export function AddVibe({ pubId, userId }: AddVibeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [existingVibes, setExistingVibes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!isOpen) return;

    async function loadExisting() {
      const { data } = await supabase
        .from('pub_vibes')
        .select('vibe')
        .eq('pub_id', pubId);

      if (data) {
        setExistingVibes(data.map((v: { vibe: string }) => v.vibe));
      }
    }

    loadExisting();
  }, [isOpen, pubId, supabase]);

  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter(v => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  const handleSubmit = async () => {
    if (!userId || selectedVibes.length === 0) return;

    setLoading(true);

    try {
      // Add new vibes
      const newVibes = selectedVibes.filter(v => !existingVibes.includes(v));
      const existingToVote = selectedVibes.filter(v => existingVibes.includes(v));

      // Insert new vibes
      if (newVibes.length > 0) {
        await supabase.from('pub_vibes').insert(
          newVibes.map(vibe => ({
            pub_id: pubId,
            user_id: userId,
            vibe,
            vote_count: 1,
          }))
        );
      }

      // Increment vote count for existing vibes
      for (const vibe of existingToVote) {
        await supabase.rpc('increment_vibe_count', { p_pub_id: pubId, p_vibe: vibe });
      }

      // Record user votes
      await supabase.from('pub_vibe_votes').insert(
        selectedVibes.map(vibe => ({
          pub_id: pubId,
          user_id: userId,
          vibe,
          vote: true,
        }))
      );

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSelectedVibes([]);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to add vibes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-irish-green-500 hover:text-irish-green-400"
      >
        + Add vibes
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stout-800 rounded-lg border border-stout-700 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-stout-700">
              <h2 className="text-lg font-semibold text-cream-100">Add Vibes</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stout-400 hover:text-cream-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-stout-400">
                What's the vibe like at this pub?
              </p>

              {Object.entries(VIBE_CATEGORIES).map(([category, { label, vibes }]) => (
                <div key={category}>
                  <h4 className="text-xs font-medium text-stout-400 mb-2">{label}</h4>
                  <div className="flex flex-wrap gap-2">
                    {vibes.map(vibe => {
                      const isSelected = selectedVibes.includes(vibe);
                      const isExisting = existingVibes.includes(vibe);
                      return (
                        <button
                          key={vibe}
                          onClick={() => toggleVibe(vibe)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                            isSelected
                              ? 'bg-irish-green-600 text-white'
                              : isExisting
                                ? 'bg-stout-600 text-stout-300 border border-stout-500'
                                : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
                          }`}
                        >
                          <span>{VIBE_ICONS[vibe] || '✨'}</span>
                          <span className="capitalize">{vibe.replace('-', ' ')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {success && (
                <p className="text-sm text-green-400 text-center">Vibes added!</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || selectedVibes.length === 0}
                className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Adding...' : `Add ${selectedVibes.length} Vibe${selectedVibes.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
