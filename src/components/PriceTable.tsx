'use client';

import { useState } from 'react';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import type { Price } from '@/types';

interface PriceTableProps {
  prices: Price[];
  showPubName?: boolean;
  userId?: string;
}

export default function PriceTable({ prices, showPubName = false, userId }: PriceTableProps) {
  const [votingStates, setVotingStates] = useState<Record<string, 'up' | 'down' | null>>({});
  const supabase = createClient();

  const handleVote = async (priceId: string, voteType: 'up' | 'down') => {
    if (!userId) return;

    const currentVote = votingStates[priceId];

    try {
      if (currentVote === voteType) {
        // Remove vote
        await supabase
          .from('price_votes')
          .delete()
          .eq('price_id', priceId)
          .eq('user_id', userId);
        setVotingStates((prev) => ({ ...prev, [priceId]: null }));
      } else {
        // Upsert vote
        await supabase
          .from('price_votes')
          .upsert({
            price_id: priceId,
            user_id: userId,
            vote_type: voteType,
          });
        setVotingStates((prev) => ({ ...prev, [priceId]: voteType }));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  // Group prices by drink
  const pricesByDrink = prices.reduce((acc, price) => {
    const drinkName = price.drink?.name || 'Unknown';
    if (!acc[drinkName]) {
      acc[drinkName] = [];
    }
    acc[drinkName].push(price);
    return acc;
  }, {} as Record<string, Price[]>);

  if (prices.length === 0) {
    return (
      <div className="text-center py-8 text-stout-400">
        <p>No prices submitted yet.</p>
        <p className="text-sm mt-1">Be the first to add a price!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(pricesByDrink).map(([drinkName, drinkPrices]) => {
        // Get the most recent price for each drink
        const latestPrice = drinkPrices.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        return (
          <div key={drinkName} className="bg-stout-800 rounded-lg border border-stout-700 overflow-hidden">
            <div className="px-4 py-3 bg-stout-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-cream-100 font-medium">{drinkName}</span>
                {latestPrice.drink?.category === 'cider' && (
                  <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded">Cider</span>
                )}
              </div>
              <span className="text-2xl font-bold text-irish-green-500">
                {formatPrice(latestPrice.price)}
              </span>
            </div>

            <div className="divide-y divide-stout-700">
              {drinkPrices.slice(0, 3).map((price) => (
                <div key={price.id} className="px-4 py-3 flex justify-between items-center">
                  <div className="flex-1">
                    {showPubName && price.pub && (
                      <p className="text-cream-100 font-medium">{price.pub.name}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-stout-400">
                      <span>{formatRelativeTime(price.created_at)}</span>
                      {price.verified && (
                        <span className="text-irish-green-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                      {price.is_deal && (
                        <span className="text-amber-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                          </svg>
                          Deal
                        </span>
                      )}
                    </div>
                    {price.deal_description && (
                      <p className="text-sm text-amber-400 mt-1">{price.deal_description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-cream-100">
                      {formatPrice(price.price)}
                    </span>

                    {/* Voting buttons */}
                    {userId && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleVote(price.id, 'up')}
                          className={`p-1 rounded transition-colors ${
                            votingStates[price.id] === 'up'
                              ? 'text-irish-green-500 bg-irish-green-500/20'
                              : 'text-stout-400 hover:text-irish-green-500'
                          }`}
                          title="Confirm this price"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <span className="text-sm text-stout-400 min-w-[2rem] text-center">
                          {price.upvotes - price.downvotes}
                        </span>
                        <button
                          onClick={() => handleVote(price.id, 'down')}
                          className={`p-1 rounded transition-colors ${
                            votingStates[price.id] === 'down'
                              ? 'text-red-500 bg-red-500/20'
                              : 'text-stout-400 hover:text-red-500'
                          }`}
                          title="Report incorrect price"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
