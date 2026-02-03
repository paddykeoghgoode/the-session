import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import type { FriendRelationship, CheckIn, Profile } from '@/types';

export const revalidate = 0; // Always fresh for social feed

async function getFriends(userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('friend_relationships')
    .select(`
      *,
      friend:profiles!friend_relationships_friend_id_fkey(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false });

  return (data || []) as FriendRelationship[];
}

async function getFriendCheckIns(userId: string) {
  const supabase = await createServerSupabaseClient();

  // Get friend IDs
  const { data: friendships } = await supabase
    .from('friend_relationships')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'accepted');

  if (!friendships || friendships.length === 0) return [];

  const friendIds = friendships.map((f) => f.friend_id);

  // Get recent check-ins from friends (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('check_ins')
    .select(`
      *,
      pub:pubs(*),
      profile:profiles(*)
    `)
    .in('user_id', friendIds)
    .gte('created_at', sevenDaysAgo)
    .order('created_at', { ascending: false })
    .limit(50);

  return data || [];
}

async function getPendingRequests(userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from('friend_relationships')
    .select(`
      *,
      friend:profiles!friend_relationships_user_id_fkey(*)
    `)
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (data || []) as FriendRelationship[];
}

export default async function FriendsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const [friends, friendCheckIns, pendingRequests] = await Promise.all([
    getFriends(user.id),
    getFriendCheckIns(user.id),
    getPendingRequests(user.id),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cream-100 mb-2">
          Friends
        </h1>
        <p className="text-stout-400">
          See where your friends are drinking
        </p>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-cream-100 mb-4">
            Friend Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between bg-stout-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-irish-green-600 flex items-center justify-center text-white font-medium">
                    {request.friend?.display_name?.[0] || request.friend?.username?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-cream-100">
                      {request.friend?.display_name || request.friend?.username || 'User'}
                    </p>
                    {request.friend?.username && (
                      <p className="text-sm text-stout-400">@{request.friend.username}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action="/api/friends/accept" method="POST">
                    <input type="hidden" name="requestId" value={request.id} />
                    <button
                      type="submit"
                      className="bg-irish-green-600 hover:bg-irish-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Accept
                    </button>
                  </form>
                  <form action="/api/friends/decline" method="POST">
                    <input type="hidden" name="requestId" value={request.id} />
                    <button
                      type="submit"
                      className="bg-stout-600 hover:bg-stout-500 text-cream-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Friend List */}
        <div className="lg:col-span-1">
          <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
            <h2 className="text-lg font-bold text-cream-100 mb-4">
              Your Friends ({friends.length})
            </h2>

            {friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map((friendship) => (
                  <div key={friendship.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-irish-green-600 flex items-center justify-center text-white font-medium">
                      {friendship.friend?.display_name?.[0] || friendship.friend?.username?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-cream-100 truncate">
                        {friendship.friend?.display_name || friendship.friend?.username || 'User'}
                      </p>
                      {friendship.friend?.username && (
                        <p className="text-sm text-stout-400 truncate">
                          @{friendship.friend.username}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-stout-400 mb-4">No friends yet</p>
                <p className="text-sm text-stout-500">
                  Add friends to see their pub check-ins!
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-stout-700">
              <Link
                href="/friends/find"
                className="block text-center bg-irish-green-600 hover:bg-irish-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Find Friends
              </Link>
            </div>
          </div>
        </div>

        {/* Friend Activity Feed */}
        <div className="lg:col-span-2">
          <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
            <h2 className="text-lg font-bold text-cream-100 mb-4">
              Recent Activity
            </h2>

            {friendCheckIns.length > 0 ? (
              <div className="space-y-4">
                {friendCheckIns.map((checkIn) => {
                  const hoursAgo = Math.round(
                    (Date.now() - new Date(checkIn.created_at).getTime()) / (1000 * 60 * 60)
                  );

                  return (
                    <div
                      key={checkIn.id}
                      className="bg-stout-700 rounded-lg p-4 border border-stout-600"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-irish-green-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                          {checkIn.profile?.display_name?.[0] || checkIn.profile?.username?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-cream-100">
                            <span className="font-medium">
                              {checkIn.profile?.display_name || checkIn.profile?.username || 'Someone'}
                            </span>
                            {' checked in at '}
                            <Link
                              href={`/pubs/${checkIn.pub_id}`}
                              className="text-irish-green-500 hover:text-irish-green-400 font-medium"
                            >
                              {checkIn.pub?.name}
                            </Link>
                          </p>
                          <p className="text-xs text-stout-400 mt-1">
                            {hoursAgo === 0 ? 'Less than an hour ago' : `${hoursAgo}h ago`}
                            {checkIn.pub?.address && ` • ${checkIn.pub.address}`}
                          </p>
                          {checkIn.notes && (
                            <p className="text-sm text-stout-300 mt-2 italic">
                              &quot;{checkIn.notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-stout-400 mb-2">No recent activity</p>
                <p className="text-sm text-stout-500">
                  {friends.length === 0
                    ? 'Add friends to see their pub check-ins'
                    : 'Your friends haven\'t checked in recently'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Info */}
      <div className="mt-8 bg-gradient-to-r from-irish-green-600 to-irish-green-700 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">Pub Crawls with Friends</h3>
        <p className="text-irish-green-100 mb-4">
          Plan collaborative pub crawls with your friends. Vote on routes, track who's going, and share the fun!
        </p>
        <Link
          href="/crawls/new"
          className="inline-block bg-white text-irish-green-700 px-6 py-2 rounded-lg font-medium hover:bg-cream-100 transition-colors"
        >
          Create a Pub Crawl
        </Link>
      </div>
    </div>
  );
}
