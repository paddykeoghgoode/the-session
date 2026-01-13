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

  const [photos, reviews] = await Promise.all([
    supabase.from('pub_photos').select('id', { count: 'exact' }).eq('is_approved', false),
    supabase.from('reviews').select('id', { count: 'exact' }).eq('is_approved', false),
  ]);

  return {
    pendingPhotos: photos.count || 0,
    pendingReviews: reviews.count || 0,
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

        {/* Quick Stats */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-xl font-semibold text-cream-100 mb-4">Quick Actions</h2>
          <div className="space-y-2">
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
          </div>
        </div>
      </div>
    </div>
  );
}
