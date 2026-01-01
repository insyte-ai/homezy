'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { CategoryPills } from '@/components/ideas/CategoryPills';
import { IdeasGrid } from '@/components/ideas/IdeasGrid';
import { listIdeas, getCategoryCounts, savePhoto, unsavePhoto } from '@/lib/services/ideas';
import type { IdeasPhoto, RoomCategory, CategoryCount } from '@homezy/shared';
import { useAuthStore } from '@/store/authStore';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function IdeasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // State
  const [photos, setPhotos] = useState<IdeasPhoto[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [savedPhotoIds, setSavedPhotoIds] = useState<Set<string>>(new Set());

  // Get filter params from URL
  const categoryParam = searchParams.get('category') as RoomCategory | null;
  const sortParam = (searchParams.get('sort') as 'newest' | 'popular') || 'newest';

  // Load category counts once
  useEffect(() => {
    getCategoryCounts()
      .then(setCategoryCounts)
      .catch((err) => console.error('Failed to load category counts:', err));
  }, []);

  // Load photos when filters change
  useEffect(() => {
    setLoading(true);
    setPhotos([]);
    setNextCursor(undefined);

    listIdeas({
      category: categoryParam || undefined,
      sort: sortParam,
      limit: 24,
    })
      .then((result) => {
        setPhotos(result.photos);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      })
      .catch((err) => {
        console.error('Failed to load ideas:', err);
        toast.error('Failed to load photos');
      })
      .finally(() => setLoading(false));
  }, [categoryParam, sortParam]);

  // Load more photos
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || !nextCursor) return;

    setLoadingMore(true);
    listIdeas({
      category: categoryParam || undefined,
      sort: sortParam,
      cursor: nextCursor,
      limit: 24,
    })
      .then((result) => {
        setPhotos((prev) => [...prev, ...result.photos]);
        setNextCursor(result.nextCursor);
        setHasMore(result.hasMore);
      })
      .catch((err) => {
        console.error('Failed to load more:', err);
      })
      .finally(() => setLoadingMore(false));
  }, [categoryParam, sortParam, nextCursor, hasMore, loadingMore]);

  // Handle category change
  const handleCategoryChange = (category: RoomCategory | null) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.push(`/ideas?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (sort: 'newest' | 'popular') => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    router.push(`/ideas?${params.toString()}`);
  };

  // Handle save/unsave
  const handleSave = async (photoId: string) => {
    if (!user) {
      router.push('/auth/login?redirect=' + encodeURIComponent('/ideas'));
      return;
    }

    try {
      if (savedPhotoIds.has(photoId)) {
        await unsavePhoto(photoId);
        setSavedPhotoIds((prev) => {
          const next = new Set(prev);
          next.delete(photoId);
          return next;
        });
        toast.success('Removed from My Ideas');
      } else {
        await savePhoto(photoId);
        setSavedPhotoIds((prev) => new Set(prev).add(photoId));
        toast.success('Saved to My Ideas');
      }
    } catch (error) {
      toast.error('Failed to save photo');
    }
  };

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title and sort */}
            <div className="flex items-center justify-between py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ideas</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Get inspired by beautiful home designs
                </p>
              </div>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                <select
                  value={sortParam}
                  onChange={(e) => handleSortChange(e.target.value as 'newest' | 'popular')}
                  className="text-sm border-none bg-transparent font-medium text-gray-700 focus:ring-0 cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Category pills */}
            <div className="pb-4">
              <CategoryPills
                selectedCategory={categoryParam}
                onSelectCategory={handleCategoryChange}
                categoryCounts={categoryCounts}
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <IdeasGrid
            photos={photos}
            savedPhotoIds={savedPhotoIds}
            onSave={handleSave}
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={loading || loadingMore}
          />
        </div>
      </div>
      <PublicFooter />
    </>
  );
}

function IdeasLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
    </div>
  );
}

export default function IdeasPage() {
  return (
    <Suspense fallback={<IdeasLoading />}>
      <IdeasContent />
    </Suspense>
  );
}
