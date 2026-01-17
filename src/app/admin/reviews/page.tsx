'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  pub: { name: string; has_food: boolean }[] | null;
  profile: { id: string; username: string | null; display_name: string | null; is_trusted: boolean }[] | null;
}

function AdminReviewsContent() {
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'pending';
  const supabase = createClient();

  useEffect(() => {
    async function checkAdminAndFetch() {
      try {
        // First check session, then validate with getUser
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push('/auth/login');
          return;
        }

        // Validate the session with the server
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push('/auth/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profileError || !profile?.is_admin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);
        setAuthChecking(false);

        // Fetch reviews
        let query = supabase
          .from('reviews')
          .select(`
            *,
            pub:pubs(name, has_food),
            profile:profiles(id, username, display_name, is_trusted)
          `)
          .order('created_at', { ascending: false });

        if (filter === 'pending') {
          query = query.eq('is_approved', false);
        }

        const { data } = await query.limit(50);
        setReviews(data || []);
      } catch (error) {
        console.error('Error in admin reviews:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetch();
  }, [supabase, router, filter]);

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);

    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', reviewId);

    if (!error) {
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
    setActionLoading(null);
  };

  const handleApproveAndTrust = async (reviewId: string, userId: string) => {
    setActionLoading(reviewId);

    // Approve review
    await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', reviewId);

    // Mark user as trusted
    await supabase
      .from('profiles')
      .update({ is_trusted: true })
      .eq('id', userId);

    setReviews(reviews.filter(r => r.id !== reviewId));
    setActionLoading(null);
  };

  const handleReject = async (reviewId: string) => {
    setActionLoading(reviewId);

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (!error) {
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
    setActionLoading(null);
  };

  if (authChecking || !isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stout-600 border-t-irish-green-500 mb-4"></div>
          <p className="text-stout-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

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

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stout-600 border-t-irish-green-500"></div>
        </div>
      ) : reviews.length === 0 ? (
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
                    {review.pub?.[0]?.name || 'Unknown Pub'}
                  </Link>
                  <p className="text-sm text-stout-400">
                    by {review.profile?.[0]?.display_name || review.profile?.[0]?.username || 'Anonymous'}
                    {review.profile?.[0]?.is_trusted && (
                      <span className="ml-2 text-xs bg-irish-green-600 text-white px-2 py-0.5 rounded-full">
                        Trusted
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-stout-500">{formatDate(review.created_at)}</p>
                </div>
                <StarRating
                  rating={calculateAverageRating(review, { excludeFood: !review.pub?.[0]?.has_food })}
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
                {review.food_quality && review.pub?.[0]?.has_food && (
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
                    Approve
                  </button>
                  {!review.profile?.[0]?.is_trusted && review.profile?.[0]?.id && (
                    <button
                      onClick={() => handleApproveAndTrust(review.id, review.profile![0].id)}
                      disabled={actionLoading === review.id}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-stout-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                    >
                      Approve & Trust User
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(review.id)}
                    disabled={actionLoading === review.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-stout-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                  >
                    Reject
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

export default function AdminReviewsPage() {
  return (
    <Suspense fallback={<div>Loading reviews...</div>}>
      <AdminReviewsContent />
    </Suspense>
  );
}
