'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, User, Share2 } from 'lucide-react';
import type { IdeasPhoto } from '@homezy/shared';
import toast from 'react-hot-toast';

interface PhotoCardProps {
  photo: IdeasPhoto;
  onSave?: (photoId: string) => void;
  isSaved?: boolean;
  priority?: boolean;
}

// Check if URL is localhost (for development)
const isLocalhostUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

export function PhotoCard({ photo, onSave, isSaved = false, priority = false }: PhotoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageUrl = photo.thumbnailUrl || photo.imageUrl;
  const unoptimized = isLocalhostUrl(imageUrl);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/ideas/photo/${photo.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.projectTitle || photo.caption || 'Design Inspiration',
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/ideas/photo/${photo.id}`}>
        <div className="relative aspect-[4/3]">
          {!imageError ? (
            <Image
              src={imageUrl}
              alt={photo.caption || photo.projectTitle || 'Design photo'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
              unoptimized={unoptimized}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-200">
              <span className="text-gray-400">Image unavailable</span>
            </div>
          )}

          {/* Gradient overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </Link>

      {/* Action buttons on hover - top right */}
      <div
        className={`absolute right-2 top-2 flex items-center gap-1.5 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Share button */}
        <button
          onClick={handleShare}
          className="rounded-full bg-white/90 p-2 text-gray-700 hover:bg-white hover:text-gray-900 transition-colors shadow-sm"
          aria-label="Share photo"
        >
          <Share2 className="h-4 w-4" />
        </button>

        {/* Save button */}
        {onSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave(photo.id);
            }}
            className={`rounded-full p-2 transition-colors shadow-sm ${
              isSaved
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 text-gray-700 hover:bg-white hover:text-red-500'
            }`}
            aria-label={isSaved ? 'Unsave photo' : 'Save photo'}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Save count badge - top left */}
      {photo.saveCount > 0 && (
        <div
          className={`absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm transition-opacity duration-200 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <Heart className="h-3 w-3 fill-red-500 text-red-500" />
          {photo.saveCount}
        </div>
      )}

      {/* Pro info bar - always visible at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
        <Link
          href={photo.professionalId && photo.proSlug ? `/pros/${photo.professionalId}/${photo.proSlug}` : '#'}
          className="flex items-center gap-2 text-white hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {photo.proProfilePhoto ? (
            <Image
              src={photo.proProfilePhoto}
              alt={photo.businessName}
              width={24}
              height={24}
              className="rounded-full border border-white/30"
              unoptimized={isLocalhostUrl(photo.proProfilePhoto)}
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <User className="h-3 w-3" />
            </div>
          )}
          <span className="text-sm font-medium truncate drop-shadow-sm">
            {photo.businessName}
          </span>
        </Link>
      </div>
    </div>
  );
}
