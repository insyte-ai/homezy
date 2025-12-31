'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { getPhotoById } from '@/lib/services/ideas';
import { PhotoCard } from '@/components/ideas/PhotoCard';
import { SaveButton } from '@/components/ideas/SaveButton';
import {
  ArrowLeft,
  Share2,
  User,
  CheckCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { ROOM_CATEGORY_CONFIG } from '@homezy/shared';
import type { PhotoDetailResponse } from '@homezy/shared';
import toast from 'react-hot-toast';

// Check if URL is localhost (for development)
const isLocalhostUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

export default function PhotoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const photoId = params.photoId as string;

  const [data, setData] = useState<PhotoDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!photoId) return;

    setLoading(true);
    getPhotoById(photoId)
      .then(setData)
      .catch((err) => {
        console.error('Failed to load photo:', err);
        setError('Photo not found');
      })
      .finally(() => setLoading(false));
  }, [photoId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.photo.projectTitle || 'Design Inspiration',
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
        <PublicFooter />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-4">{error || 'Photo not found'}</p>
          <button
            onClick={() => router.push('/ideas')}
            className="text-primary-600 hover:underline"
          >
            Back to Ideas
          </button>
        </div>
        <PublicFooter />
      </>
    );
  }

  const { photo, relatedPhotos, projectPhotos, isSaved } = data;

  // Get category labels
  const categoryLabels = photo.roomCategories
    .map((id) => ROOM_CATEGORY_CONFIG.find((c) => c.id === id)?.label)
    .filter(Boolean);

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50">
        {/* Page Actions Bar */}
        <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <SaveButton
                photoId={photo.id}
                initialSaved={isSaved}
                saveCount={photo.saveCount}
                variant="button"
                showCount
              />
              <button
                onClick={handleShare}
                className="flex items-center gap-2 rounded-lg px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Share2 className="h-5 w-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Photo */}
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={photo.imageUrl}
                alt={photo.caption || photo.projectTitle || 'Design photo'}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-contain"
                priority
                unoptimized={isLocalhostUrl(photo.imageUrl)}
              />
            </div>

            {/* Caption and categories */}
            <div className="mt-4">
              {photo.caption && (
                <p className="text-gray-700 text-lg">{photo.caption}</p>
              )}

              {/* Category tags */}
              {categoryLabels.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {categoryLabels.map((label) => (
                    <Link
                      key={label}
                      href={`/ideas?category=${photo.roomCategories.find(
                        (id) => ROOM_CATEGORY_CONFIG.find((c) => c.id === id)?.label === label
                      )}`}
                      className="px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700 hover:bg-gray-200"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}

              {/* Project info */}
              {photo.projectTitle && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">{photo.projectTitle}</h3>
                  {photo.projectDescription && (
                    <p className="text-sm text-gray-600 mt-1">{photo.projectDescription}</p>
                  )}
                </div>
              )}
            </div>

            {/* More from this project */}
            {projectPhotos.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  More from this project
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {projectPhotos.map((p) => {
                    const imgUrl = p.thumbnailUrl || p.imageUrl;
                    return (
                      <Link
                        key={p.id}
                        href={`/ideas/photo/${p.id}`}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                      >
                        <Image
                          src={imgUrl}
                          alt=""
                          fill
                          sizes="150px"
                          className="object-cover hover:scale-105 transition-transform"
                          unoptimized={isLocalhostUrl(imgUrl)}
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pro info sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              {/* Pro profile */}
              <div className="flex items-start gap-4">
                {photo.proProfilePhoto ? (
                  <Image
                    src={photo.proProfilePhoto}
                    alt={photo.businessName}
                    width={56}
                    height={56}
                    className="rounded-full"
                    unoptimized={isLocalhostUrl(photo.proProfilePhoto)}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-7 w-7 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {photo.businessName}
                  </h2>
                  {photo.proVerificationStatus === 'approved' && (
                    <div className="flex items-center gap-1 text-sm text-green-600 mt-0.5">
                      <CheckCircle className="h-4 w-4" />
                      <span>Verified Pro</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="mt-6 space-y-3">
                {photo.proSlug && (
                  <Link
                    href={`/pros/${photo.professionalId}/${photo.proSlug}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                  >
                    View Profile
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  href={`/get-quotes?proId=${photo.professionalId}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Related photos */}
        {relatedPhotos.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Related Photos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedPhotos.map((p) => (
                <PhotoCard key={p.id} photo={p} />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
      <PublicFooter />
    </>
  );
}
