'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { Drink } from '@/types';

interface Pub {
  id: string;
  name: string;
  slug: string;
}

interface AdminDealCreatorProps {
  pubs: Pub[];
  drinks: Drink[];
}

type DealType = 'drink_only' | 'food_combo' | 'food_only';
type DealTarget = 'specific' | 'all_pints' | 'all_drinks';

interface DealFormData {
  pub_id: string;
  drink_ids: number[];
  price: string;
  deal_type: DealType;
  deal_target: DealTarget;
  deal_title: string;
  deal_description: string;
  food_item: string;
  deal_schedule: string;
  deal_start_date: string;
  deal_end_date: string;
}

const initialFormData: DealFormData = {
  pub_id: '',
  drink_ids: [],
  price: '',
  deal_type: 'drink_only',
  deal_target: 'specific',
  deal_title: '',
  deal_description: '',
  food_item: '',
  deal_schedule: '',
  deal_start_date: '',
  deal_end_date: '',
};

export default function AdminDealCreator({ pubs, drinks }: AdminDealCreatorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<DealFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleDrinkToggle = (drinkId: number) => {
    setFormData(prev => ({
      ...prev,
      drink_ids: prev.drink_ids.includes(drinkId)
        ? prev.drink_ids.filter(id => id !== drinkId)
        : [...prev.drink_ids, drinkId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in');
      setIsSubmitting(false);
      return;
    }

    if (!formData.pub_id) {
      setError('Please select a pub');
      setIsSubmitting(false);
      return;
    }

    // Validate drink selection for specific target
    if (formData.deal_type !== 'food_only' && formData.deal_target === 'specific' && formData.drink_ids.length === 0) {
      setError('Please select at least one drink');
      setIsSubmitting(false);
      return;
    }

    // Determine drink_id and drink_ids based on selection
    const shouldHaveDrinks = formData.deal_type !== 'food_only' && formData.deal_target === 'specific';
    const drinkId = shouldHaveDrinks && formData.drink_ids.length === 1 ? formData.drink_ids[0] : null;
    const drinkIds = shouldHaveDrinks && formData.drink_ids.length > 1 ? formData.drink_ids : null;

    const dealData = {
      pub_id: formData.pub_id,
      drink_id: drinkId,
      drink_ids: drinkIds,
      price: parseFloat(formData.price),
      is_deal: true,
      deal_type: formData.deal_type,
      deal_target: formData.deal_type !== 'food_only' ? formData.deal_target : null,
      deal_title: formData.deal_title || null,
      deal_description: formData.deal_description || null,
      food_item: formData.deal_type !== 'drink_only' ? formData.food_item || null : null,
      deal_schedule: formData.deal_schedule || null,
      deal_start_date: formData.deal_start_date || null,
      deal_end_date: formData.deal_end_date || null,
      submitted_by: user.id,
    };

    const { error: insertError } = await supabase
      .from('prices')
      .insert(dealData);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setFormData(initialFormData);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        router.refresh();
      }, 1500);
    }

    setIsSubmitting(false);
  };

  const selectedPub = pubs.find(p => p.id === formData.pub_id);

  // Group drinks by category
  const drinksByCategory = drinks.reduce((acc, drink) => {
    if (!acc[drink.category]) acc[drink.category] = [];
    acc[drink.category].push(drink);
    return acc;
  }, {} as Record<string, Drink[]>);

  return (
    <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-cream-100">Create New Deal</h2>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
          >
            + New Deal
          </button>
        )}
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/20 border border-green-500 text-green-400 text-sm rounded-lg">
              Deal created successfully!
            </div>
          )}

          {/* Pub Selection */}
          <div>
            <label className="block text-sm text-stout-400 mb-1">Select Pub *</label>
            <select
              value={formData.pub_id}
              onChange={(e) => setFormData(prev => ({ ...prev, pub_id: e.target.value }))}
              required
              className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-amber-500"
            >
              <option value="">Choose a pub...</option>
              {pubs.map((pub) => (
                <option key={pub.id} value={pub.id}>{pub.name}</option>
              ))}
            </select>
            {selectedPub && (
              <p className="text-xs text-stout-400 mt-1">
                <a href={`/pubs/${selectedPub.slug}`} target="_blank" rel="noopener noreferrer" className="text-irish-green-500 hover:text-irish-green-400">
                  View pub page →
                </a>
              </p>
            )}
          </div>

          {/* Deal Type */}
          <div>
            <label className="block text-sm text-stout-400 mb-1">Deal Type</label>
            <select
              value={formData.deal_type}
              onChange={(e) => setFormData(prev => ({ ...prev, deal_type: e.target.value as DealType }))}
              className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-amber-500"
            >
              <option value="drink_only">Drink Only</option>
              <option value="food_combo">Food + Drink Combo</option>
              <option value="food_only">Food Only</option>
            </select>
          </div>

          {/* Deal Title */}
          <div>
            <label className="block text-sm text-stout-400 mb-1">Deal Title (optional)</label>
            <input
              type="text"
              value={formData.deal_title}
              onChange={(e) => setFormData(prev => ({ ...prev, deal_title: e.target.value }))}
              placeholder="e.g., Happy Hour, Lunch Special"
              className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Drink Selection */}
          {formData.deal_type !== 'food_only' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-stout-400 mb-1">Applies To</label>
                <select
                  value={formData.deal_target}
                  onChange={(e) => setFormData(prev => ({ ...prev, deal_target: e.target.value as DealTarget, drink_ids: [] }))}
                  className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="specific">Specific Drinks</option>
                  <option value="all_pints">All Pints</option>
                  <option value="all_drinks">All Drinks</option>
                </select>
              </div>

              {formData.deal_target === 'specific' && (
                <div>
                  <label className="block text-sm text-stout-400 mb-2">
                    Select Drinks * <span className="text-stout-500">(click to select multiple)</span>
                  </label>
                  <div className="bg-stout-700 border border-stout-600 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {Object.entries(drinksByCategory).map(([category, categoryDrinks]) => (
                      <div key={category} className="mb-3 last:mb-0">
                        <p className="text-xs text-stout-400 uppercase tracking-wide mb-1">{category}</p>
                        <div className="flex flex-wrap gap-2">
                          {categoryDrinks.map((drink) => (
                            <button
                              key={drink.id}
                              type="button"
                              onClick={() => handleDrinkToggle(drink.id)}
                              className={`px-2 py-1 text-sm rounded transition-colors ${
                                formData.drink_ids.includes(drink.id)
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-stout-600 text-stout-300 hover:bg-stout-500'
                              }`}
                            >
                              {drink.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.drink_ids.length > 0 && (
                    <p className="text-xs text-amber-400 mt-1">
                      {formData.drink_ids.length} drink{formData.drink_ids.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Food Item */}
          {formData.deal_type !== 'drink_only' && (
            <div>
              <label className="block text-sm text-stout-400 mb-1">Food Item *</label>
              <input
                type="text"
                value={formData.food_item}
                onChange={(e) => setFormData(prev => ({ ...prev, food_item: e.target.value }))}
                placeholder="e.g., Toastie, Carvery"
                required
                className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Price */}
          <div>
            <label className="block text-sm text-stout-400 mb-1">Deal Price *</label>
            <div className="flex items-center gap-2">
              <span className="text-stout-400">&euro;</span>
              <input
                type="number"
                step="0.10"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
                className="flex-1 px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-stout-400 mb-1">Description (optional)</label>
            <input
              type="text"
              value={formData.deal_description}
              onChange={(e) => setFormData(prev => ({ ...prev, deal_description: e.target.value }))}
              placeholder="Additional details about the deal"
              className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm text-stout-400 mb-1">Schedule (optional)</label>
            <input
              type="text"
              value={formData.deal_schedule}
              onChange={(e) => setFormData(prev => ({ ...prev, deal_schedule: e.target.value }))}
              placeholder="e.g., Mon-Fri 4-7pm, Weekends only"
              className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-stout-400 mb-1">Start Date (optional)</label>
              <input
                type="date"
                value={formData.deal_start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, deal_start_date: e.target.value }))}
                className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm text-stout-400 mb-1">End Date (optional)</label>
              <input
                type="date"
                value={formData.deal_end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, deal_end_date: e.target.value }))}
                className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Deal'}
            </button>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setFormData(initialFormData); setError(null); }}
              className="px-6 py-2 bg-stout-700 text-stout-300 rounded-lg hover:bg-stout-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!isOpen && (
        <p className="text-stout-400 text-sm">
          Create deals for any pub from here, or manage deals on individual pub pages.
        </p>
      )}
    </div>
  );
}
