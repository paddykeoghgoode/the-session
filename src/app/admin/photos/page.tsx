import { redirect } from 'next/navigation';
import { createServerSupabaseClient, getUser } from '@/lib/supabase-server';
import AdminPhotosClient from './AdminPhotosClient';

export const dynamic = 'force-dynamic';

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

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
  return data?.is_admin === true;
}

async function getPhotos(filter: string): Promise<PendingPhoto[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('pub_photos')
    .select(`
      id,
      pub_id,
      storage_path,
      caption,
      file_size,
      created_at,
      is_approved,
      pub:pubs!inner(name),
      profile:profiles!inner(username, display_name)
    `)
    .order('created_at', { ascending: false });

  if (filter === 'pending') {
    query = query.eq('is_approved', false);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('Failed to fetch photos:', error);
    return [];
  }

  // Transform the data to flatten the joined objects
  return (data || []).map(photo => ({
    ...photo,
    pub: Array.isArray(photo.pub) ? photo.pub[0] : photo.pub,
    profile: Array.isArray(photo.profile) ? photo.profile[0] : photo.profile,
  })) as PendingPhoto[];
}

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function AdminPhotosPage({ searchParams }: PageProps) {
  const user = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect('/');
  }

  const params = await searchParams;
  const filter = params.filter || 'pending';
  const photos = await getPhotos(filter);

  return <AdminPhotosClient initialPhotos={photos} filter={filter} userId={user.id} />;
}
