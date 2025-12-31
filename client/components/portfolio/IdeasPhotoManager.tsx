'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  listMyPhotos,
  createPhoto,
  updatePhoto,
  deletePhoto,
  togglePublish,
  type PortfolioPhoto,
} from '@/lib/services/ideas';
import { uploadPortfolioImages } from '@/lib/services/professional';
import { ROOM_CATEGORY_CONFIG, type RoomCategory } from '@homezy/shared';
import {
  Upload,
  X,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Loader2,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
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

interface IdeasPhotoManagerProps {
  onPhotoCountChange?: (count: number) => void;
}

export function IdeasPhotoManager({ onPhotoCountChange }: IdeasPhotoManagerProps) {
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PortfolioPhoto | null>(null);

  // Upload form state
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<RoomCategory[]>([]);
  const [caption, setCaption] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const result = await listMyPhotos();
      setPhotos(result.photos);
      onPhotoCountChange?.(result.total);
    } catch (error) {
      console.error('Failed to load photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name}: Invalid file type`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: File too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setPendingFiles((prev) => [...prev, ...validFiles]);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleCategory = (category: RoomCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleUpload = async () => {
    if (pendingFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one room category');
      return;
    }

    setUploading(true);
    try {
      // Upload images first
      const urls = await uploadPortfolioImages(pendingFiles);

      // Create photo records
      for (const url of urls) {
        await createPhoto({
          imageUrl: url,
          roomCategories: selectedCategories,
          caption,
          projectTitle,
          isPublished: publishImmediately,
        });
      }

      toast.success(`${urls.length} photo(s) uploaded successfully`);

      // Reset form and close modal
      setPendingFiles([]);
      setSelectedCategories([]);
      setCaption('');
      setProjectTitle('');
      setPublishImmediately(true);
      setShowUploadModal(false);

      // Reload photos
      loadPhotos();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleTogglePublish = async (photo: PortfolioPhoto) => {
    try {
      const updated = await togglePublish(photo.id);
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? updated : p))
      );
      toast.success(updated.isPublished ? 'Photo published to Ideas' : 'Photo unpublished');
    } catch (error) {
      toast.error('Failed to update photo');
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      await deletePhoto(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success('Photo deleted');
    } catch (error) {
      toast.error('Failed to delete photo');
    }
  };

  const handleUpdateCategories = async (photo: PortfolioPhoto, categories: RoomCategory[]) => {
    try {
      const updated = await updatePhoto(photo.id, { roomCategories: categories });
      setPhotos((prev) =>
        prev.map((p) => (p.id === photo.id ? updated : p))
      );
      setEditingPhoto(null);
      toast.success('Categories updated');
    } catch (error) {
      toast.error('Failed to update categories');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-neutral-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Ideas Photos</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Upload photos with room tags to appear on the public Ideas page
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Upload Photos
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">
            {photos.filter((p) => p.isPublished).length}
          </div>
          <div className="text-sm text-green-600">Published to Ideas</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-700">
            {photos.filter((p) => !p.isPublished).length}
          </div>
          <div className="text-sm text-gray-600">Unpublished</div>
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
          <ImageIcon className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No Ideas photos yet</h3>
          <p className="text-neutral-600 mb-4">
            Upload photos with room categories to showcase on the Ideas page
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            Upload Your First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative group border border-neutral-200 rounded-lg overflow-hidden"
            >
              <div className="relative aspect-square bg-neutral-100">
                <Image
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.caption || 'Portfolio photo'}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                  unoptimized={isLocalhostUrl(photo.thumbnailUrl || photo.imageUrl)}
                />

                {/* Published badge */}
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                    photo.isPublished
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {photo.isPublished ? 'Published' : 'Draft'}
                </div>

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleTogglePublish(photo)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title={photo.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {photo.isPublished ? (
                      <EyeOff className="h-5 w-5 text-gray-700" />
                    ) : (
                      <Eye className="h-5 w-5 text-green-600" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingPhoto(photo)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Edit categories"
                  >
                    <Plus className="h-5 w-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Category tags */}
              <div className="p-2">
                <div className="flex flex-wrap gap-1">
                  {photo.roomCategories.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded"
                    >
                      {ROOM_CATEGORY_CONFIG.find((c) => c.id === cat)?.label || cat}
                    </span>
                  ))}
                  {photo.roomCategories.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      +{photo.roomCategories.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Upload Photos to Ideas</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="ideas-photo-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="ideas-photo-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to select images (JPEG, PNG, WebP)
                    </span>
                  </label>

                  {pendingFiles.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {pendingFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removePendingFile(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Room categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Categories * (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROOM_CATEGORY_CONFIG.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCategories.includes(cat.id)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedCategories.includes(cat.id) && (
                        <Check className="inline h-3 w-3 mr-1" />
                      )}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title (optional)
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Modern Kitchen Renovation"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption (optional)
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Describe the photo..."
                />
              </div>

              {/* Publish toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="publish-immediately"
                  checked={publishImmediately}
                  onChange={(e) => setPublishImmediately(e.target.checked)}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <label htmlFor="publish-immediately" className="text-sm text-gray-700">
                  Publish to Ideas page immediately
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
                  disabled={uploading || pendingFiles.length === 0}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>Upload {pendingFiles.length} Photo(s)</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Categories Modal */}
      {editingPhoto && (
        <EditCategoriesModal
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSave={handleUpdateCategories}
        />
      )}
    </div>
  );
}

// Edit categories modal component
function EditCategoriesModal({
  photo,
  onClose,
  onSave,
}: {
  photo: PortfolioPhoto;
  onClose: () => void;
  onSave: (photo: PortfolioPhoto, categories: RoomCategory[]) => void;
}) {
  const [selectedCategories, setSelectedCategories] = useState<RoomCategory[]>(
    photo.roomCategories
  );

  const toggleCategory = (category: RoomCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit Room Categories</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {ROOM_CATEGORY_CONFIG.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(cat.id)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedCategories.includes(cat.id) && (
                  <Check className="inline h-3 w-3 mr-1" />
                )}
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(photo, selectedCategories)}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              disabled={selectedCategories.length === 0}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
