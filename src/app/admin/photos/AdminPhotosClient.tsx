'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  is_approved: boolean;
  pub: { name: string } | null;
  profile: { username: string | null; display_name: string | null } | null;
}

interface AdminPhotosClientProps {
  initialPhotos: PendingPhoto[];
  filter: string;
  userId: string;
}

export default function AdminPhotosClient({ initialPhotos, filter, userId }: AdminPhotosClientProps) {
  const [photos, setPhotos] = useState<PendingPhoto[]>(initialPhotos);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleApprove = async (photoId: string) => {
    setActionLoading(photoId);
    setError(null);

    const { error: updateError } = await supabase
      .from('pub_photos')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: userId,
      })
      .eq('id', photoId);

    if (updateError) {
      setError(`Failed to approve photo: ${updateError.message}`);
    } else {
      setPhotos(photos.filter(p => p.id !== photoId));
    }
    setActionLoading(null);
  };

  const handleReject = async (photoId: string, storagePath: string) => {
    setActionLoading(photoId);
    setError(null);

    // Delete from storage first
    const { error: storageError } = await supabase.storage
      .from('pub-photos')
      .remove([storagePath]);

    if (storageError) {
      console.error('Failed to delete from storage:', storageError);
      // Continue anyway - the DB record should still be deleted
    }

    const { error: deleteError } = await supabase
      .from('pub_photos')
      .delete()
      .eq('id', photoId);

    if (deleteError) {
      setError(`Failed to reject photo: ${deleteError.message}`);
    } else {
      setPhotos(photos.filter(p => p.id !== photoId));
    }
    setActionLoading(null);
  };

  const getPhotoUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('pub-photos').getPublicUrl(storagePath);
    return data.publicUrl;
  };

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

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {photos.length === 0 ? (
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              <div className="p-4">
                <Link
                  href={`/pubs/${photo.pub_id}`}
                  className="text-cream-100 font-semibold hover:text-irish-green-500"
                >
                  {photo.pub?.name || 'Unknown Pub'}
                </Link>
                <p className="text-sm text-stout-400">
                  by {photo.profile?.display_name || photo.profile?.username || 'Anonymous'}
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
                      {actionLoading === photo.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(photo.id, photo.storage_path)}
                      disabled={actionLoading === photo.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-stout-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                    >
                      {actionLoading === photo.id ? 'Processing...' : 'Reject'}
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
