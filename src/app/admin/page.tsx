import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

async function isAdmin(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  return data?.is_admin === true;
}

async function getPendingCounts() {
  const supabase = await createServerSupabaseClient();

  const [photos, reviews, reports, deals] = await Promise.all([
    supabase.from('pub_photos').select('id', { count: 'exact' }).eq('is_approved', false),
    supabase.from('reviews').select('id', { count: 'exact' }).eq('is_approved', false),
    supabase.from('reports').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('prices').select('id', { count: 'exact' }).eq('is_deal', true),
  ]);

  return {
    pendingPhotos: photos.count || 0,
    pendingReviews: reviews.count || 0,
    pendingReports: reports.count || 0,
    totalDeals: deals.count || 0,
  };
}

export default async function AdminPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect('/');
  }

  const counts = await getPendingCounts();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">Admin Dashboard</h1>
        <p className="text-stout-400">Manage content moderation and user trust levels</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Pending Photos */}
        <Link
          href="/admin/photos"
          className="bg-stout-800 rounded-lg border border-stout-700 p-6 hover:border-stout-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-cream-100">Photos</h2>
            {counts.pendingPhotos > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {counts.pendingPhotos}
              </span>
            )}
          </div>
          <p className="text-stout-400">
            {counts.pendingPhotos > 0
              ? `${counts.pendingPhotos} photo${counts.pendingPhotos === 1 ? '' : 's'} awaiting review`
              : 'No photos pending review'}
          </p>
        </Link>

        {/* Pending Reviews */}
        <Link
          href="/admin/reviews"
          className="bg-stout-800 rounded-lg border border-stout-700 p-6 hover:border-stout-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-cream-100">Reviews</h2>
            {counts.pendingReviews > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {counts.pendingReviews}
              </span>
            )}
          </div>
          <p className="text-stout-400">
            {counts.pendingReviews > 0
              ? `${counts.pendingReviews} review${counts.pendingReviews === 1 ? '' : 's'} awaiting review`
              : 'No reviews pending'}
          </p>
        </Link>

        {/* Manage Users */}
        <Link
          href="/admin/users"
          className="bg-stout-800 rounded-lg border border-stout-700 p-6 hover:border-stout-500 transition-colors"
        >
          <h2 className="text-xl font-semibold text-cream-100 mb-4">Users</h2>
          <p className="text-stout-400">Manage trusted users and admins</p>
        </Link>

        {/* Deals Management */}
        <Link
          href="/admin/deals"
          className="bg-stout-800 rounded-lg border border-stout-700 p-6 hover:border-stout-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-cream-100">Deals</h2>
            {counts.totalDeals > 0 && (
              <span className="bg-amber-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {counts.totalDeals}
              </span>
            )}
          </div>
          <p className="text-stout-400">
            {counts.totalDeals > 0
              ? `${counts.totalDeals} active deal${counts.totalDeals === 1 ? '' : 's'}`
              : 'No deals yet'}
          </p>
        </Link>

        {/* Reports / Flagged Content */}
        <Link
          href="/admin/reports"
          className="bg-stout-800 rounded-lg border border-stout-700 p-6 hover:border-stout-500 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-cream-100">Reports</h2>
            {counts.pendingReports > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {counts.pendingReports}
              </span>
            )}
          </div>
          <p className="text-stout-400">
            {counts.pendingReports > 0
              ? `${counts.pendingReports} report${counts.pendingReports === 1 ? '' : 's'} pending review`
              : 'No pending reports'}
          </p>
        </Link>

        {/* Quick Stats */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-semibold text-cream-100 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/admin/pubs"
              className="block text-amber-500 hover:text-amber-400 font-medium"
            >
              + Add New Pub
            </Link>
            <Link
              href="/admin/photos?filter=all"
              className="block text-irish-green-500 hover:text-irish-green-400"
            >
              View all photos
            </Link>
            <Link
              href="/admin/reviews?filter=all"
              className="block text-irish-green-500 hover:text-irish-green-400"
            >
              View all reviews
            </Link>
            <Link
              href="/admin/deals"
              className="block text-irish-green-500 hover:text-irish-green-400"
            >
              Manage all deals
            </Link>
            <Link
              href="/admin/reports"
              className="block text-irish-green-500 hover:text-irish-green-400"
            >
              View flagged content
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
