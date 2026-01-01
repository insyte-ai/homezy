'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  getIdeasStats,
  listIdeasPhotos,
  updateIdeasPhotoStatus,
  bulkUpdateIdeasPhotoStatus,
  publishPhotoToIdeas,
  unpublishPhotoFromIdeas,
  bulkPublishToIdeas,
  bulkUnpublishFromIdeas,
  type ListIdeasPhotosParams,
} from '@/lib/services/admin';
import type { AdminIdeasPhoto, AdminIdeasStats, AdminPhotoStatus, RoomCategory } from '@homezy/shared';
import { ROOM_CATEGORY_CONFIG } from '@homezy/shared';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  PhotoIcon,
  ArrowUpOnSquareIcon,
  ArrowDownOnSquareIcon,
} from '@heroicons/react/24/outline';
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

type SortOption = 'newest' | 'popular' | 'mostSaved';

export default function IdeasModerationPage() {
  const [photos, setPhotos] = useState<AdminIdeasPhoto[]>([]);
  const [stats, setStats] = useState<AdminIdeasStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  // Filters
  const [statusFilter, setStatusFilter] = useState<AdminPhotoStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<RoomCategory | ''>('');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Selection for bulk actions
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  // Modal state
  const [viewingPhoto, setViewingPhoto] = useState<AdminIdeasPhoto | null>(null);
  const [removalReason, setRemovalReason] = useState('');
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [targetPhoto, setTargetPhoto] = useState<AdminIdeasPhoto | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await getIdeasStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  const loadPhotos = useCallback(async (reset = true) => {
    try {
      if (reset) {
        setLoading(true);
        setSelectedPhotos(new Set());
      } else {
        setLoadingMore(true);
      }

      const params: ListIdeasPhotosParams = {
        limit: 50,
        sort: sortOption,
      };

      if (statusFilter) {
        params.adminStatus = statusFilter;
      }
      if (categoryFilter) {
        params.roomCategory = categoryFilter;
      }
      if (publishedFilter !== 'all') {
        params.publishedToIdeas = publishedFilter === 'published';
      }
      if (!reset && nextCursor) {
        params.cursor = nextCursor;
      }

      const response = await listIdeasPhotos(params);

      if (reset) {
        setPhotos(response.photos);
      } else {
        setPhotos((prev) => [...prev, ...response.photos]);
      }

      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to load photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [statusFilter, categoryFilter, publishedFilter, sortOption, nextCursor]);

  useEffect(() => {
    loadStats();
    loadPhotos(true);
  }, [statusFilter, categoryFilter, publishedFilter, sortOption]);

  const handleSelectPhoto = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map((p) => p.id)));
    }
  };

  const handleUpdateStatus = async (
    photo: AdminIdeasPhoto,
    status: AdminPhotoStatus,
    reason?: string
  ) => {
    try {
      await updateIdeasPhotoStatus(photo.projectId, photo.photoId, status, reason);

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, adminStatus: status } : p
        )
      );

      toast.success(`Photo ${status === 'removed' ? 'removed' : status === 'active' ? 'restored' : 'flagged'}`);
      loadStats();
    } catch (error) {
      toast.error('Failed to update photo status');
    }
  };

  const handleBulkUpdateStatus = async (status: AdminPhotoStatus, reason?: string) => {
    if (selectedPhotos.size === 0) {
      toast.error('No photos selected');
      return;
    }

    const photosToUpdate = photos
      .filter((p) => selectedPhotos.has(p.id))
      .map((p) => ({ projectId: p.projectId, photoId: p.photoId }));

    try {
      const result = await bulkUpdateIdeasPhotoStatus(photosToUpdate, status, reason);

      setPhotos((prev) =>
        prev.map((p) =>
          selectedPhotos.has(p.id) ? { ...p, adminStatus: status } : p
        )
      );

      setSelectedPhotos(new Set());
      toast.success(`${result.updatedCount} photos updated`);
      loadStats();
    } catch (error) {
      toast.error('Failed to update photos');
    }
  };

  const openRemovalModal = (photo?: AdminIdeasPhoto) => {
    setTargetPhoto(photo || null);
    setRemovalReason('');
    setShowRemovalModal(true);
  };

  const confirmRemoval = () => {
    if (targetPhoto) {
      handleUpdateStatus(targetPhoto, 'removed', removalReason);
    } else {
      handleBulkUpdateStatus('removed', removalReason);
    }
    setShowRemovalModal(false);
    setTargetPhoto(null);
    setRemovalReason('');
  };

  const handlePublish = async (photo: AdminIdeasPhoto) => {
    try {
      await publishPhotoToIdeas(photo.projectId, photo.photoId);
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, isPublishedToIdeas: true } : p
        )
      );
      toast.success('Photo published to Ideas');
      loadStats();
    } catch (error) {
      toast.error('Failed to publish photo');
    }
  };

  const handleUnpublish = async (photo: AdminIdeasPhoto) => {
    try {
      await unpublishPhotoFromIdeas(photo.projectId, photo.photoId);
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, isPublishedToIdeas: false } : p
        )
      );
      toast.success('Photo unpublished from Ideas');
      loadStats();
    } catch (error) {
      toast.error('Failed to unpublish photo');
    }
  };

  const handleBulkPublish = async () => {
    if (selectedPhotos.size === 0) {
      toast.error('No photos selected');
      return;
    }

    const photosToUpdate = photos
      .filter((p) => selectedPhotos.has(p.id))
      .map((p) => ({ projectId: p.projectId, photoId: p.photoId }));

    try {
      const result = await bulkPublishToIdeas(photosToUpdate);
      setPhotos((prev) =>
        prev.map((p) =>
          selectedPhotos.has(p.id) ? { ...p, isPublishedToIdeas: true } : p
        )
      );
      setSelectedPhotos(new Set());
      toast.success(`${result.updatedCount} photos published to Ideas`);
      loadStats();
    } catch (error) {
      toast.error('Failed to publish photos');
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedPhotos.size === 0) {
      toast.error('No photos selected');
      return;
    }

    const photosToUpdate = photos
      .filter((p) => selectedPhotos.has(p.id))
      .map((p) => ({ projectId: p.projectId, photoId: p.photoId }));

    try {
      const result = await bulkUnpublishFromIdeas(photosToUpdate);
      setPhotos((prev) =>
        prev.map((p) =>
          selectedPhotos.has(p.id) ? { ...p, isPublishedToIdeas: false } : p
        )
      );
      setSelectedPhotos(new Set());
      toast.success(`${result.updatedCount} photos unpublished from Ideas`);
      loadStats();
    } catch (error) {
      toast.error('Failed to unpublish photos');
    }
  };

  const getStatusBadge = (status: AdminPhotoStatus) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      flagged: 'bg-yellow-100 text-yellow-700',
      removed: 'bg-red-100 text-red-700',
    };
    return styles[status];
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ideas Moderation</h1>
        <p className="text-gray-600 mt-1">
          Review and moderate photos published to the Ideas page
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {stats.totalPublished.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
              <div className="text-sm text-gray-600">Flagged</div>
            </div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">
              {stats.totalFlagged.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <TrashIcon className="h-5 w-5 text-red-500" />
              <div className="text-sm text-gray-600">Removed</div>
            </div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {stats.totalRemoved.toLocaleString()}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <PhotoIcon className="h-5 w-5 text-primary-500" />
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="text-2xl font-bold text-primary-600 mt-1">
              {stats.totalProjects.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        {/* Status filter */}
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AdminPhotoStatus | '')}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="flagged">Flagged</option>
            <option value="removed">Removed</option>
          </select>
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as RoomCategory | '')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
        >
          <option value="">All Categories</option>
          {ROOM_CATEGORY_CONFIG.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* Published filter */}
        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value as 'all' | 'published' | 'unpublished')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
        >
          <option value="all">All Photos</option>
          <option value="published">On Ideas</option>
          <option value="unpublished">Not on Ideas</option>
        </select>

        {/* Sort */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Viewed</option>
          <option value="mostSaved">Most Saved</option>
        </select>

        <div className="flex-1" />

        {/* Bulk actions */}
        {selectedPhotos.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedPhotos.size} selected
            </span>
            <button
              onClick={handleBulkPublish}
              className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200"
            >
              Publish
            </button>
            <button
              onClick={handleBulkUnpublish}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Unpublish
            </button>
            <button
              onClick={() => handleBulkUpdateStatus('flagged')}
              className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200"
            >
              Flag
            </button>
            <button
              onClick={() => openRemovalModal()}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Select all */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedPhotos.size === photos.length && photos.length > 0}
          onChange={handleSelectAll}
          className="h-4 w-4 text-primary-600 rounded border-gray-300"
        />
        <span className="text-sm text-gray-600">Select all</span>
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">No photos found matching your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`relative group border rounded-lg overflow-hidden bg-white ${
                  selectedPhotos.has(photo.id) ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {/* Selection checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.has(photo.id)}
                    onChange={() => handleSelectPhoto(photo.id)}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300 bg-white"
                  />
                </div>

                {/* Status badges */}
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      photo.isPublishedToIdeas
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {photo.isPublishedToIdeas ? 'On Ideas' : 'Not Published'}
                  </span>
                  {photo.adminStatus !== 'active' && (
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusBadge(
                        photo.adminStatus
                      )}`}
                    >
                      {photo.adminStatus}
                    </span>
                  )}
                </div>

                {/* Image */}
                <div
                  className="relative aspect-square bg-gray-100 cursor-pointer"
                  onClick={() => setViewingPhoto(photo)}
                >
                  <Image
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 16vw"
                    className="object-cover"
                    unoptimized={isLocalhostUrl(photo.thumbnailUrl || photo.imageUrl)}
                  />

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingPhoto(photo);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="View"
                    >
                      <EyeIcon className="h-5 w-5 text-gray-700" />
                    </button>
                    {!photo.isPublishedToIdeas && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublish(photo);
                        }}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title="Publish to Ideas"
                      >
                        <ArrowUpOnSquareIcon className="h-5 w-5 text-primary-600" />
                      </button>
                    )}
                    {photo.isPublishedToIdeas && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnpublish(photo);
                        }}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title="Unpublish from Ideas"
                      >
                        <ArrowDownOnSquareIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    )}
                    {photo.adminStatus !== 'flagged' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(photo, 'flagged');
                        }}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title="Flag"
                      >
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                      </button>
                    )}
                    {photo.adminStatus !== 'removed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRemovalModal(photo);
                        }}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title="Remove"
                      >
                        <TrashIcon className="h-5 w-5 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-2">
                  <div className="text-xs text-gray-900 font-medium truncate">
                    {photo.businessName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {photo.projectName}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {photo.roomCategories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className="px-1.5 py-0.5 bg-primary-50 text-primary-700 text-[10px] rounded"
                      >
                        {ROOM_CATEGORY_CONFIG.find((c) => c.id === cat)?.label || cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => loadPhotos(false)}
                disabled={loadingMore}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loadingMore ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin inline mr-2" />
                ) : null}
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* Photo Detail Modal */}
      {viewingPhoto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Photo Details</h2>
              <button
                onClick={() => setViewingPhoto(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={viewingPhoto.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={isLocalhostUrl(viewingPhoto.imageUrl)}
                  />
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded ${getStatusBadge(
                        viewingPhoto.adminStatus
                      )}`}
                    >
                      {viewingPhoto.adminStatus.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Business</label>
                    <p className="font-medium text-gray-900">
                      {viewingPhoto.businessName}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Project</label>
                    <p className="text-gray-900">{viewingPhoto.projectName}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Room Categories</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {viewingPhoto.roomCategories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-sm rounded"
                        >
                          {ROOM_CATEGORY_CONFIG.find((c) => c.id === cat)?.label || cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Views</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {viewingPhoto.viewCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Saves</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {viewingPhoto.saveCount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500">Uploaded</label>
                    <p className="text-gray-900">
                      {new Date(viewingPhoto.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {viewingPhoto.adminStatus !== 'active' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(viewingPhoto, 'active');
                          setViewingPhoto(null);
                        }}
                        className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200"
                      >
                        Restore
                      </button>
                    )}
                    {viewingPhoto.adminStatus !== 'flagged' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(viewingPhoto, 'flagged');
                          setViewingPhoto(null);
                        }}
                        className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200"
                      >
                        Flag
                      </button>
                    )}
                    {viewingPhoto.adminStatus !== 'removed' && (
                      <button
                        onClick={() => {
                          setViewingPhoto(null);
                          openRemovalModal(viewingPhoto);
                        }}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {viewingPhoto.proSlug && (
                    <a
                      href={`/pros/${viewingPhoto.proSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-sm text-primary-600 hover:underline"
                    >
                      View Professional Profile
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Removal Reason Modal */}
      {showRemovalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {targetPhoto ? 'Remove Photo' : `Remove ${selectedPhotos.size} Photos`}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Removal Reason (optional)
              </label>
              <textarea
                value={removalReason}
                onChange={(e) => setRemovalReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="e.g., Inappropriate content, Copyrighted image..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemovalModal(false);
                  setTargetPhoto(null);
                  setRemovalReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoval}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
