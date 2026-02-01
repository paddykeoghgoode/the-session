'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatDate, calculateAverageRating } from '@/lib/utils';
import StarRating from '@/components/StarRating';

interface PendingReview {
  id: string;
  pub_id: string;
  user_id: string;
  pint_quality: number | null;
  ambience: number | null;
  food_quality: number | null;
  staff_friendliness: number | null;
  safety: number | null;
  value_for_money: number | null;
  comment: string | null;
  created_at: string;
  is_approved: boolean;
  pub: { name: string; has_food: boolean } | null;
  profile: { id: string; username: string | null; display_name: string | null; is_trusted: boolean } | null;
}

interface AdminReviewsClientProps {
  initialReviews: PendingReview[];
  filter: string;
}

export default function AdminReviewsClient({ initialReviews, filter }: AdminReviewsClientProps) {
  const [reviews, setReviews] = useState<PendingReview[]>(initialReviews);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);
    setError(null);

    const { error: updateError } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', reviewId);

    if (updateError) {
      setError(`Failed to approve review: ${updateError.message}`);
    } else {
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
    setActionLoading(null);
  };

  const handleApproveAndTrust = async (reviewId: string, userId: string) => {
    setActionLoading(reviewId);
    setError(null);

    // Approve review
    const { error: approveError } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', reviewId);

    if (approveError) {
      setError(`Failed to approve review: ${approveError.message}`);
      setActionLoading(null);
      return;
    }

    // Mark user as trusted
    const { error: trustError } = await supabase
      .from('profiles')
      .update({ is_trusted: true })
      .eq('id', userId);

    if (trustError) {
      console.error('Failed to mark user as trusted:', trustError);
      // Don't show error - the review was still approved
    }

    setReviews(reviews.filter(r => r.id !== reviewId));
    setActionLoading(null);
  };

  const handleReject = async (reviewId: string) => {
    setActionLoading(reviewId);
    setError(null);

    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      setError(`Failed to reject review: ${deleteError.message}`);
    } else {
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
    setActionLoading(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-irish-green-500 hover:text-irish-green-400 text-sm mb-2 inline-block">
            &larr; Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-cream-100">Review Moderation</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/reviews?filter=pending"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'pending'
                ? 'bg-irish-green-600 text-white'
                : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
            }`}
          >
            Pending
          </Link>
          <Link
            href="/admin/reviews?filter=all"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'all'
                ? 'bg-irish-green-600 text-white'
                : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
            }`}
          >
            All
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-stout-800 rounded-lg border border-stout-700">
          <p className="text-stout-400">No {filter === 'pending' ? 'pending ' : ''}reviews to moderate</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-stout-800 rounded-lg border border-stout-700 p-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link
                    href={`/pubs/${review.pub_id}`}
                    className="text-cream-100 font-semibold hover:text-irish-green-500"
                  >
                    {review.pub?.name || 'Unknown Pub'}
                  </Link>
                  <p className="text-sm text-stout-400">
                    by {review.profile?.display_name || review.profile?.username || 'Anonymous'}
                    {review.profile?.is_trusted && (
                      <span className="ml-2 text-xs bg-irish-green-600 text-white px-2 py-0.5 rounded-full">
                        Trusted
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-stout-500">{formatDate(review.created_at)}</p>
                </div>
                <StarRating
                  rating={calculateAverageRating(review, { excludeFood: !review.pub?.has_food })}
                  size="sm"
                  showValue
                />
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3 text-sm">
                {review.pint_quality && (
                  <div>
                    <span className="text-stout-500">Pint:</span>{' '}
                    <span className="text-cream-100">{review.pint_quality}/5</span>
                  </div>
                )}
                {review.ambience && (
                  <div>
                    <span className="text-stout-500">Ambience:</span>{' '}
                    <span className="text-cream-100">{review.ambience}/5</span>
                  </div>
                )}
                {review.staff_friendliness && (
                  <div>
                    <span className="text-stout-500">Staff:</span>{' '}
                    <span className="text-cream-100">{review.staff_friendliness}/5</span>
                  </div>
                )}
                {review.safety && (
                  <div>
                    <span className="text-stout-500">Safety:</span>{' '}
                    <span className="text-cream-100">{review.safety}/5</span>
                  </div>
                )}
                {review.value_for_money && (
                  <div>
                    <span className="text-stout-500">Value:</span>{' '}
                    <span className="text-cream-100">{review.value_for_money}/5</span>
                  </div>
                )}
                {review.food_quality && review.pub?.has_food && (
                  <div>
                    <span className="text-stout-500">Food:</span>{' '}
                    <span className="text-cream-100">{review.food_quality}/5</span>
                  </div>
                )}
              </div>

              {/* Comment */}
              {review.comment && (
                <div className="bg-stout-700 rounded p-3 mb-4">
                  <p className="text-stout-300 text-sm">{review.comment}</p>
                </div>
              )}

              {/* Actions */}
              {filter === 'pending' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApprove(review.id)}
                    disabled={actionLoading === review.id}
                    className="bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                  >
                    {actionLoading === review.id ? 'Processing...' : 'Approve'}
                  </button>
                  {!review.profile?.is_trusted && review.profile?.id && (
                    <button
                      onClick={() => handleApproveAndTrust(review.id, review.profile!.id)}
                      disabled={actionLoading === review.id}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-stout-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                    >
                      {actionLoading === review.id ? 'Processing...' : 'Approve & Trust User'}
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(review.id)}
                    disabled={actionLoading === review.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-stout-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                  >
                    {actionLoading === review.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
