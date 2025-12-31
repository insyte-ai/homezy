'use client';

import { useCallback, useEffect, useState } from 'react';
import { PhotoCard } from './PhotoCard';
import type { PortfolioPhoto } from '@homezy/shared';
import { Loader2 } from 'lucide-react';

interface IdeasGridProps {
  photos: PortfolioPhoto[];
  savedPhotoIds?: Set<string>;
  onSave?: (photoId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export function IdeasGrid({
  photos,
  savedPhotoIds = new Set(),
  onSave,
  onLoadMore,
  hasMore = false,
  loading = false,
}: IdeasGridProps) {
  const [sentinelRef, setSentinelRef] = useState<HTMLDivElement | null>(null);

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    if (!sentinelRef || !onLoadMore || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(sentinelRef);
    return () => observer.disconnect();
  }, [sentinelRef, onLoadMore, hasMore, loading]);

  if (photos.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg">No photos found</p>
        <p className="text-sm mt-1">Try selecting a different category</p>
      </div>
    );
  }

  return (
    <div>
      {/* Masonry-style grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {photos.map((photo, index) => (
          <div key={photo.id} className="break-inside-avoid">
            <PhotoCard
              photo={photo}
              onSave={onSave}
              isSaved={savedPhotoIds.has(photo.id)}
              priority={index < 8}
            />
          </div>
        ))}
      </div>

      {/* Loading indicator / Load more sentinel */}
      {hasMore && (
        <div ref={setSentinelRef} className="flex justify-center py-8">
          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more photos...</span>
            </div>
          )}
        </div>
      )}

      {/* Initial loading state */}
      {loading && photos.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
