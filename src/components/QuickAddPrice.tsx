'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { DRINKS } from '@/types';

interface QuickAddPriceProps {
  pubId: string;
  pubName: string;
  userId?: string;
}

export default function QuickAddPrice({ pubId, pubName, userId }: QuickAddPriceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [drinkId, setDrinkId] = useState<number>(1); // Default to Guinness
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase.from('prices').insert({
        pub_id: pubId,
        drink_id: drinkId,
        price: priceNum,
        submitted_by: userId,
        is_deal: false,
      });

      if (submitError) throw submitError;

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setPrice('');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit price');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Not logged in - show sign in prompt
  if (!userId) {
    return (
      <>
        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-irish-green-600 hover:bg-irish-green-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 z-40"
          aria-label="Add price"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>

        {/* Modal - Sign In Prompt */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-cream-100 mb-2">Sign in to add prices</h3>
              <p className="text-stout-400 text-sm mb-4">
                Help the community by sharing what you paid for your pint!
              </p>
              <div className="flex gap-3">
                <a
                  href="/auth/login"
                  className="flex-1 bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
                >
                  Sign In
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-stout-700 hover:bg-stout-600 text-cream-100 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-irish-green-600 hover:bg-irish-green-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 z-40 flex items-center gap-2"
        aria-label="Add price"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="hidden sm:inline font-medium pr-1">Add Price</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 max-w-sm w-full">
            {success ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-2">🍻</div>
                <p className="text-irish-green-500 font-medium">Price added! Thanks!</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-cream-100">Quick Add Price</h3>
                    <p className="text-sm text-stout-400">{pubName}</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-stout-400 hover:text-cream-100"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 px-3 py-2 rounded text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Drink Selection */}
                  <div>
                    <label className="block text-sm font-medium text-cream-100 mb-2">
                      What did you have?
                    </label>
                    <select
                      value={drinkId}
                      onChange={(e) => setDrinkId(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
                    >
                      {DRINKS.map((drink, index) => (
                        <option key={drink.name} value={index + 1}>
                          {drink.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Input */}
                  <div>
                    <label className="block text-sm font-medium text-cream-100 mb-2">
                      How much was it?
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stout-400 text-lg">
                        €
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="5.50"
                        className="w-full pl-10 pr-4 py-3 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 text-lg placeholder-stout-500 focus:outline-none focus:border-irish-green-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !price}
                    className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Price'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
