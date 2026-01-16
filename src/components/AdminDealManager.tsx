'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Price, Drink } from '@/types';

interface AdminDealManagerProps {
  pubId: string;
  pubName: string;
  drinks: Drink[];
  existingDeals?: Price[];
}

type DealType = 'drink_only' | 'food_combo' | 'food_only';
type DealTarget = 'specific' | 'all_pints' | 'all_drinks';

interface DealFormData {
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

export default function AdminDealManager({ pubId, pubName, drinks, existingDeals = [] }: AdminDealManagerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [deals, setDeals] = useState<Price[]>(existingDeals);
  const [editingDeal, setEditingDeal] = useState<Price | null>(null);
  const [formData, setFormData] = useState<DealFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (editingDeal) {
      // Convert existing deal to form data, handling both single drink_id and drink_ids array
      const drinkIds: number[] = editingDeal.drink_ids
        ? editingDeal.drink_ids
        : editingDeal.drink_id
          ? [editingDeal.drink_id]
          : [];

      setFormData({
        drink_ids: drinkIds,
        price: editingDeal.price.toString(),
        deal_type: editingDeal.deal_type || 'drink_only',
        deal_target: editingDeal.deal_target || 'specific',
        deal_title: editingDeal.deal_title || '',
        deal_description: editingDeal.deal_description || '',
        food_item: editingDeal.food_item || '',
        deal_schedule: editingDeal.deal_schedule || '',
        deal_start_date: editingDeal.deal_start_date?.split('T')[0] || '',
        deal_end_date: editingDeal.deal_end_date?.split('T')[0] || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingDeal]);

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in');
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
      pub_id: pubId,
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

    let result;
    if (editingDeal) {
      result = await supabase
        .from('prices')
        .update(dealData)
        .eq('id', editingDeal.id)
        .select('*, drink:drinks(*)');
    } else {
      result = await supabase
        .from('prices')
        .insert(dealData)
        .select('*, drink:drinks(*)');
    }

    if (result.error) {
      setError(result.error.message);
    } else {
      if (editingDeal) {
        setDeals(prev => prev.map(d => d.id === editingDeal.id ? result.data[0] : d));
      } else {
        setDeals(prev => [result.data[0], ...prev]);
      }
      setFormData(initialFormData);
      setEditingDeal(null);
      setIsOpen(false);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    const { error } = await supabase
      .from('prices')
      .delete()
      .eq('id', dealId);

    if (!error) {
      setDeals(prev => prev.filter(d => d.id !== dealId));
      router.refresh();
    }
  };

  const handleExpire = async (dealId: string) => {
    const { error } = await supabase
      .from('prices')
      .update({ deal_end_date: new Date().toISOString() })
      .eq('id', dealId);

    if (!error) {
      setDeals(prev => prev.map(d =>
        d.id === dealId ? { ...d, deal_end_date: new Date().toISOString() } : d
      ));
      router.refresh();
    }
  };

  const isExpired = (deal: Price) => {
    if (!deal.deal_end_date) return false;
    return new Date(deal.deal_end_date) < new Date();
  };

  // Get drink names for display
  const getDrinkNames = (deal: Price): string => {
    if (deal.deal_target === 'all_pints') return 'All Pints';
    if (deal.deal_target === 'all_drinks') return 'All Drinks';

    if (deal.drink_ids && deal.drink_ids.length > 0) {
      const drinkNames = deal.drink_ids
        .map(id => drinks.find(d => d.id === id)?.name)
        .filter(Boolean);
      return drinkNames.join(' or ');
    }

    return deal.drink?.name || 'Unknown';
  };

  // Group drinks by category
  const drinksByCategory = drinks.reduce((acc, drink) => {
    if (!acc[drink.category]) acc[drink.category] = [];
    acc[drink.category].push(drink);
    return acc;
  }, {} as Record<string, Drink[]>);

  return (
    <div className="bg-amber-900/20 border border-amber-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
          </svg>
          Manage Deals
        </h3>
        <button
          onClick={() => { setIsOpen(true); setEditingDeal(null); }}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Deal
        </button>
      </div>

      {/* Existing Deals List */}
      {deals.length > 0 && (
        <div className="space-y-2 mb-4">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isExpired(deal)
                  ? 'bg-stout-800/50 border-stout-700 opacity-60'
                  : 'bg-stout-800 border-stout-600'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {deal.deal_title && (
                    <span className="font-medium text-cream-100">{deal.deal_title}</span>
                  )}
                  {isExpired(deal) && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Expired</span>
                  )}
                </div>
                <p className="text-sm text-stout-400">
                  {deal.deal_type === 'food_combo' && deal.food_item
                    ? `${deal.food_item} + ${getDrinkNames(deal)}`
                    : deal.deal_type === 'food_only'
                    ? deal.food_item
                    : getDrinkNames(deal)}
                  {deal.deal_description && ` - ${deal.deal_description}`}
                </p>
                {deal.deal_schedule && (
                  <p className="text-xs text-amber-400">{deal.deal_schedule}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-amber-500">{formatPrice(deal.price)}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setEditingDeal(deal); setIsOpen(true); }}
                    className="p-1.5 text-stout-400 hover:text-cream-100 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  {!isExpired(deal) && (
                    <button
                      onClick={() => handleExpire(deal.id)}
                      className="p-1.5 text-stout-400 hover:text-amber-400 transition-colors"
                      title="Mark as expired"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(deal.id)}
                    className="p-1.5 text-stout-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deals.length === 0 && !isOpen && (
        <p className="text-sm text-stout-400 text-center py-4">No deals yet. Add your first deal!</p>
      )}

      {/* Add/Edit Deal Form */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="bg-stout-800 rounded-lg p-4 border border-stout-600">
          <h4 className="font-medium text-cream-100 mb-4">
            {editingDeal ? 'Edit Deal' : 'Add New Deal'}
          </h4>

          {error && (
            <div className="mb-4 p-2 bg-red-500/20 border border-red-500 text-red-400 text-sm rounded">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            {/* Deal Type */}
            <div>
              <label className="block text-sm text-stout-400 mb-1">Deal Type</label>
              <select
                value={formData.deal_type}
                onChange={(e) => setFormData(prev => ({ ...prev, deal_type: e.target.value as DealType }))}
                className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 focus:outline-none focus:border-amber-500"
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
                className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 focus:outline-none focus:border-amber-500"
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
                    className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="specific">Specific Drinks</option>
                    <option value="all_pints">All Pints</option>
                    <option value="all_drinks">All Drinks</option>
                  </select>
                </div>

                {formData.deal_target === 'specific' && (
                  <div>
                    <label className="block text-sm text-stout-400 mb-2">
                      Select Drinks <span className="text-stout-500">(click to select multiple)</span>
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
                <label className="block text-sm text-stout-400 mb-1">Food Item</label>
                <input
                  type="text"
                  value={formData.food_item}
                  onChange={(e) => setFormData(prev => ({ ...prev, food_item: e.target.value }))}
                  placeholder="e.g., Toastie, Carvery"
                  required
                  className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Price */}
            <div>
              <label className="block text-sm text-stout-400 mb-1">Deal Price</label>
              <div className="flex items-center gap-2">
                <span className="text-stout-400">&euro;</span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                  className="flex-1 px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 focus:outline-none focus:border-amber-500"
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
                className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 focus:outline-none focus:border-amber-500"
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
                className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 focus:outline-none focus:border-amber-500"
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
                  className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-stout-400 mb-1">End Date (optional)</label>
                <input
                  type="date"
                  value={formData.deal_end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, deal_end_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded text-cream-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingDeal ? 'Update Deal' : 'Add Deal'}
            </button>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setEditingDeal(null); setFormData(initialFormData); }}
              className="px-4 py-2 bg-stout-700 text-stout-300 rounded-lg hover:bg-stout-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
