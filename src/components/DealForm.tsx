'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface Pub {
  id: string;
  name: string;
}

interface Drink {
  id: number;
  name: string;
  category: string;
}

interface FoodItem {
  id: number;
  name: string;
}

interface DealFormProps {
  pubs: Pub[];
  drinks: Drink[];
  foodItems: FoodItem[];
}

type DealType = 'drink' | 'food' | 'combo' | 'meal_deal' | 'other';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export default function DealForm({ pubs, drinks, foodItems }: DealFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Form state
  const [dealType, setDealType] = useState<DealType>('combo');
  const [selectedPub, setSelectedPub] = useState<Pub | null>(null);
  const [pubSearch, setPubSearch] = useState('');
  const [showPubDropdown, setShowPubDropdown] = useState(false);
  const [selectedDrinks, setSelectedDrinks] = useState<number[]>([]);
  const [foodItem, setFoodItem] = useState('');
  const [price, setPrice] = useState('');
  const [dealTitle, setDealTitle] = useState('');
  const [dealDescription, setDealDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Filter pubs based on search
  const filteredPubs = useMemo(() => {
    if (!pubSearch.trim()) return pubs.slice(0, 10);
    const search = pubSearch.toLowerCase();
    return pubs.filter(pub =>
      pub.name.toLowerCase().includes(search)
    ).slice(0, 10);
  }, [pubs, pubSearch]);

  // Toggle day selection
  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Select all days
  const selectAllDays = () => {
    setSelectedDays([...DAYS]);
  };

  // Select weekdays
  const selectWeekdays = () => {
    setSelectedDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  };

  // Select weekend
  const selectWeekend = () => {
    setSelectedDays(['Sat', 'Sun']);
  };

  // Toggle drink selection
  const toggleDrink = (drinkId: number) => {
    setSelectedDrinks(prev =>
      prev.includes(drinkId)
        ? prev.filter(id => id !== drinkId)
        : [...prev, drinkId]
    );
  };

  // Build schedule string
  const buildSchedule = (): string => {
    let schedule = '';

    if (selectedDays.length === 7) {
      schedule = 'Daily';
    } else if (selectedDays.length === 5 &&
               ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].every(d => selectedDays.includes(d))) {
      schedule = 'Mon-Fri';
    } else if (selectedDays.length === 2 &&
               selectedDays.includes('Sat') && selectedDays.includes('Sun')) {
      schedule = 'Weekends';
    } else if (selectedDays.length > 0) {
      schedule = selectedDays.join(', ');
    }

    if (!allDay && startTime && endTime) {
      schedule += schedule ? ` ${startTime}-${endTime}` : `${startTime}-${endTime}`;
    }

    return schedule;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedPub) {
      setError('Please select a pub');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    if (dealType === 'drink' && selectedDrinks.length === 0) {
      setError('Please select at least one drink');
      return;
    }

    if ((dealType === 'food' || dealType === 'combo' || dealType === 'meal_deal') && !foodItem) {
      setError('Please enter a food item');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to submit deals');
        setIsSubmitting(false);
        return;
      }

      const schedule = buildSchedule();
      const drinkNames = selectedDrinks.map(id => drinks.find(d => d.id === id)?.name).filter(Boolean);

      // For deals with multiple drinks or no drinks, we'll create one entry
      // with drink info in the description
      const dealData = {
        pub_id: selectedPub.id,
        drink_id: dealType === 'food' || dealType === 'other' ? null : (selectedDrinks[0] || null),
        price: parseFloat(price),
        is_deal: true,
        deal_type: dealType === 'drink' ? 'drink_only' :
                   dealType === 'food' ? 'food_only' : 'food_combo',
        deal_title: dealTitle || null,
        food_item: (dealType === 'food' || dealType === 'combo' || dealType === 'meal_deal') ? foodItem : null,
        deal_description: buildDescription(drinkNames),
        deal_schedule: schedule || null,
        submitted_by: user.id,
      };

      const { error: insertError } = await supabase.from('prices').insert(dealData);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        router.push('/deals');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit deal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build description with drink options
  const buildDescription = (drinkNames: (string | undefined)[]): string => {
    let desc = dealDescription;

    if (drinkNames.length > 1) {
      const drinksText = drinkNames.join(' or ');
      desc = desc ? `${desc} (${drinksText})` : `Choice of: ${drinksText}`;
    }

    return desc || null as any;
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🍻</div>
        <h2 className="text-2xl font-bold text-cream-100 mb-2">Deal Submitted!</h2>
        <p className="text-stout-400">Thanks for sharing this deal with the community.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Deal Type Selection */}
      <div>
        <label className="block text-sm font-medium text-cream-100 mb-3">What type of deal is this?</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { value: 'drink', label: 'Drink Only', icon: '🍺' },
            { value: 'food', label: 'Food Only', icon: '🍔' },
            { value: 'combo', label: 'Food + Drink', icon: '🍺🍔' },
            { value: 'meal_deal', label: 'Meal Deal', icon: '🍽️' },
            { value: 'other', label: 'Other', icon: '🎉' },
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setDealType(value as DealType)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                dealType === value
                  ? 'bg-irish-green-600 border-irish-green-500 text-white'
                  : 'bg-stout-700 border-stout-600 text-stout-200 hover:border-stout-500'
              }`}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Pub Search with Autocomplete */}
      <div className="relative">
        <label className="block text-sm font-medium text-cream-100 mb-2">Pub / Bar</label>
        <input
          type="text"
          value={selectedPub ? selectedPub.name : pubSearch}
          onChange={(e) => {
            setPubSearch(e.target.value);
            setSelectedPub(null);
            setShowPubDropdown(true);
          }}
          onFocus={() => setShowPubDropdown(true)}
          placeholder="Start typing to search..."
          className="w-full px-4 py-3 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
        />
        {showPubDropdown && !selectedPub && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPubDropdown(false)} />
            <div className="absolute z-50 w-full mt-1 bg-stout-800 border border-stout-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredPubs.length > 0 ? (
                filteredPubs.map(pub => (
                  <button
                    key={pub.id}
                    type="button"
                    onClick={() => {
                      setSelectedPub(pub);
                      setPubSearch('');
                      setShowPubDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-cream-100 hover:bg-stout-700 transition-colors"
                  >
                    {pub.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-stout-400">No pubs found</div>
              )}
            </div>
          </>
        )}
        {selectedPub && (
          <button
            type="button"
            onClick={() => {
              setSelectedPub(null);
              setPubSearch('');
            }}
            className="absolute right-3 top-[38px] text-stout-400 hover:text-cream-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Drink Selection - Multi-select */}
      {(dealType === 'drink' || dealType === 'combo' || dealType === 'meal_deal') && (
        <div>
          <label className="block text-sm font-medium text-cream-100 mb-2">
            Drinks included <span className="text-stout-400 font-normal">(select all that apply)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {drinks.map(drink => (
              <button
                key={drink.id}
                type="button"
                onClick={() => toggleDrink(drink.id)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedDrinks.includes(drink.id)
                    ? 'bg-irish-green-600 border-irish-green-500 text-white'
                    : 'bg-stout-700 border-stout-600 text-stout-200 hover:border-stout-500'
                }`}
              >
                {drink.name}
              </button>
            ))}
          </div>
          {selectedDrinks.length > 1 && (
            <p className="text-sm text-amber-400 mt-2">
              Multiple drinks selected - deal applies to any of these
            </p>
          )}
        </div>
      )}

      {/* Food Item */}
      {(dealType === 'food' || dealType === 'combo' || dealType === 'meal_deal') && (
        <div>
          <label className="block text-sm font-medium text-cream-100 mb-2">Food Item</label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {foodItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFoodItem(item.name)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
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
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="Or type custom food item..."
              className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
            />
          </div>
        </div>
      )}

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-cream-100 mb-2">Deal Price</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stout-400 text-lg">&euro;</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="10.00"
            className="w-full pl-10 pr-4 py-3 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 text-lg focus:outline-none focus:border-irish-green-500"
          />
        </div>
      </div>

      {/* Deal Title */}
      <div>
        <label className="block text-sm font-medium text-cream-100 mb-2">
          Deal Title <span className="text-stout-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={dealTitle}
          onChange={(e) => setDealTitle(e.target.value)}
          placeholder="e.g., Lunch Special, Happy Hour, Student Deal"
          className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
        />
      </div>

      {/* Day Selection */}
      <div>
        <label className="block text-sm font-medium text-cream-100 mb-2">When is this deal available?</label>
        <div className="space-y-3">
          {/* Quick select buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={selectAllDays}
              className={`px-3 py-1 rounded text-sm ${
                selectedDays.length === 7 ? 'bg-irish-green-600 text-white' : 'bg-stout-700 text-stout-300'
              }`}
            >
              Every Day
            </button>
            <button
              type="button"
              onClick={selectWeekdays}
              className={`px-3 py-1 rounded text-sm ${
                selectedDays.length === 5 && ['Mon','Tue','Wed','Thu','Fri'].every(d => selectedDays.includes(d))
                  ? 'bg-irish-green-600 text-white' : 'bg-stout-700 text-stout-300'
              }`}
            >
              Weekdays
            </button>
            <button
              type="button"
              onClick={selectWeekend}
              className={`px-3 py-1 rounded text-sm ${
                selectedDays.length === 2 && selectedDays.includes('Sat') && selectedDays.includes('Sun')
                  ? 'bg-irish-green-600 text-white' : 'bg-stout-700 text-stout-300'
              }`}
            >
              Weekend
            </button>
            <button
              type="button"
              onClick={() => setSelectedDays([])}
              className="px-3 py-1 rounded text-sm bg-stout-700 text-stout-300"
            >
              Clear
            </button>
          </div>

          {/* Individual days */}
          <div className="flex gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDays.includes(day)
                    ? 'bg-irish-green-600 text-white'
                    : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Time Range */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input
            type="checkbox"
            checked={!allDay}
            onChange={(e) => setAllDay(!e.target.checked)}
            className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
          />
          <span className="text-sm text-cream-100">Specific hours only</span>
        </label>
        {!allDay && (
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-xs text-stout-400 mb-1">From</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-stout-400 mb-1">To</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div>
        <label className="block text-sm font-medium text-cream-100 mb-2">
          Additional Details <span className="text-stout-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={dealDescription}
          onChange={(e) => setDealDescription(e.target.value)}
          rows={3}
          placeholder="Any extra info: booking required, terms & conditions, etc."
          className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500"
        />
      </div>

      {/* Preview */}
      {(selectedPub || foodItem || selectedDrinks.length > 0 || price) && (
        <div className="bg-stout-700/50 rounded-lg p-4 border border-stout-600">
          <h3 className="text-sm font-medium text-stout-400 mb-2">Preview</h3>
          <div className="text-cream-100">
            {dealTitle && <p className="font-bold text-lg">{dealTitle}</p>}
            <p>
              {dealType === 'combo' || dealType === 'meal_deal' ? (
                <>
                  {foodItem} + {selectedDrinks.length > 1
                    ? `choice of ${selectedDrinks.map(id => drinks.find(d => d.id === id)?.name).join(' / ')}`
                    : selectedDrinks.length === 1
                      ? drinks.find(d => d.id === selectedDrinks[0])?.name
                      : 'Pint'}
                </>
              ) : dealType === 'food' ? (
                foodItem
              ) : dealType === 'drink' && selectedDrinks.length > 0 ? (
                selectedDrinks.map(id => drinks.find(d => d.id === id)?.name).join(' / ')
              ) : (
                dealDescription || 'Deal'
              )}
            </p>
            {price && <p className="text-xl font-bold text-irish-green-500">&euro;{parseFloat(price).toFixed(2)}</p>}
            {selectedPub && <p className="text-sm text-stout-400">at {selectedPub.name}</p>}
            {buildSchedule() && <p className="text-sm text-amber-400">{buildSchedule()}</p>}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors text-lg"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Deal'}
      </button>
    </form>
  );
}
