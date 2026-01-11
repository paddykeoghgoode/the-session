'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Drink } from '@/types';

interface PriceFormProps {
  pubId: string;
  onSuccess?: () => void;
}

export default function PriceForm({ pubId, onSuccess }: PriceFormProps) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [isDeal, setIsDeal] = useState(false);
  const [dealDescription, setDealDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchDrinks = async () => {
      const { data } = await supabase.from('drinks').select('*').order('name');
      if (data) {
        setDrinks(data);
      }
    };
    fetchDrinks();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedDrink || !price) {
      setError('Please select a drink and enter a price');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to submit prices');
        setIsSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from('prices').insert({
        pub_id: pubId,
        drink_id: selectedDrink,
        price: priceNum,
        is_deal: isDeal,
        deal_description: isDeal ? dealDescription : null,
        submitted_by: user.id,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setSelectedDrink(null);
      setPrice('');
      setIsDeal(false);
      setDealDescription('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit price');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-irish-green-500/10 border border-irish-green-500 text-irish-green-400 px-4 py-3 rounded">
          Price submitted successfully! Thanks for contributing.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-cream-100 mb-2">
          Select Drink
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {drinks.map((drink) => (
            <button
              key={drink.id}
              type="button"
              onClick={() => setSelectedDrink(drink.id)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                selectedDrink === drink.id
                  ? 'bg-irish-green-600 border-irish-green-500 text-white'
                  : 'bg-stout-700 border-stout-600 text-stout-200 hover:border-stout-500'
              }`}
            >
              {drink.name}
              <span className="block text-xs mt-1 opacity-75">
                {drink.category === 'cider' ? 'Cider' : 'Beer'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-cream-100 mb-2">
          Price (EUR)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stout-400">
            &euro;
          </span>
          <input
            type="number"
            id="price"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="6.50"
            className="w-full pl-8 pr-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isDeal}
            onChange={(e) => setIsDeal(e.target.checked)}
            className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600 focus:ring-irish-green-500"
          />
          <span className="text-sm text-cream-100">This is a special deal/offer</span>
        </label>
      </div>

      {isDeal && (
        <div>
          <label htmlFor="dealDescription" className="block text-sm font-medium text-cream-100 mb-2">
            Deal Description
          </label>
          <input
            type="text"
            id="dealDescription"
            value={dealDescription}
            onChange={(e) => setDealDescription(e.target.value)}
            placeholder="e.g., Happy Hour 5-7pm"
            className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !selectedDrink || !price}
        className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Price'}
      </button>
    </form>
  );
}
