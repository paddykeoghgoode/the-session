'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

// Base64 encoded 1x1 pixel placeholder for blur effect
const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Default fallback image (pint icon)
const DEFAULT_FALLBACK = '/pint.svg';

export default function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc = DEFAULT_FALLBACK,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-stout-800',
          className
        )}
      >
        <Image
          src={fallbackSrc}
          alt={alt}
          width={48}
          height={48}
          className="opacity-30"
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoading ? 'opacity-0' : 'opacity-100',
        className
      )}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}

// Specialized component for pub photos
export function PubPhoto({
  storagePath,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, 'src'> & { storagePath: string }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const src = `${supabaseUrl}/storage/v1/object/public/pub-photos/${storagePath}`;

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      {...props}
    />
  );
}
