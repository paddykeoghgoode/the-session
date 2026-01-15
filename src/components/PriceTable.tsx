'use client';

import { useState } from 'react';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import type { Price, Drink } from '@/types';

interface PriceTableProps {
  prices: Price[];
  showPubName?: boolean;
  userId?: string;
  pubId?: string;
  drinks?: Drink[];
}

export default function PriceTable({ prices, showPubName = false, userId, pubId, drinks = [] }: PriceTableProps) {
  const [votingStates, setVotingStates] = useState<Record<string, 'up' | 'down' | null>>({});
  const [expandedDrink, setExpandedDrink] = useState<string | null>(null);
  const [inlinePrice, setInlinePrice] = useState('');
  const [inlineIsDeal, setInlineIsDeal] = useState(false);
  const [inlineDealDesc, setInlineDealDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const supabase = createClient();

  const handleInlineSubmit = async (drinkId: number, drinkName: string) => {
    if (!userId || !pubId || !inlinePrice) return;

    const priceNum = parseFloat(inlinePrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('prices').insert({
        pub_id: pubId,
        drink_id: drinkId,
        price: priceNum,
        is_deal: inlineIsDeal,
        deal_description: inlineIsDeal ? inlineDealDesc : null,
        submitted_by: userId,
      });

      if (error) throw error;

      setSubmitSuccess(drinkName);
      setExpandedDrink(null);
      setInlinePrice('');
      setInlineIsDeal(false);
      setInlineDealDesc('');

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitSuccess(null), 3000);

      // Refresh the page to show updated prices
      window.location.reload();
    } catch (err) {
      console.error('Error submitting price:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Get drinks that don't have prices yet
  const drinksWithoutPrices = drinks.filter(
    (drink) => !pricesByDrink[drink.name]
  );

  if (prices.length === 0 && drinksWithoutPrices.length === 0) {
    return (
      <div className="text-center py-8 text-stout-400">
        <p>No prices submitted yet.</p>
        <p className="text-sm mt-1">Be the first to add a price!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success toast */}
      {submitSuccess && (
        <div className="bg-irish-green-500/10 border border-irish-green-500 text-irish-green-400 px-4 py-3 rounded flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Price for {submitSuccess} submitted! Thanks for contributing.
        </div>
      )}

      {/* Drinks with prices */}
      {Object.entries(pricesByDrink).map(([drinkName, drinkPrices]) => {
        // Get the most recent price for each drink
        const latestPrice = drinkPrices.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        const drinkId = latestPrice.drink?.id;
        const isExpanded = expandedDrink === drinkName;

        return (
          <div key={drinkName} className="bg-stout-800 rounded-lg border border-stout-700 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                if (userId && pubId) {
                  setExpandedDrink(isExpanded ? null : drinkName);
                  setInlinePrice('');
                  setInlineIsDeal(false);
                  setInlineDealDesc('');
                }
              }}
              className={`w-full px-4 py-3 bg-stout-700 flex justify-between items-center ${
                userId && pubId ? 'hover:bg-stout-600 cursor-pointer' : ''
              } transition-colors`}
            >
              <div className="flex items-center gap-2">
                <span className="text-cream-100 font-medium">{drinkName}</span>
                {latestPrice.drink?.category === 'cider' && (
                  <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded">Cider</span>
                )}
                {userId && pubId && (
                  <span className="text-xs text-stout-400 ml-2">
                    {isExpanded ? '(click to close)' : '(click to add price)'}
                  </span>
                )}
              </div>
              <span className="text-2xl font-bold text-irish-green-500">
                {formatPrice(latestPrice.price)}
              </span>
            </button>

            {/* Inline price entry form */}
            {isExpanded && userId && pubId && drinkId && (
              <div className="px-4 py-3 bg-stout-750 border-t border-stout-600">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs text-stout-400 mb-1">Price</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stout-400 text-sm">&euro;</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={inlinePrice}
                        onChange={(e) => setInlinePrice(e.target.value)}
                        placeholder="6.50"
                        className="w-full pl-6 pr-2 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 placeholder-stout-500 text-sm focus:outline-none focus:border-irish-green-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={inlineIsDeal}
                      onChange={(e) => setInlineIsDeal(e.target.checked)}
                      className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
                    />
                    <span className="text-sm text-stout-300">Deal?</span>
                  </label>
                  {inlineIsDeal && (
                    <div className="flex-1 min-w-[150px]">
                      <input
                        type="text"
                        value={inlineDealDesc}
                        onChange={(e) => setInlineDealDesc(e.target.value)}
                        placeholder="e.g., Happy Hour"
                        className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 placeholder-stout-500 text-sm focus:outline-none focus:border-irish-green-500"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleInlineSubmit(drinkId, drinkName)}
                    disabled={isSubmitting || !inlinePrice}
                    className="px-4 py-2 bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                  >
                    {isSubmitting ? 'Saving...' : 'Add'}
                  </button>
                </div>
              </div>
            )}

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

      {/* Drinks without prices - show only if user is logged in and we have pubId */}
      {userId && pubId && drinksWithoutPrices.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-stout-400 mb-3">Add prices for other drinks:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {drinksWithoutPrices.map((drink) => {
              const isExpanded = expandedDrink === `new-${drink.name}`;

              return (
                <div key={drink.id} className="bg-stout-800 rounded-lg border border-stout-700 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setExpandedDrink(isExpanded ? null : `new-${drink.name}`);
                      setInlinePrice('');
                      setInlineIsDeal(false);
                      setInlineDealDesc('');
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-stout-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-cream-100 text-sm">{drink.name}</span>
                      {drink.category === 'cider' && (
                        <span className="text-xs bg-amber-600 text-white px-1.5 py-0.5 rounded">Cider</span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-stout-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-3 py-2 bg-stout-750 border-t border-stout-600">
                      <div className="space-y-2">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stout-400 text-sm">&euro;</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={inlinePrice}
                            onChange={(e) => setInlinePrice(e.target.value)}
                            placeholder="Price"
                            className="w-full pl-6 pr-2 py-1.5 bg-stout-700 border border-stout-600 rounded text-cream-100 placeholder-stout-500 text-sm focus:outline-none focus:border-irish-green-500"
                            autoFocus
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInlineSubmit(drink.id, drink.name)}
                          disabled={isSubmitting || !inlinePrice}
                          className="w-full px-3 py-1.5 bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                        >
                          {isSubmitting ? 'Saving...' : 'Add Price'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
