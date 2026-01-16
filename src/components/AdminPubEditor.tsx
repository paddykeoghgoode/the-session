'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Pub, AmenityKey } from '@/types';

interface AdminPubEditorProps {
  pub: Pub;
  onUpdate?: (updatedPub: Pub) => void;
}

type EditableField = 'name' | 'address' | 'phone' | 'website' | 'email' | 'facebook' | 'instagram' | 'twitter' | 'eircode';

const MODERATION_STATUSES = [
  { value: 'active', label: 'Active', color: 'irish-green' },
  { value: 'temporarily_closed', label: 'Temporarily Closed', color: 'amber' },
  { value: 'renovating', label: 'Renovating', color: 'blue' },
  { value: 'members_only', label: 'Members Only', color: 'purple' },
  { value: 'permanently_closed', label: 'Permanently Closed', color: 'red' },
] as const;

export default function AdminPubEditor({ pub, onUpdate }: AdminPubEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [formData, setFormData] = useState({
    name: pub.name,
    address: pub.address,
    phone: pub.phone || '',
    website: pub.website || '',
    email: pub.email || '',
    facebook: pub.facebook || '',
    instagram: pub.instagram || '',
    twitter: pub.twitter || '',
    eircode: pub.eircode || '',
  });
  const [amenities, setAmenities] = useState({
    has_food: pub.has_food,
    has_outdoor_seating: pub.has_outdoor_seating,
    shows_sports: pub.shows_sports,
    has_live_music: pub.has_live_music,
    has_pool: pub.has_pool,
    has_darts: pub.has_darts,
    has_board_games: pub.has_board_games,
    is_speakeasy: pub.is_speakeasy,
  });
  const [isActive, setIsActive] = useState(pub.is_active);
  const [moderationStatus, setModerationStatus] = useState(pub.moderation_status);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleFieldSave = async (field: EditableField) => {
    setIsSaving(true);
    setError(null);

    try {
      const updateData = { [field]: formData[field] || null };
      const { error: updateError } = await supabase
        .from('pubs')
        .update(updateData)
        .eq('id', pub.id);

      if (updateError) throw updateError;

      setEditingField(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      if (onUpdate) {
        onUpdate({ ...pub, ...updateData });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAmenityToggle = async (amenity: AmenityKey) => {
    setIsSaving(true);
    setError(null);

    const newValue = !amenities[amenity];

    try {
      const { error: updateError } = await supabase
        .from('pubs')
        .update({ [amenity]: newValue })
        .eq('id', pub.id);

      if (updateError) throw updateError;

      setAmenities(prev => ({ ...prev, [amenity]: newValue }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      if (onUpdate) {
        onUpdate({ ...pub, [amenity]: newValue });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivationToggle = async () => {
    setIsSaving(true);
    setError(null);

    const newIsActive = !isActive;

    try {
      const updateData = {
        is_active: newIsActive,
        deactivated_at: newIsActive ? null : new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('pubs')
        .update(updateData)
        .eq('id', pub.id);

      if (updateError) throw updateError;

      setIsActive(newIsActive);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      if (onUpdate) {
        onUpdate({ ...pub, is_active: newIsActive });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (status: typeof moderationStatus) => {
    setIsSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('pubs')
        .update({ moderation_status: status })
        .eq('id', pub.id);

      if (updateError) throw updateError;

      setModerationStatus(status);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      if (onUpdate) {
        onUpdate({ ...pub, moderation_status: status });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditableField = (field: EditableField, label: string, type: 'text' | 'tel' | 'url' | 'email' = 'text') => {
    const isFieldEditing = editingField === field;

    return (
      <div className="flex items-center gap-2 py-1">
        <span className="text-sm text-stout-400 w-20">{label}:</span>
        {isFieldEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type={type}
              value={formData[field]}
              onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
              className="flex-1 px-2 py-1 bg-stout-700 border border-stout-600 rounded text-cream-100 text-sm focus:outline-none focus:border-irish-green-500"
              autoFocus
            />
            <button
              onClick={() => handleFieldSave(field)}
              disabled={isSaving}
              className="px-2 py-1 bg-irish-green-600 hover:bg-irish-green-700 text-white text-xs rounded transition-colors"
            >
              {isSaving ? '...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setEditingField(null);
                setFormData(prev => ({ ...prev, [field]: (pub[field] as string) || '' }));
              }}
              className="px-2 py-1 bg-stout-600 hover:bg-stout-500 text-cream-100 text-xs rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <span className={`text-sm ${formData[field] ? 'text-cream-100' : 'text-stout-500 italic'}`}>
              {formData[field] || 'Not set'}
            </span>
            <button
              onClick={() => setEditingField(field)}
              className="p-1 text-stout-400 hover:text-cream-100 transition-colors"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Admin Edit
      </button>
    );
  }

  return (
    <div className="bg-amber-900/20 border border-amber-600 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Admin Editing
        </h3>
        <button
          onClick={() => setIsEditing(false)}
          className="text-stout-400 hover:text-cream-100"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="mb-4 px-3 py-2 bg-irish-green-500/20 border border-irish-green-500 text-irish-green-400 text-sm rounded flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Saved successfully
        </div>
      )}

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-500/20 border border-red-500 text-red-400 text-sm rounded">
          {error}
        </div>
      )}

      {/* Activation Toggle */}
      <div className="mb-4 pb-4 border-b border-stout-700">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-cream-100">Pub Visibility</span>
            <p className="text-xs text-stout-400">
              {isActive ? 'Visible to all users' : 'Hidden from public view'}
            </p>
          </div>
          <button
            onClick={handleActivationToggle}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? 'bg-irish-green-600' : 'bg-stout-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Moderation Status */}
      <div className="mb-4 pb-4 border-b border-stout-700">
        <label className="block text-sm font-medium text-cream-100 mb-2">Status</label>
        <div className="flex flex-wrap gap-2">
          {MODERATION_STATUSES.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => handleStatusChange(value)}
              disabled={isSaving}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                moderationStatus === value
                  ? `bg-${color}-600 text-white`
                  : 'bg-stout-700 text-stout-300 hover:bg-stout-600'
              }`}
              style={moderationStatus === value ? {
                backgroundColor: color === 'irish-green' ? '#16a34a' :
                                color === 'amber' ? '#d97706' :
                                color === 'blue' ? '#2563eb' :
                                color === 'purple' ? '#9333ea' :
                                '#dc2626'
              } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div className="mb-4 pb-4 border-b border-stout-700">
        <h4 className="text-sm font-medium text-cream-100 mb-2">Basic Info</h4>
        {renderEditableField('name', 'Name')}
        {renderEditableField('address', 'Address')}
        {renderEditableField('eircode', 'Eircode')}
      </div>

      {/* Contact Info */}
      <div className="mb-4 pb-4 border-b border-stout-700">
        <h4 className="text-sm font-medium text-cream-100 mb-2">Contact</h4>
        {renderEditableField('phone', 'Phone', 'tel')}
        {renderEditableField('email', 'Email', 'email')}
        {renderEditableField('website', 'Website', 'url')}
      </div>

      {/* Social Links */}
      <div className="mb-4 pb-4 border-b border-stout-700">
        <h4 className="text-sm font-medium text-cream-100 mb-2">Social</h4>
        {renderEditableField('facebook', 'Facebook', 'url')}
        {renderEditableField('instagram', 'Instagram')}
        {renderEditableField('twitter', 'Twitter')}
      </div>

      {/* Amenities */}
      <div>
        <h4 className="text-sm font-medium text-cream-100 mb-2">Amenities</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'has_food' as AmenityKey, label: 'Serves Food', icon: '🍴' },
            { key: 'has_live_music' as AmenityKey, label: 'Live Music', icon: '🎵' },
            { key: 'shows_sports' as AmenityKey, label: 'Shows Sports', icon: '⚽' },
            { key: 'has_outdoor_seating' as AmenityKey, label: 'Outdoor Seating', icon: '🌳' },
            { key: 'has_pool' as AmenityKey, label: 'Pool Table', icon: '🎱' },
            { key: 'has_darts' as AmenityKey, label: 'Darts', icon: '🎯' },
            { key: 'has_board_games' as AmenityKey, label: 'Board Games', icon: '🎲' },
            { key: 'is_speakeasy' as AmenityKey, label: 'Speakeasy', icon: '🕵️' },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => handleAmenityToggle(key)}
              disabled={isSaving}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                amenities[key]
                  ? 'bg-irish-green-600/20 border border-irish-green-600 text-irish-green-400'
                  : 'bg-stout-700 border border-stout-600 text-stout-400'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
              {amenities[key] && (
                <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
