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
  verificationStatus: 'unverified' | 'pending' | 'basic' | 'comprehensive' | 'rejected';
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
    totalLeadsClaimed: number;
    totalQuotesSubmitted: number;
    quotesAccepted: number;
    quotesDeclined: number;
    conversionRate: number;
    totalRevenue: number;
    averageQuoteValue: number;
  };
  credits: {
    totalCredits: number;
    creditsSpentThisMonth: number;
    creditsSpentAllTime: number;
  };
  performance: {
    responseTime: number;
    rating: number;
    reviewCount: number;
  };
  recentActivity: {
    pendingQuotes: number;
    activeJobs: number;
    newLeadsToday: number;
    directLeadsPending: number;
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
 * Search professionals
 */
export const searchPros = async (params?: {
  q?: string;
  service?: string;
  emirate?: string;
  page?: number;
  limit?: number;
}): Promise<{
  professionals: Array<ProProfile & { user: { firstName: string; lastName: string; profilePhoto?: string } }>;
  pagination: { page: number; limit: number; total: number; pages: number };
}> => {
  const response = await api.get('/pros/search', { params });
  return response.data.data;
};
