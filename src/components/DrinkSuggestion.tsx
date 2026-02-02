'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { DRINK_CATEGORIES } from '@/types';

interface DrinkSuggestionProps {
  userId?: string;
}

export default function DrinkSuggestion({ userId }: DrinkSuggestionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [drinkName, setDrinkName] = useState('');
  const [category, setCategory] = useState<string>('spirit');
  const [brand, setBrand] = useState('');
  const [baseSpirit, setBaseSpirit] = useState('');
  const [mixer, setMixer] = useState('');
  const [description, setDescription] = useState('');

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('drink_suggestions')
        .insert({
          user_id: userId || null,
          drink_name: drinkName.trim(),
          drink_category: category,
          brand: brand.trim() || null,
          base_spirit: baseSpirit.trim() || null,
          mixer: mixer.trim() || null,
          description: description.trim() || null,
          status: 'pending',
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setDrinkName('');
      setBrand('');
      setBaseSpirit('');
      setMixer('');
      setDescription('');

      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit suggestion:', err);
      setError('Failed to submit suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showSpiritFields = ['spirit', 'cocktail'].includes(category);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-irish-green-500 hover:text-irish-green-400 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Suggest a drink
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stout-800 rounded-lg border border-stout-700 w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-stout-700">
              <h2 className="text-lg font-semibold text-cream-100">Suggest a Drink</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-stout-400 hover:text-cream-100"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">🍻</div>
                <h3 className="text-lg font-semibold text-cream-100 mb-2">Thanks!</h3>
                <p className="text-stout-400">Your suggestion has been submitted for review.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <p className="text-sm text-stout-400">
                  Can't find a drink? Suggest it and we'll add it if there's enough interest.
                </p>

                <div>
                  <label className="block text-sm text-stout-300 mb-1">Drink Name *</label>
                  <input
                    type="text"
                    value={drinkName}
                    onChange={(e) => setDrinkName(e.target.value)}
                    required
                    placeholder="e.g., Aperol Spritz"
                    className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-stout-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 focus:border-irish-green-500 focus:outline-none"
                  >
                    {Object.entries(DRINK_CATEGORIES).map(([key, { label, icon }]) => (
                      <option key={key} value={key}>
                        {icon} {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-stout-300 mb-1">Brand (optional)</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Absolut, Hendrick's"
                    className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                  />
                </div>

                {showSpiritFields && (
                  <>
                    <div>
                      <label className="block text-sm text-stout-300 mb-1">Base Spirit</label>
                      <input
                        type="text"
                        value={baseSpirit}
                        onChange={(e) => setBaseSpirit(e.target.value)}
                        placeholder="e.g., vodka, gin, rum"
                        className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-stout-300 mb-1">Mixer</label>
                      <input
                        type="text"
                        value={mixer}
                        onChange={(e) => setMixer(e.target.value)}
                        placeholder="e.g., tonic, coke, red bull"
                        className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm text-stout-300 mb-1">Additional Info (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Any other details about this drink..."
                    rows={2}
                    className="w-full bg-stout-700 border border-stout-600 rounded-lg px-3 py-2 text-cream-100 placeholder-stout-500 focus:border-irish-green-500 focus:outline-none resize-none"
                  />
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !drinkName.trim()}
                  className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Suggestion'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
