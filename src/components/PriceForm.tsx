'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { Drink, FoodItem } from '@/types';

interface PriceFormProps {
  pubId: string;
  onSuccess?: () => void;
}

export default function PriceForm({ pubId, onSuccess }: PriceFormProps) {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<number | null>(null);
  const [price, setPrice] = useState('');
  const [isDeal, setIsDeal] = useState(false);
  const [dealType, setDealType] = useState<'drink_only' | 'food_combo' | 'food_only'>('drink_only');
  const [dealTitle, setDealTitle] = useState('');
  const [foodItem, setFoodItem] = useState('');
  const [dealDescription, setDealDescription] = useState('');
  const [dealSchedule, setDealSchedule] = useState('');
  const [dealStartDate, setDealStartDate] = useState('');
  const [dealEndDate, setDealEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const [drinksRes, foodRes] = await Promise.all([
        supabase.from('drinks').select('*').order('name'),
        supabase.from('food_items').select('*').order('name'),
      ]);
      if (drinksRes.data) setDrinks(drinksRes.data);
      if (foodRes.data) setFoodItems(foodRes.data);
    };
    fetchData();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation depends on deal type
    if (isDeal && dealType === 'food_only') {
      if (!foodItem || !price) {
        setError('Please enter a food item and price for food-only deals');
        return;
      }
    } else {
      if (!selectedDrink || !price) {
        setError('Please select a drink and enter a price');
        return;
      }
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
        drink_id: dealType === 'food_only' ? null : selectedDrink,
        price: priceNum,
        is_deal: isDeal,
        deal_type: isDeal ? dealType : 'drink_only',
        deal_title: isDeal && dealTitle ? dealTitle : null,
        food_item: isDeal && (dealType === 'food_combo' || dealType === 'food_only') ? foodItem : null,
        deal_description: isDeal ? dealDescription : null,
        deal_schedule: isDeal && dealSchedule ? dealSchedule : null,
        deal_start_date: isDeal && dealStartDate ? dealStartDate : null,
        deal_end_date: isDeal && dealEndDate ? dealEndDate : null,
        submitted_by: user.id,
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setSelectedDrink(null);
      setPrice('');
      setIsDeal(false);
      setDealType('drink_only');
      setDealTitle('');
      setFoodItem('');
      setDealDescription('');
      setDealSchedule('');
      setDealStartDate('');
      setDealEndDate('');

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

      {/* Only show drink selection for non-food-only deals */}
      {!(isDeal && dealType === 'food_only') && (
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
      )}

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
        <div className="space-y-4 p-4 bg-stout-700/50 rounded-lg border border-amber-700/30">
          {/* Deal Type Selection */}
          <div>
            <label className="block text-sm font-medium text-cream-100 mb-2">
              Deal Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setDealType('drink_only'); setFoodItem(''); }}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  dealType === 'drink_only'
                    ? 'bg-irish-green-600 border-irish-green-500 text-white'
                    : 'bg-stout-700 border-stout-600 text-stout-200 hover:border-stout-500'
                }`}
              >
                Drink
              </button>
              <button
                type="button"
                onClick={() => setDealType('food_combo')}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  dealType === 'food_combo'
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-stout-700 border-stout-600 text-stout-200 hover:border-stout-500'
                }`}
              >
                Combo
              </button>
              <button
                type="button"
                onClick={() => { setDealType('food_only'); setSelectedDrink(null); }}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                  dealType === 'food_only'
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-stout-700 border-stout-600 text-stout-200 hover:border-stout-500'
                }`}
              >
                Food
              </button>
            </div>
          </div>

          {/* Deal Title */}
          <div>
            <label htmlFor="dealTitle" className="block text-sm font-medium text-cream-100 mb-2">
              Deal Title
            </label>
            <input
              type="text"
              id="dealTitle"
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              placeholder="e.g., Happy Hour Special, Lunch Deal"
              className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
            />
          </div>

          {/* Food Item Selection (for combo and food-only deals) */}
          {(dealType === 'food_combo' || dealType === 'food_only') && (
            <div>
              <label htmlFor="foodItem" className="block text-sm font-medium text-cream-100 mb-2">
                Food Item {dealType === 'food_only' && <span className="text-red-400">*</span>}
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {foodItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFoodItem(item.name)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        foodItem === item.name
                          ? 'bg-amber-600 text-white'
                          : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  id="foodItem"
                  value={foodItem}
                  onChange={(e) => setFoodItem(e.target.value)}
                  placeholder="Or type a custom food item..."
                  className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
                />
              </div>
            </div>
          )}

          {/* Deal Description */}
          <div>
            <label htmlFor="dealDescription" className="block text-sm font-medium text-cream-100 mb-2">
              Description
            </label>
            <input
              type="text"
              id="dealDescription"
              value={dealDescription}
              onChange={(e) => setDealDescription(e.target.value)}
              placeholder="Additional details about the deal..."
              className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
            />
          </div>

          {/* Schedule */}
          <div>
            <label htmlFor="dealSchedule" className="block text-sm font-medium text-cream-100 mb-2">
              Schedule (optional)
            </label>
            <input
              type="text"
              id="dealSchedule"
              value={dealSchedule}
              onChange={(e) => setDealSchedule(e.target.value)}
              placeholder="e.g., Mon-Fri 5-7pm, Weekends only"
              className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dealStartDate" className="block text-sm font-medium text-cream-100 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="dealStartDate"
                value={dealStartDate}
                onChange={(e) => setDealStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
              />
            </div>
            <div>
              <label htmlFor="dealEndDate" className="block text-sm font-medium text-cream-100 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="dealEndDate"
                value={dealEndDate}
                onChange={(e) => setDealEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
              />
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={
          isSubmitting ||
          !price ||
          (isDeal && dealType === 'food_only' ? !foodItem : !selectedDrink)
        }
        className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isSubmitting ? 'Submitting...' : isDeal ? 'Submit Deal' : 'Submit Price'}
      </button>
    </form>
  );
}
