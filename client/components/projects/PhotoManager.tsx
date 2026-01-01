'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { ProProject, ProProjectPhoto, RoomCategory, PhotoType } from '@homezy/shared';
import { ROOM_CATEGORY_CONFIG } from '@homezy/shared';
import {
  X,
  Upload,
  Trash2,
  Check,
  Loader2,
  ChevronLeft,
  Edit3,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import {
  addPhotos,
  updatePhoto,
  deletePhoto,
  uploadProjectImages,
} from '@/lib/services/projects';
import toast from 'react-hot-toast';

interface PhotoManagerProps {
  project: ProProject;
  onClose: () => void;
  onProjectUpdate: (project: ProProject) => void;
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

export function PhotoManager({ project, onClose, onProjectUpdate }: PhotoManagerProps) {
  const [photos, setPhotos] = useState<ProProjectPhoto[]>(project.photos || []);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<ProProjectPhoto | null>(null);
  const [uploading, setUploading] = useState(false);

  // Upload form state
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<RoomCategory[]>([]);
  const [photoType, setPhotoType] = useState<PhotoType>('main');
  const [caption, setCaption] = useState('');

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
      const urls = await uploadProjectImages(pendingFiles);

      // Create photo records (isPublishedToIdeas defaults to false - admin will publish)
      const newPhotos = urls.map((url, index) => ({
        imageUrl: url,
        roomCategories: selectedCategories,
        photoType,
        caption: caption || undefined,
      }));

      const addedPhotos = await addPhotos(project.id, newPhotos);
      setPhotos((prev) => [...prev, ...addedPhotos]);

      toast.success(`${urls.length} photo(s) uploaded successfully`);

      // Reset form and close modal
      resetUploadForm();
      setShowUploadModal(false);

      // Update parent
      onProjectUpdate({
        ...project,
        photos: [...photos, ...addedPhotos],
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setPendingFiles([]);
    setSelectedCategories([]);
    setPhotoType('main');
    setCaption('');
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      await deletePhoto(project.id, photoId);
      const newPhotos = photos.filter((p) => p.id !== photoId);
      setPhotos(newPhotos);
      onProjectUpdate({ ...project, photos: newPhotos });
      toast.success('Photo deleted');
    } catch (error) {
      toast.error('Failed to delete photo');
    }
  };

  const handleUpdatePhoto = async (
    photo: ProProjectPhoto,
    updates: { roomCategories?: RoomCategory[]; caption?: string; photoType?: PhotoType }
  ) => {
    try {
      const updated = await updatePhoto(project.id, photo.id, updates);
      const newPhotos = photos.map((p) => (p.id === photo.id ? updated : p));
      setPhotos(newPhotos);
      onProjectUpdate({ ...project, photos: newPhotos });
      setEditingPhoto(null);
      toast.success('Photo updated');
    } catch (error) {
      toast.error('Failed to update photo');
    }
  };

  const publishedCount = photos.filter(
    (p) => p && p.isPublishedToIdeas && p.adminStatus === 'active'
  ).length;

  const removedCount = photos.filter((p) => p && p.adminStatus === 'removed').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="border-l pl-3 ml-1">
              <h2 className="text-xl font-bold text-neutral-900">{project.name}</h2>
              <p className="text-sm text-neutral-600">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} |{' '}
                {publishedCount} on Ideas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Upload className="h-5 w-5" />
              Add Photos
            </button>
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Done
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-neutral-50 border-b px-6 py-3 flex gap-6 flex-shrink-0">
          <div className="text-sm">
            <span className="text-neutral-500">Total:</span>{' '}
            <span className="font-medium text-neutral-700">{photos.length}</span>
          </div>
          <div className="text-sm">
            <span className="text-neutral-500">On Ideas:</span>{' '}
            <span className="font-medium text-green-600">{publishedCount}</span>
          </div>
          {removedCount > 0 && (
            <div className="text-sm">
              <span className="text-neutral-500">Removed by Admin:</span>{' '}
              <span className="font-medium text-red-600">{removedCount}</span>
            </div>
          )}
        </div>

        {/* Photos Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {photos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-neutral-300 rounded-lg">
              <ImageIcon className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                No photos yet
              </h3>
              <p className="text-neutral-600 mb-4">
                Add photos to showcase this project in your portfolio
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary"
              >
                Upload Photos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.filter(Boolean).map((photo) => (
                <div
                  key={photo.id}
                  className={`relative group border rounded-lg overflow-hidden ${
                    photo.adminStatus === 'removed'
                      ? 'border-red-300 bg-red-50'
                      : 'border-neutral-200'
                  }`}
                >
                  <div className="relative aspect-square bg-neutral-100">
                    <Image
                      src={photo.thumbnailUrl || photo.imageUrl}
                      alt={photo.caption || 'Project photo'}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                      unoptimized={isLocalhostUrl(
                        photo.thumbnailUrl || photo.imageUrl
                      )}
                    />

                    {/* Status badge */}
                    <div
                      className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                        photo.adminStatus === 'removed'
                          ? 'bg-red-500 text-white'
                          : photo.isPublishedToIdeas
                          ? 'bg-green-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {photo.adminStatus === 'removed'
                        ? 'Removed'
                        : photo.isPublishedToIdeas
                        ? 'On Ideas'
                        : 'Pending'}
                    </div>

                    {/* Photo type badge */}
                    {photo.photoType !== 'main' && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium">
                        {photo.photoType.charAt(0).toUpperCase() + photo.photoType.slice(1)}
                      </div>
                    )}

                    {/* Actions overlay */}
                    {photo.adminStatus !== 'removed' && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingPhoto(photo)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit3 className="h-5 w-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(photo.id)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Admin removal reason */}
                  {photo.adminStatus === 'removed' && photo.adminRemovalReason && (
                    <div className="p-2 bg-red-50 border-t border-red-200">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">
                          {photo.adminRemovalReason}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Category tags */}
                  {photo.adminStatus !== 'removed' && (
                    <div className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {photo.roomCategories.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded"
                          >
                            {ROOM_CATEGORY_CONFIG.find((c) => c.id === cat)
                              ?.label || cat}
                          </span>
                        ))}
                        {photo.roomCategories.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{photo.roomCategories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal
            onClose={() => {
              resetUploadForm();
              setShowUploadModal(false);
            }}
            pendingFiles={pendingFiles}
            selectedCategories={selectedCategories}
            photoType={photoType}
            caption={caption}
            uploading={uploading}
            onFileSelect={handleFileSelect}
            onRemoveFile={removePendingFile}
            onToggleCategory={toggleCategory}
            onPhotoTypeChange={setPhotoType}
            onCaptionChange={setCaption}
            onUpload={handleUpload}
          />
        )}

        {/* Edit Photo Modal */}
        {editingPhoto && (
          <EditPhotoModal
            photo={editingPhoto}
            onClose={() => setEditingPhoto(null)}
            onSave={handleUpdatePhoto}
          />
        )}
      </div>
    </div>
  );
}

