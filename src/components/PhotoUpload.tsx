'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import Image from 'next/image';

interface PhotoUploadProps {
  pubId: string;
  userId: string;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 1920; // Max width/height
const JPEG_QUALITY = 0.8;

export default function PhotoUpload({ pubId, userId, onSuccess }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Compress and resize image
  const compressImage = (file: File): Promise<{ blob: Blob; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = (height / width) * MAX_DIMENSION;
            width = MAX_DIMENSION;
          } else {
            width = (width / height) * MAX_DIMENSION;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, width: Math.round(width), height: Math.round(height) });
            } else {
              reject(new Error('Could not compress image'));
            }
          },
          'image/jpeg',
          JPEG_QUALITY
        );
      };

      img.onerror = () => reject(new Error('Could not load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Check file size before compression
    if (file.size > MAX_FILE_SIZE * 2) {
      setError('Image is too large. Maximum size is 10MB before compression.');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !preview) return;

    setIsUploading(true);
    setError(null);

    try {
      // Check upload limit
      const { data: canUpload, error: limitError } = await supabase
        .rpc('check_upload_limit', { user_uuid: userId, max_daily: 5 });

      if (limitError || !canUpload) {
        setError('Daily upload limit reached (5 photos per day). Try again tomorrow!');
        setIsUploading(false);
        return;
      }

      // Compress image
      const { blob, width, height } = await compressImage(file);

      // Check compressed size
      if (blob.size > MAX_FILE_SIZE) {
        setError('Image is still too large after compression. Try a smaller image.');
        setIsUploading(false);
        return;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${pubId}/${userId}/${timestamp}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('pub-photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          cacheControl: '31536000', // 1 year cache
        });

      if (uploadError) {
        throw uploadError;
      }

      // Create database record
      const { error: dbError } = await supabase.from('pub_photos').insert({
        pub_id: pubId,
        user_id: userId,
        storage_path: filename,
        original_filename: file.name,
        file_size: blob.size,
        width,
        height,
        caption: caption.trim() || null,
      });

      if (dbError) {
        // Try to clean up uploaded file
        await supabase.storage.from('pub-photos').remove([filename]);
        throw dbError;
      }

      setSuccess(true);
      setPreview(null);
      setCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setCaption('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-stout-800 rounded-lg border border-stout-700 p-4">
      <h3 className="text-lg font-semibold text-cream-100 mb-4">Add a Photo</h3>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-irish-green-500/10 border border-irish-green-500 text-irish-green-400 px-3 py-2 rounded text-sm">
          Photo uploaded! It will appear after admin approval.
        </div>
      )}

      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stout-600 rounded-lg cursor-pointer hover:border-stout-500 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-2 text-stout-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-stout-400">Click to upload a photo</p>
            <p className="text-xs text-stout-500 mt-1">JPEG, PNG, WebP (max 5MB)</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative aspect-video bg-stout-900 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>

          {/* Caption */}
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption (optional)"
            maxLength={200}
            className="w-full px-4 py-2 bg-stout-700 border border-stout-600 rounded-lg text-cream-100 placeholder-stout-400 focus:outline-none focus:border-irish-green-500 text-sm"
          />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-irish-green-600 hover:bg-irish-green-700 disabled:bg-stout-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="px-4 py-2 bg-stout-700 hover:bg-stout-600 text-cream-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-stout-500 text-center">
            Photos are reviewed before appearing. Max 5 uploads per day.
          </p>
        </div>
      )}
    </div>
  );
}
