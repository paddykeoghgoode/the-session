'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface CreamRatingProps {
  pubId: string;
  avgCreamScore?: number | null;
  creamRatingCount?: number;
}

interface RatingCategory {
  key: 'creaminess' | 'temperature' | 'stick';
  label: string;
  description: string;
  icon: string;
}

const CREAM_CATEGORIES: RatingCategory[] = [
  { key: 'creaminess', label: 'Creaminess', description: 'How smooth and creamy is the head?', icon: '☁️' },
  { key: 'temperature', label: 'Temperature', description: 'Perfectly chilled?', icon: '🌡️' },
  { key: 'stick', label: 'Stick', description: 'Does the cream stick to the glass?', icon: '🥛' },
];

export default function CreamRating({ pubId, avgCreamScore, creamRatingCount = 0 }: CreamRatingProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [existingRating, setExistingRating] = useState<{
    creaminess: number;
    temperature: number;
    stick: number;
    comment: string | null;
  } | null>(null);

  const [ratings, setRatings] = useState({
    creaminess: 0,
    temperature: 0,
    stick: 0,
  });
  const [comment, setComment] = useState('');

  const supabase = createClient();

  useEffect(() => {
    async function checkExistingRating() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('cream_ratings')
        .select('creaminess, temperature, stick, comment')
        .eq('pub_id', pubId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setExistingRating(data);
        setRatings({
          creaminess: data.creaminess,
          temperature: data.temperature,
          stick: data.stick,
        });
        setComment(data.comment || '');
        setHasRated(true);
      }
    }

    checkExistingRating();
  }, [pubId, supabase]);

  const handleSubmit = async () => {
    if (ratings.creaminess === 0 || ratings.temperature === 0 || ratings.stick === 0) {
      return;
    }

    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const ratingData = {
      pub_id: pubId,
      user_id: user.id,
      creaminess: ratings.creaminess,
      temperature: ratings.temperature,
      stick: ratings.stick,
      comment: comment || null,
    };

    const { error } = await supabase
      .from('cream_ratings')
      .upsert(ratingData, {
        onConflict: 'pub_id,user_id',
      });

    if (!error) {
      setHasRated(true);
      setExistingRating(ratingData);
      setIsOpen(false);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  const renderStars = (category: 'creaminess' | 'temperature' | 'stick') => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatings(prev => ({ ...prev, [category]: star }))}
            className={`w-8 h-8 rounded-full transition-all ${
              star <= ratings[category]
                ? 'bg-cream-200 text-stout-900 scale-110'
                : 'bg-stout-700 text-stout-400 hover:bg-stout-600'
            }`}
          >
            {star}
          </button>
        ))}
      </div>
    );
  };

  const overallScore = avgCreamScore ? avgCreamScore.toFixed(1) : null;

  return (
    <div className="bg-gradient-to-br from-cream-100/10 to-stout-800 rounded-lg border border-cream-200/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥛</span>
          <div>
            <h4 className="font-medium text-cream-100">Cream Index</h4>
            <p className="text-xs text-stout-400">Rate the Guinness quality</p>
          </div>
        </div>

        {overallScore && (
          <div className="text-right">
            <div className="text-2xl font-bold text-cream-200">{overallScore}</div>
            <div className="text-xs text-stout-400">{creamRatingCount} ratings</div>
          </div>
        )}
      </div>

      {/* Score breakdown if we have ratings */}
      {!isOpen && creamRatingCount > 0 && (
        <div className="flex gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1">
            <span>☁️</span>
            <span className="text-cream-100">{avgCreamScore?.toFixed(1)}</span>
          </div>
        </div>
      )}

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-2 px-4 bg-cream-200/10 hover:bg-cream-200/20 text-cream-100 text-sm font-medium rounded-lg border border-cream-200/20 transition-colors"
        >
          {hasRated ? 'Update Your Rating' : 'Rate the Guinness'}
        </button>
      ) : (
        <div className="space-y-4">
          {CREAM_CATEGORIES.map(({ key, label, description, icon }) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2">
                <span>{icon}</span>
                <span className="text-sm font-medium text-cream-100">{label}</span>
                <span className="text-xs text-stout-400">- {description}</span>
              </div>
              {renderStars(key)}
            </div>
          ))}

          <div>
            <label className="block text-sm text-stout-400 mb-1">
              Comments (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Any notes about the pint..."
              rows={2}
              className="w-full px-3 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 text-sm focus:outline-none focus:border-cream-200/50 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || ratings.creaminess === 0 || ratings.temperature === 0 || ratings.stick === 0}
              className="flex-1 py-2 bg-cream-200 text-stout-900 font-medium rounded-lg hover:bg-cream-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : hasRated ? 'Update Rating' : 'Submit Rating'}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-stout-700 text-stout-300 rounded-lg hover:bg-stout-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
