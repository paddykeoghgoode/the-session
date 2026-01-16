'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import StarRating from './StarRating';
import { RATING_CATEGORIES } from '@/types';

interface ReviewFormProps {
  pubId: string;
  hasFood?: boolean;
  onSuccess?: () => void;
}

export default function ReviewForm({ pubId, hasFood = true, onSuccess }: ReviewFormProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');

  // Filter out food rating if pub doesn't serve food
  const displayCategories = hasFood
    ? RATING_CATEGORIES
    : RATING_CATEGORIES.filter(c => c.key !== 'food_quality');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleRatingChange = (key: string, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Check if at least one rating is provided
    const hasRating = Object.values(ratings).some((r) => r > 0);
    if (!hasRating && !comment.trim()) {
      setError('Please provide at least one rating or a comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('You must be logged in to submit reviews');
        setIsSubmitting(false);
        return;
      }

      // Check if user is trusted (auto-approve their reviews)
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_trusted, is_admin')
        .eq('id', user.id)
        .single();

      const isAutoApproved = profile?.is_trusted || profile?.is_admin;

      const { error: insertError } = await supabase.from('reviews').upsert({
        pub_id: pubId,
        user_id: user.id,
        pint_quality: ratings.pint_quality || null,
        ambience: ratings.ambience || null,
        food_quality: ratings.food_quality || null,
        staff_friendliness: ratings.staff_friendliness || null,
        safety: ratings.safety || null,
        value_for_money: ratings.value_for_money || null,
        comment: comment.trim() || null,
        is_approved: isAutoApproved,
      }, {
        onConflict: 'pub_id,user_id',
      });

      if (insertError) throw insertError;

      setSuccess(true);
      setRatings({});
      setComment('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-irish-green-500/10 border border-irish-green-500 text-irish-green-400 px-4 py-3 rounded">
          Review submitted successfully! Thanks for your feedback.
        </div>
      )}

      <div className="space-y-4">
        {displayCategories.map((category) => (
          <div key={category.key} className="flex items-center justify-between">
            <div>
              <p className="text-cream-100 font-medium">{category.label}</p>
              <p className="text-sm text-stout-400">{category.description}</p>
            </div>
            <StarRating
              rating={ratings[category.key] || 0}
              interactive
              onChange={(value) => handleRatingChange(category.key, value)}
              size="lg"
            />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-cream-100 mb-2">
          Additional Comments (Optional)
        </label>
        <textarea
          id="comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience at this pub..."
          className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
