'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void | Promise<void>;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  multiple?: boolean;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
  className?: string;
}

export function ImageUploader({
  onUpload,
  maxFiles = 10,
  maxSizeMB = 5,
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  multiple = true,
  existingImages = [],
  onRemoveExisting,
  className = '',
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFiles = (files: FileList | null): File[] => {
    if (!files) return [];

    const validFiles: File[] = [];
    const maxBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file type
      if (!file.type.match(/image\/(png|jpeg|jpg|webp)/)) {
        alert(`${file.name} is not a supported image format`);
        continue;
      }

      // Check file size
      if (file.size > maxBytes) {
        alert(`${file.name} exceeds ${maxSizeMB}MB limit`);
        continue;
      }

      validFiles.push(file);
    }

    // Check total count
    const totalCount = existingImages.length + previewUrls.length + validFiles.length;
    if (totalCount > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return validFiles.slice(0, maxFiles - existingImages.length - previewUrls.length);
    }

    return validFiles;
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = validateFiles(e.dataTransfer.files);
      if (files.length > 0) {
        await handleUpload(files);
      }
    },
    [existingImages, previewUrls]
  );

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = validateFiles(e.target.files);
      if (files.length > 0) {
        await handleUpload(files);
      }
      // Reset input
      e.target.value = '';
    },
    [existingImages, previewUrls]
  );

  const handleUpload = async (files: File[]) => {
    try {
      setUploading(true);

      // Create preview URLs
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

      // Call upload handler
      await onUpload(files);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images. Please try again.');
      // Remove failed previews
      setPreviewUrls((prev) => prev.slice(0, prev.length - files.length));
    } finally {
      setUploading(false);
    }
  };

  const removePreview = (url: string, index: number) => {
    URL.revokeObjectURL(url);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const totalImages = existingImages.length + previewUrls.length;
  const canUploadMore = totalImages < maxFiles;

  return (
    <div className={className}>
      {/* Upload Area */}
      {canUploadMore && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            id="image-upload"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className="hidden"
            disabled={uploading}
          />

          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload
              className={`h-12 w-12 mb-4 ${
                dragActive ? 'text-primary-500' : 'text-gray-400'
              }`}
            />
            <p className="text-base font-medium text-gray-700 mb-1">
              {dragActive ? 'Drop images here' : 'Drag & drop images or click to upload'}
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, WEBP up to {maxSizeMB}MB (max {maxFiles} images)
            </p>
            {totalImages > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {totalImages}/{maxFiles} images uploaded
              </p>
            )}
          </label>
        </div>
      )}

      {/* Image Grid */}
      {(existingImages.length > 0 || previewUrls.length > 0) && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {/* Existing Images */}
          {existingImages.map((url, index) => (
            <div
              key={`existing-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group"
            >
              <Image
                src={url}
                alt={`Uploaded ${index + 1}`}
                fill
                className="object-cover"
              />
              {onRemoveExisting && (
                <button
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {/* Preview Images (uploading) */}
          {previewUrls.map((url, index) => (
            <div
              key={`preview-${index}`}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group"
            >
              <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              {!uploading && (
                <button
                  onClick={() => removePreview(url, index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {existingImages.length === 0 && previewUrls.length === 0 && !canUploadMore && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
