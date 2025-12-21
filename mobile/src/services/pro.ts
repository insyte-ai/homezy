/**
 * Professional Profile API Service
 * Handles pro profile, analytics, and portfolio
 */

import { api } from './api';

// Interfaces
export interface ProProfile {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  phone?: string;
  bio?: string;
  tagline?: string;
  yearsInBusiness?: number;
  employeeCount?: number;
  services: string[];
  serviceAreas: string[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime?: number;
  portfolio: PortfolioItem[];
  featuredProjects: string[];
  socialLinks?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  images: string[];
  budget?: string;
  duration?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ProAnalytics {
  overview: {
    activeQuotes: number;
    claimedLeads: {
      change: number;
      last7Days: number;
      total: number;
    };
    creditBalance: {
      free: number;
      paid: number;
      total: number;
    };
    projectsCompleted: number;
  };
  performance: {
    projectsCompleted: number;
    rating: number;
    responseTimeHours: number;
    reviewCount: number;
  };
  quotes: {
    acceptanceRate: number;
    accepted: number;
    avgValue: number;
    last7Days: number;
    pending: number;
    rejected: number;
    total: number;
  };
  recentActivity: {
    transactions: Array<{
      id: string;
      type: string;
      amount: number;
      description: string;
      createdAt: string;
    }>;
    directLeadsPending?: number;
    newLeadsToday?: number;
  };
  revenue: {
    change: number;
    lastMonth: number;
    total: number;
  };
}

interface ProfileResponse {
  success: boolean;
  data: {
    profile: ProProfile;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      profilePhoto?: string;
    };
  };
}

interface AnalyticsResponse {
  success: boolean;
  data: ProAnalytics;
}

/**
 * Get current pro's profile
 */
export const getMyProfile = async (): Promise<ProfileResponse['data']> => {
  const response = await api.get<ProfileResponse>('/pros/me');
  return response.data.data;
};

/**
 * Get pro analytics/dashboard data
 */
export const getAnalytics = async (): Promise<ProAnalytics> => {
  const response = await api.get<AnalyticsResponse>('/pros/me/analytics');
  return response.data.data;
};

/**
 * Update pro profile
 */
export const updateProfile = async (data: Partial<{
  businessName: string;
  phone: string;
  bio: string;
  tagline: string;
  yearsInBusiness: number;
  employeeCount: number;
  services: string[];
  serviceAreas: string[];
  socialLinks: {
    website?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}>): Promise<ProProfile> => {
  const response = await api.put<{ success: boolean; data: { profile: ProProfile } }>('/pros/me', data);
  return response.data.data.profile;
};

/**
 * Add portfolio item
 */
export const addPortfolioItem = async (data: {
  title: string;
  description?: string;
  category: string;
  images: string[];
  budget?: string;
  duration?: string;
  completedAt?: string;
}): Promise<PortfolioItem> => {
  const response = await api.post<{ success: boolean; data: { item: PortfolioItem } }>('/pros/me/portfolio', data);
  return response.data.data.item;
};

/**
 * Update portfolio item
 */
export const updatePortfolioItem = async (
  itemId: string,
  data: Partial<{
    title: string;
    description: string;
    category: string;
    images: string[];
    budget: string;
    duration: string;
    completedAt: string;
  }>
): Promise<PortfolioItem> => {
  const response = await api.put<{ success: boolean; data: { item: PortfolioItem } }>(`/pros/me/portfolio/${itemId}`, data);
  return response.data.data.item;
};

/**
 * Delete portfolio item
 */
export const deletePortfolioItem = async (itemId: string): Promise<void> => {
  await api.delete(`/pros/me/portfolio/${itemId}`);
};

/**
 * Get public pro profile by ID
 */
export const getProProfile = async (id: string): Promise<ProProfile> => {
  const response = await api.get<{ success: boolean; data: { profile: ProProfile } }>(`/pros/${id}`);
  return response.data.data.profile;
};

/**
 * Search result professional (matches backend response)
 */
export interface SearchResultPro {
  id: string;
  businessName: string;
  slug: string;
  profilePhoto?: string;
  proProfile: {
    businessName: string;
    slug: string;
    tagline?: string;
    categories: string[];
    serviceAreas: Array<{ emirate: string; neighborhoods?: string[] }>;
    verificationStatus: string;
    rating: number;
    reviewCount: number;
    projectsCompleted: number;
    responseTimeHours: number;
    quoteAcceptanceRate: number;
    yearsInBusiness?: number;
    hourlyRateMin?: number;
    hourlyRateMax?: number;
  };
}

/**
 * Search professionals
 */
export const searchPros = async (params?: {
  q?: string;
  category?: string;
  service?: string;
  emirate?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}): Promise<{
  professionals: SearchResultPro[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> => {
  const response = await api.get('/pros/search', { params });
  return response.data.data;
};

/**
 * Review interface
 */
export interface Review {
  id: string;
  homeownerId: string;
  homeownerName: string;
  homeownerPhoto?: string;
  overallRating: number;
  categoryRatings?: {
    quality?: number;
    communication?: number;
    punctuality?: number;
    value?: number;
  };
  reviewText: string;
  wouldRecommend: boolean;
  createdAt: string;
  jobId?: string;
  jobCategory?: string;
}

/**
 * Get professional reviews
 */
export const getProReviews = async (
  proId: string,
  params?: { page?: number; limit?: number }
): Promise<{
  reviews: Review[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> => {
  const response = await api.get(`/pros/${proId}/reviews`, { params });
  return response.data.data;
};

/**
 * Verification document interface
 */
export interface VerificationDocument {
  id: string;
  type: 'emirates_id' | 'trade_license' | 'insurance' | 'certification';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
}

/**
 * Get verification documents
 */
export const getVerificationDocuments = async (): Promise<VerificationDocument[]> => {
  const response = await api.get<{ success: boolean; data: { documents: VerificationDocument[] } }>('/pros/me/verification/documents');
  return response.data.data.documents;
};

/**
 * Upload verification document
 */
export const uploadVerificationDocument = async (
  type: VerificationDocument['type'],
  file: {
    uri: string;
    name: string;
    mimeType: string;
  },
  onProgress?: (progress: number) => void
): Promise<VerificationDocument> => {
  const formData = new FormData();
  formData.append('type', type);
  formData.append('document', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as any);

  const response = await api.post<{ success: boolean; data: { document: VerificationDocument } }>(
    '/pros/me/verification/documents',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    }
  );
  return response.data.data.document;
};

/**
 * Delete verification document
 */
export const deleteVerificationDocument = async (documentId: string): Promise<void> => {
  await api.delete(`/pros/me/verification/documents/${documentId}`);
};

/**
 * Submit verification request
 */
export const submitVerification = async (): Promise<{ status: string; message: string }> => {
  const response = await api.post<{ success: boolean; data: { status: string; message: string } }>('/pros/me/verification/submit');
  return response.data.data;
};
