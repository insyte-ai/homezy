import { api } from '../api';

export interface CategoryRatings {
  professionalism: number;
  quality: number;
  timeliness: number;
  value: number;
  communication: number;
}

export interface Review {
  _id: string;
  professionalId: string;
  homeownerId: string;
  projectId: string;
  overallRating: number;
  categoryRatings: CategoryRatings;
  reviewText: string;
  photos?: string[];
  wouldRecommend: boolean;
  projectCompleted: boolean;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitReviewInput {
  leadId: string;
  professionalId: string;
  overallRating: number;
  categoryRatings: CategoryRatings;
  reviewText: string;
  wouldRecommend: boolean;
  projectCompleted: boolean;
  photos?: string[];
}

export interface CanReviewResponse {
  canReview: boolean;
  reason?: string;
  lead?: {
    _id: string;
    title: string;
    category: string;
  };
  professional?: {
    _id: string;
    businessName: string;
    profilePhoto?: string;
  };
}

export interface ProfessionalReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  stats: {
    averageRating: number;
    totalReviews: number;
    wouldRecommendPercent: number;
    categoryAverages: CategoryRatings;
  };
}

/**
 * Check if user can review a lead
 */
export const canReviewLead = async (leadId: string): Promise<CanReviewResponse> => {
  const response = await api.get<{ success: boolean; data: CanReviewResponse }>(
    `/reviews/can-review/${leadId}`
  );
  return response.data.data;
};

/**
 * Submit a review
 */
export const submitReview = async (data: SubmitReviewInput): Promise<Review> => {
  const response = await api.post<{ success: boolean; data: { review: Review } }>(
    '/reviews',
    data
  );
  return response.data.data.review;
};

/**
 * Get review for a specific lead
 */
export const getReviewForLead = async (leadId: string): Promise<Review | null> => {
  const response = await api.get<{ success: boolean; data: { review: Review | null } }>(
    `/reviews/lead/${leadId}`
  );
  return response.data.data.review;
};

/**
 * Get all reviews for a professional
 */
export const getProfessionalReviews = async (
  professionalId: string,
  page: number = 1,
  limit: number = 10
): Promise<ProfessionalReviewsResponse> => {
  const response = await api.get<{ success: boolean; data: ProfessionalReviewsResponse }>(
    `/reviews/professional/${professionalId}`,
    { params: { page, limit } }
  );
  return response.data.data;
};
