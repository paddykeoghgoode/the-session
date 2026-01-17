'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface PubFormData {
  name: string;
  address: string;
  eircode: string;
  latitude: string;
  longitude: string;
  phone: string;
  website: string;
  has_food: boolean;
  has_outdoor_seating: boolean;
  shows_sports: boolean;
  has_live_music: boolean;
  is_late_bar: boolean;
  is_dog_friendly: boolean;
}

const initialFormData: PubFormData = {
  name: '',
  address: '',
  eircode: '',
  latitude: '',
  longitude: '',
  phone: '',
  website: '',
  has_food: false,
  has_outdoor_seating: false,
  shows_sports: false,
  has_live_music: false,
  is_late_bar: false,
  is_dog_friendly: false,
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminPubsPage() {
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState<PubFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAdmin() {
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
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      }
    }

    checkAdmin();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!formData.name || !formData.address) {
      setError('Name and address are required');
      setIsSubmitting(false);
      return;
    }

    const slug = generateSlug(formData.name);

    const pubData = {
      name: formData.name,
      slug,
      address: formData.address,
      eircode: formData.eircode || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      phone: formData.phone || null,
      website: formData.website || null,
      has_food: formData.has_food,
      has_outdoor_seating: formData.has_outdoor_seating,
      shows_sports: formData.shows_sports,
      has_live_music: formData.has_live_music,
      is_late_bar: formData.is_late_bar,
      is_dog_friendly: formData.is_dog_friendly,
      is_active: true,
      moderation_status: 'active',
    };

    const { data, error: insertError } = await supabase
      .from('pubs')
      .insert(pubData)
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(`Pub "${formData.name}" created successfully!`);
      setFormData(initialFormData);
      setTimeout(() => {
        router.push(`/pubs/${data.slug}`);
      }, 1500);
    }

    setIsSubmitting(false);
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link href="/admin" className="text-irish-green-500 hover:text-irish-green-400 text-sm mb-2 inline-block">
          &larr; Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-cream-100">Add New Pub</h1>
        <p className="text-stout-400 mt-2">Manually add a pub that isn&apos;t in the database</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/20 border border-green-500 text-green-400 rounded-lg">
            {success}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-cream-100 mb-4">Basic Information</h2>

          <div>
            <label className="block text-sm text-stout-400 mb-1">Pub Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
              placeholder="e.g., The Crafty Fox"
            />
          </div>

          <div>
            <label className="block text-sm text-stout-400 mb-1">Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
              className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
              placeholder="e.g., 123 Main Street, Dublin 2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-stout-400 mb-1">Eircode</label>
              <input
                type="text"
                value={formData.eircode}
                onChange={(e) => setFormData(prev => ({ ...prev, eircode: e.target.value }))}
                className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
                placeholder="e.g., D02 X123"
              />
            </div>
            <div>
              <label className="block text-sm text-stout-400 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
                placeholder="e.g., 01 123 4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-stout-400 mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
              placeholder="https://"
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-cream-100 mb-4">Location (Optional)</h2>
          <p className="text-sm text-stout-400 mb-4">
            Add coordinates for map display. You can find these on Google Maps by right-clicking on the location.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-stout-400 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
                placeholder="e.g., 53.3498"
              />
            </div>
            <div>
              <label className="block text-sm text-stout-400 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 focus:outline-none focus:border-irish-green-500"
                placeholder="e.g., -6.2603"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-stout-800 rounded-lg border border-stout-700 p-6">
          <h2 className="text-lg font-semibold text-cream-100 mb-4">Amenities</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.has_food}
                onChange={(e) => setFormData(prev => ({ ...prev, has_food: e.target.checked }))}
                className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
              />
              <span className="text-cream-100">🍴 Serves Food</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.has_outdoor_seating}
                onChange={(e) => setFormData(prev => ({ ...prev, has_outdoor_seating: e.target.checked }))}
                className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
              />
              <span className="text-cream-100">🌳 Outdoor Seating</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.shows_sports}
                onChange={(e) => setFormData(prev => ({ ...prev, shows_sports: e.target.checked }))}
                className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
              />
              <span className="text-cream-100">⚽ Shows Sports</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.has_live_music}
                onChange={(e) => setFormData(prev => ({ ...prev, has_live_music: e.target.checked }))}
                className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
              />
              <span className="text-cream-100">🎵 Live Music</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_late_bar}
                onChange={(e) => setFormData(prev => ({ ...prev, is_late_bar: e.target.checked }))}
                className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
              />
              <span className="text-cream-100">🌙 Late Bar</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_dog_friendly}
                onChange={(e) => setFormData(prev => ({ ...prev, is_dog_friendly: e.target.checked }))}
                className="w-4 h-4 rounded border-stout-600 bg-stout-700 text-irish-green-600"
              />
              <span className="text-cream-100">🐕 Dog Friendly</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-irish-green-600 hover:bg-irish-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Pub'}
          </button>
          <Link
            href="/admin"
            className="px-6 py-3 bg-stout-700 text-stout-300 rounded-lg hover:bg-stout-600 transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
