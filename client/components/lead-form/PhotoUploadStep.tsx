/**
 * Photo Upload Step
 * Optional step for uploading project photos via Cloudinary
 */

'use client';

import { useState } from 'react';
import { useLeadFormStore } from '@/store/leadFormStore';
import { useAuthStore } from '@/store/authStore';
import { createLead, createDirectLead } from '@/lib/services/leads';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { LeadSuccessWithPros } from './LeadSuccessWithPros';

interface PhotoUploadStepProps {
  onAutoSubmit?: () => void;
}

export function PhotoUploadStep({ onAutoSubmit }: PhotoUploadStepProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    photos,
    addPhoto,
    removePhoto,
    // Common fields
    title,
    description,
    emirate,
    neighborhood,
    budgetBracket,
    urgency,
    timeline,
    selectedServiceId,
    targetProfessionalId,
    getServiceAnswers,
    setSubmitting,
    reset,
  } = useLeadFormStore();
  const [isUploading, setIsUploading] = useState(false);
  const [createdLead, setCreatedLead] = useState<{
    leadId: string;
    serviceCategory: string;
    emirate: string;
  } | null>(null);

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
      const { api } = await import('@/lib/api');

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

        // Upload to backend API
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/lead-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          addPhoto(response.data.data.url);
        } else {
          throw new Error(response.data.message || 'Upload failed');
        }
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

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to submit your request');
      return;
    }

    setSubmitting(true);

    try {
      const leadInput = {
        title,
        description,
        category: selectedServiceId!,
        location: {
          emirate,
          neighborhood: neighborhood || undefined,
        },
        budgetBracket,
        urgency,
        timeline: timeline || undefined,
        photos,
        serviceAnswers: getServiceAnswers() || undefined,
      };

      // Check if this is a direct lead or indirect lead
      const isDirectLead = !!targetProfessionalId;

      // Debug logging
      console.log('[PhotoUploadStep] Submitting lead:', {
        isDirectLead,
        targetProfessionalId,
        leadInput,
      });

      let lead;
      if (isDirectLead) {
        // Create direct lead (sent to specific professional)
        console.log('[PhotoUploadStep] Calling createDirectLead with professionalId:', targetProfessionalId);
        lead = await createDirectLead(targetProfessionalId!, leadInput);
        toast.success('Direct request sent successfully!');

        // For direct leads, just reset and close the modal
        reset();
        onAutoSubmit?.();
      } else {
        // Create indirect lead (goes to marketplace)
        lead = await createLead(leadInput);

        // Store lead info to show matching professionals
        setCreatedLead({
          leadId: lead.id,
          serviceCategory: selectedServiceId!,
          emirate,
        });

        toast.success('Request created successfully!');
      }
    } catch (error: any) {
      console.error('Failed to create lead:', error);
      toast.error(
        error.response?.data?.message || error.message || 'Failed to create request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Success state - Show matching professionals
  if (createdLead) {
    return (
      <LeadSuccessWithPros
        leadId={createdLead.leadId}
        serviceCategory={createdLead.serviceCategory}
        emirate={createdLead.emirate}
        isGuest={false}
        onClose={() => {
          reset();
          onAutoSubmit?.();
        }}
      />
    );
  }

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
      <div className="bg-primary-50 border border-primary-300 rounded-xl p-4">
        <div className="flex gap-3">
          <ImageIcon className="h-5 w-5 text-neutral-900 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-800">
            <strong className="text-gray-900">Tip:</strong> Include photos of the
            current condition, measurements, or any specific details that would help
            professionals provide accurate quotes.
          </div>
        </div>
      </div>

      {/* Submit button for authenticated users */}
      {isAuthenticated && onAutoSubmit && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={useLeadFormStore.getState().isSubmitting}
          className="w-full py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {useLeadFormStore.getState().isSubmitting
            ? 'Creating your request...'
            : 'Submit Request'}
        </button>
      )}
    </div>
  );
}