// Upload Modal Component
function UploadModal({
  onClose,
  pendingFiles,
  selectedCategories,
  photoType,
  caption,
  uploading,
  onFileSelect,
  onRemoveFile,
  onToggleCategory,
  onPhotoTypeChange,
  onCaptionChange,
  onUpload,
}: {
  onClose: () => void;
  pendingFiles: File[];
  selectedCategories: RoomCategory[];
  photoType: PhotoType;
  caption: string;
  uploading: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onToggleCategory: (category: RoomCategory) => void;
  onPhotoTypeChange: (type: PhotoType) => void;
  onCaptionChange: (caption: string) => void;
  onUpload: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Photos</h2>
          <button
            onClick={onClose}
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
                onChange={onFileSelect}
                className="hidden"
                id="project-photo-upload"
                disabled={uploading}
              />
              <label
                htmlFor="project-photo-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to select images (JPEG, PNG, WebP, max 5MB each)
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
                        onClick={() => onRemoveFile(index)}
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

          {/* Photo type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Type
            </label>
            <div className="flex gap-2">
              {(['main', 'before', 'after'] as PhotoType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onPhotoTypeChange(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    photoType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
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
                  onClick={() => onToggleCategory(cat.id)}
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

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption (optional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={2}
              placeholder="Describe the photo..."
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Photos will be added to your portfolio. Our team reviews photos and may
              feature them on the Ideas page for homeowners to discover.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
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
  );
}

// Edit Photo Modal Component
function EditPhotoModal({
  photo,
  onClose,
  onSave,
}: {
  photo: ProProjectPhoto;
  onClose: () => void;
  onSave: (
    photo: ProProjectPhoto,
    updates: { roomCategories?: RoomCategory[]; caption?: string; photoType?: PhotoType }
  ) => void;
}) {
  const [selectedCategories, setSelectedCategories] = useState<RoomCategory[]>(
    photo.roomCategories
  );
  const [caption, setCaption] = useState(photo.caption || '');
  const [photoType, setPhotoType] = useState<PhotoType>(photo.photoType);

  const toggleCategory = (category: RoomCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit Photo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden">
            <Image
              src={photo.imageUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized={isLocalhostUrl(photo.imageUrl)}
            />
          </div>

          {/* Photo type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Type
            </label>
            <div className="flex gap-2">
              {(['main', 'before', 'after'] as PhotoType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPhotoType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    photoType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Room categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Categories
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

          {/* Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={2}
              placeholder="Describe the photo..."
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onSave(photo, {
                  roomCategories: selectedCategories,
                  caption: caption || undefined,
                  photoType,
                })
              }
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
