'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageVariants {
  original: string;
  variants: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
  metadata: {
    width: number;
    height: number;
    aspectRatio: number;
  };
}

interface OptimizedImageProps {
  image: ImageVariants;
  alt: string;
  className?: string;
  priority?: boolean;
  mode?: 'fill' | 'responsive';
  width?: number;
}

export function OptimizedImage({
  image,
  alt,
  className = '',
  priority = false,
  mode = 'responsive',
  width,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Determine best source based on variants available
  const src =
    image.variants.large ||
    image.variants.medium ||
    image.variants.thumbnail ||
    image.original;

  // Calculate dimensions
  const imageWidth = width || image.metadata.width;
  const imageHeight = Math.round(imageWidth / image.metadata.aspectRatio);

  if (mode === 'fill') {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(
            'object-cover duration-700 ease-in-out',
            isLoading
              ? 'scale-110 blur-2xl grayscale'
              : 'scale-100 blur-0 grayscale-0'
          )}
          onLoadingComplete={() => setIsLoading(false)}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        // Prevent layout shift by setting aspect ratio container
        aspectRatio: image.metadata.aspectRatio,
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        className={cn(
          'object-cover duration-700 ease-in-out',
          isLoading
            ? 'scale-110 blur-2xl grayscale'
            : 'scale-100 blur-0 grayscale-0'
        )}
        onLoadingComplete={() => setIsLoading(false)}
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
