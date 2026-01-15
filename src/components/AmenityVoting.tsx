'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { AMENITIES, type AmenityKey, type AmenityVote, type AmenityVoteSummary } from '@/types';

interface AmenityVotingProps {
  pubId: string;
  currentValues: {
    has_food: boolean;
    has_live_music: boolean;
    shows_sports: boolean;
    has_outdoor_seating: boolean;
    has_pool: boolean;
    has_darts: boolean;
    has_board_games: boolean;
    is_speakeasy: boolean;
  };
  userId?: string;
}

export default function AmenityVoting({ pubId, currentValues, userId }: AmenityVotingProps) {
  const [votes, setVotes] = useState<Record<AmenityKey, boolean | null>>({
    has_food: null,
    has_live_music: null,
    shows_sports: null,
    has_outdoor_seating: null,
    has_pool: null,
    has_darts: null,
    has_board_games: null,
    is_speakeasy: null,
  });
  const [summaries, setSummaries] = useState<Record<AmenityKey, AmenityVoteSummary | null>>({
    has_food: null,
    has_live_music: null,
    shows_sports: null,
    has_outdoor_seating: null,
    has_pool: null,
    has_darts: null,
    has_board_games: null,
    is_speakeasy: null,
  });
  const [loading, setLoading] = useState<AmenityKey | null>(null);
  const supabase = createClient();

  // Fetch user's existing votes and vote summaries
  useEffect(() => {
    async function fetchData() {
      // Get vote summaries
      const { data: summaryData } = await supabase
        .from('pub_amenity_vote_summary')
        .select('*')
        .eq('pub_id', pubId);

      if (summaryData) {
        const summaryMap: Record<AmenityKey, AmenityVoteSummary | null> = {
          has_food: null,
          has_live_music: null,
          shows_sports: null,
          has_outdoor_seating: null,
          has_pool: null,
          has_darts: null,
          has_board_games: null,
          is_speakeasy: null,
        };
        summaryData.forEach((s) => {
          summaryMap[s.amenity as AmenityKey] = s;
        });
        setSummaries(summaryMap);
      }

      // Get user's votes if logged in
      if (userId) {
        const { data: userVotes } = await supabase
          .from('amenity_votes')
          .select('*')
          .eq('pub_id', pubId)
          .eq('user_id', userId);

        if (userVotes) {
          const voteMap: Record<AmenityKey, boolean | null> = {
            has_food: null,
            has_live_music: null,
            shows_sports: null,
            has_outdoor_seating: null,
            has_pool: null,
            has_darts: null,
            has_board_games: null,
            is_speakeasy: null,
          };
          userVotes.forEach((v) => {
            voteMap[v.amenity as AmenityKey] = v.vote;
          });
          setVotes(voteMap);
        }
      }
    }

    fetchData();
  }, [pubId, userId, supabase]);

  const handleVote = async (amenity: AmenityKey, vote: boolean) => {
    if (!userId) return;

    setLoading(amenity);

    try {
      // Upsert the vote
      const { error } = await supabase
        .from('amenity_votes')
        .upsert({
          pub_id: pubId,
          user_id: userId,
          amenity,
          vote,
        }, {
          onConflict: 'pub_id,user_id,amenity',
        });

      if (error) throw error;

      // Update local state
      setVotes((prev) => ({ ...prev, [amenity]: vote }));

      // Refresh summaries
      const { data: summaryData } = await supabase
        .from('pub_amenity_vote_summary')
        .select('*')
        .eq('pub_id', pubId)
        .eq('amenity', amenity)
        .single();

      if (summaryData) {
        setSummaries((prev) => ({ ...prev, [amenity]: summaryData }));
      }
    } catch (err) {
      console.error('Error voting:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
      <h3 className="text-lg font-semibold text-cream-100 mb-4">Pub Amenities</h3>
      <p className="text-sm text-stout-400 mb-4">
        Help confirm what this pub offers. Your votes help keep info accurate!
      </p>

      <div className="space-y-3">
        {AMENITIES.map(({ key, label, icon }) => {
          const currentValue = currentValues[key];
          const userVote = votes[key];
          const summary = summaries[key];
          const isLoading = loading === key;

          return (
            <div key={key} className="flex items-center justify-between py-2 border-b border-stout-700 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <div>
                  <span className="text-cream-100">{label}</span>
                  <div className="flex items-center gap-2 text-xs text-stout-400">
                    <span className={currentValue ? 'text-irish-green-500' : 'text-stout-500'}>
                      Currently: {currentValue ? 'Yes' : 'No'}
                    </span>
                    {summary && summary.total_votes > 0 && (
                      <span>
                        ({summary.yes_votes} yes / {summary.no_votes} no)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {userId ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleVote(key, true)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      userVote === true
                        ? 'bg-irish-green-600 text-white'
                        : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleVote(key, false)}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      userVote === false
                        ? 'bg-red-600 text-white'
                        : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    No
                  </button>
                </div>
              ) : (
                <span className="text-xs text-stout-500">Sign in to vote</span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-stout-500 mt-4">
        Amenities auto-update when 3+ people vote with majority agreement.
      </p>
    </div>
  );
}
