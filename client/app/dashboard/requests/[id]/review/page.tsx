'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle, Star } from 'lucide-react';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { canReviewLead, submitReview, type SubmitReviewInput, type CanReviewResponse } from '@/lib/services/reviews';
import { handleApiError } from '@/lib/utils/errorHandler';
import toast from 'react-hot-toast';

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<CanReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkCanReview = async () => {
      try {
        setLoading(true);
        const data = await canReviewLead(leadId);
        setReviewData(data);

        if (!data.canReview) {
          setError(data.reason || 'Cannot review this project');
        }
      } catch (err) {
        handleApiError(err, 'Failed to load review information');
        setError('Failed to load review information');
      } finally {
        setLoading(false);
      }
    };

    checkCanReview();
  }, [leadId]);

  const handleSubmit = async (data: SubmitReviewInput) => {
    try {
      await submitReview(data);
      toast.success('Review submitted successfully!');
      router.push(`/dashboard/requests/${leadId}`);
    } catch (err) {
      handleApiError(err, 'Failed to submit review');
      throw err;
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !reviewData?.canReview) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Cannot Submit Review</h2>
          <p className="text-gray-600 mb-6">
            {error || reviewData?.reason || 'You are not able to review this project at this time.'}
          </p>
          <Link
            href={`/dashboard/requests/${leadId}`}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Request
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/requests/${leadId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Request
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave a Review</h1>
        <p className="text-gray-600">
          Share your experience with{' '}
          <span className="font-medium text-gray-900">
            {reviewData.professional?.businessName}
          </span>
        </p>
      </div>

      {/* Project Info Card */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 mb-6 border border-primary-200">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-gray-900">{reviewData.lead?.title}</h3>
            <p className="text-sm text-gray-600">
              {reviewData.lead?.category} • Completed Project
            </p>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <ReviewForm
        leadId={leadId}
        professionalId={reviewData.professional?.id || ''}
        professionalName={reviewData.professional?.businessName || 'Professional'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
