'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, Loader2 } from 'lucide-react';
import { StarRatingInput } from './StarRatingInput';
import { CategoryRatings } from './CategoryRatings';
import type { CategoryRatings as CategoryRatingsType, SubmitReviewInput } from '@/lib/services/reviews';

interface ReviewFormProps {
  leadId: string;
  professionalId: string;
  professionalName: string;
  onSubmit: (data: SubmitReviewInput) => Promise<void>;
  onCancel: () => void;
}

export function ReviewForm({
  leadId,
  professionalId,
  professionalName,
  onSubmit,
  onCancel
}: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatingsType>({
    professionalism: 0,
    quality: 0,
    timeliness: 0,
    value: 0,
    communication: 0,
  });
  const [reviewText, setReviewText] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [projectCompleted, setProjectCompleted] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = reviewText.length;
  const isValid =
    overallRating > 0 &&
    Object.values(categoryRatings).every((r) => r > 0) &&
    reviewText.length >= 50 &&
    reviewText.length <= 500 &&
    wouldRecommend !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || wouldRecommend === null) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        leadId,
        professionalId,
        overallRating,
        categoryRatings,
        reviewText,
        wouldRecommend,
        projectCompleted,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall Rating */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How would you rate {professionalName}?
        </h3>
        <div className="flex justify-center">
          <StarRatingInput
            value={overallRating}
            onChange={setOverallRating}
            size="lg"
          />
        </div>
      </div>

      {/* Category Ratings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Rate specific areas
        </h3>
        <CategoryRatings
          value={categoryRatings}
          onChange={setCategoryRatings}
        />
      </div>

      {/* Review Text */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Write your review
        </h3>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this professional. What went well? What could have been better?"
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className={charCount < 50 ? 'text-red-500' : 'text-gray-500'}>
            {charCount < 50 ? `${50 - charCount} more characters needed` : `${charCount}/500 characters`}
          </span>
          {charCount > 500 && (
            <span className="text-red-500">{charCount - 500} over limit</span>
          )}
        </div>
      </div>

      {/* Would Recommend */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Would you recommend {professionalName}?
        </h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setWouldRecommend(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
              wouldRecommend === true
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ThumbsUp className="h-5 w-5" />
            Yes, I would
          </button>
          <button
            type="button"
            onClick={() => setWouldRecommend(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-colors ${
              wouldRecommend === false
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <ThumbsDown className="h-5 w-5" />
            No, I wouldn&apos;t
          </button>
        </div>
      </div>

      {/* Project Completed */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={projectCompleted}
            onChange={(e) => setProjectCompleted(e.target.checked)}
            className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <div>
            <span className="font-medium text-gray-900">Project has been completed</span>
            <p className="text-sm text-gray-500">
              Check this if the professional has finished all the work
            </p>
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5" />
              Submit Review
            </>
          )}
        </button>
      </div>
    </form>
  );
}
