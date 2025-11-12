/**
 * Photo Upload Step
 * Optional step for uploading project photos via Cloudinary
 */

'use client';

import { useState } from 'react';
import { useLeadFormStore } from '@/store/leadFormStore';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function PhotoUploadStep() {
  const { photos, addPhoto, removePhoto } = useLeadFormStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Limit to 5 photos
    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'homezy-leads');
        formData.append('folder', 'leads');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        addPhoto(data.secure_url);
      }

      toast.success('Photos uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Add photos (Optional)
        </h2>
        <p className="text-sm text-gray-600">
          Photos help professionals understand your project better. You can add up to 5 images.
        </p>
      </div>

      {/* Upload area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition-colors">
        <input
          type="file"
          id="photo-upload"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading || photos.length >= 5}
          className="hidden"
        />
        <label
          htmlFor="photo-upload"
          className={`cursor-pointer ${
            isUploading || photos.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex flex-col items-center">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <div className="bg-primary-100 rounded-full p-4 mb-4">
                  <Camera className="h-8 w-8 text-primary-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  Click to upload photos
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG up to 5MB each
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((url, index) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => removePhoto(url)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-300 rounded-xl p-4">
        <div className="flex gap-3">
          <ImageIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-800">
            <strong className="text-gray-900">Tip:</strong> Include photos of the
            current condition, measurements, or any specific details that would help
            professionals provide accurate quotes.
          </div>
        </div>
      </div>
    </div>
  );
}
