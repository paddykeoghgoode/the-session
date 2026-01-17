'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';

interface PendingPhoto {
  id: string;
  pub_id: string;
  storage_path: string;
  caption: string | null;
  file_size: number;
  created_at: string;
  pub: { name: string }[] | null;
  profile: { username: string | null; display_name: string | null }[] | null;
}

function AdminPhotosContent() {
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
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

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (!profile?.is_admin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);
        setAuthChecking(false);

        let query = supabase
          .from('pub_photos')
          .select(`
            id,
            pub_id,
            storage_path,
            caption,
            file_size,
            created_at,
            pub:pubs(name),
            profile:profiles(username, display_name)
          `)
          .order('created_at', { ascending: false });

        if (filter === 'pending') {
          query = query.eq('is_approved', false);
        }

        const { data } = await query.limit(50);
        setPhotos(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      }
    }

    checkAdminAndFetch();
  }, [supabase, router, filter]);

  const handleApprove = async (photoId: string) => {
    setActionLoading(photoId);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('pub_photos')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: user?.id,
      })
      .eq('id', photoId);

    if (!error) {
      setPhotos(photos.filter(p => p.id !== photoId));
    }
    setActionLoading(null);
  };

  const handleReject = async (photoId: string, storagePath: string) => {
    setActionLoading(photoId);
    await supabase.storage.from('pub-photos').remove([storagePath]);

    const { error } = await supabase
      .from('pub_photos')
      .delete()
      .eq('id', photoId);

    if (!error) {
      setPhotos(photos.filter(p => p.id !== photoId));
    }
    setActionLoading(null);
  };

  const getPhotoUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('pub-photos').getPublicUrl(storagePath);
    return data.publicUrl;
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-irish-green-500 hover:text-irish-green-400 text-sm mb-2 inline-block">
            &larr; Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-cream-100">Photo Moderation</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/photos?filter=pending"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === 'pending'
                ? 'bg-irish-green-600 text-white'
                : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
            }`}
          >
            Pending
          </Link>
          <Link
            href="/admin/photos?filter=all"
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
      ) : photos.length === 0 ? (
        <div className="text-center py-12 bg-stout-800 rounded-lg border border-stout-700">
          <p className="text-stout-400">No {filter === 'pending' ? 'pending ' : ''}photos to review</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-stout-800 rounded-lg border border-stout-700 overflow-hidden"
            >
              <div className="relative aspect-video bg-stout-900">
                <Image
                  src={getPhotoUrl(photo.storage_path)}
                  alt={photo.caption || 'Pub photo'}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4">
                <Link
                  href={`/pubs/${photo.pub_id}`}
                  className="text-cream-100 font-semibold hover:text-irish-green-500"
                >
                  {photo.pub?.[0]?.name || 'Unknown Pub'}
                </Link>
                <p className="text-sm text-stout-400">
                  by {photo.profile?.[0]?.display_name || photo.profile?.[0]?.username || 'Anonymous'}
                </p>
                {photo.caption && (
                  <p className="text-sm text-stout-300 mt-2">{photo.caption}</p>
                )}
                <p className="text-xs text-stout-500 mt-2">
                  {formatDate(photo.created_at)} &bull; {Math.round(photo.file_size / 1024)}KB
                </p>

                {filter === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleApprove(photo.id)}
                      disabled={actionLoading === photo.id}
                      className="flex-1 bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(photo.id, photo.storage_path)}
                      disabled={actionLoading === photo.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-stout-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPhotosPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stout-600 border-t-irish-green-500"></div>
        </div>
      </div>
    }>
      <AdminPhotosContent />
    </Suspense>
  );
}
