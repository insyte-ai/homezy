/**
 * Professional Service
 * API client for professional-related endpoints
 */

import { api } from '../api';
import type { ProProfile, PortfolioItem } from '@homezy/shared';

// ==================== Types ====================

export interface PublicProfileResponse {
  success: boolean;
  data: {
    professional: {
      id: string;
      businessName: string;
      slug?: string;
      profilePhoto?: string;
      proProfile: ProProfile;
    };
  };
}

export interface MyProfileResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      profilePhoto?: string;
      proProfile: ProProfile;
    };
    completeness: {
      percentage: number;
      completedSections: string[];
      missingSections: string[];
    };
  };
}

interface DaySchedule {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

interface WeeklySchedule {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

interface Availability {
  schedule: WeeklySchedule;
  unavailableDates?: Date[];
  maxAppointmentsPerDay?: number;
  bufferTimeMinutes?: number;
}

export interface UpdateProfileInput {
  businessName?: string;
  tagline?: string;
  bio?: string;
  categories?: string[];
  serviceAreas?: Array<{
    emirate: string;
    neighborhoods?: string[];
    serviceRadius?: number;
    willingToTravelOutside?: boolean;
    extraTravelCost?: number;
  }>;
  yearsInBusiness?: number;
  teamSize?: number;
  languages?: string[];
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  minimumProjectSize?: number;
  businessType?: 'sole-establishment' | 'llc' | 'general-partnership' | 'limited-partnership' | 'civil-company' | 'foreign-branch' | 'free-zone';
  availability?: Availability;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    proProfile: ProProfile;
    slug?: string;
  };
}

export interface PortfolioItemInput {
  title: string;
  description: string;
  category: string;
  images: string[];
  beforeImages?: string[];
  afterImages?: string[];
  completionDate: Date | string;
  isFeatured?: boolean;
}

export interface PortfolioItemResponse {
  success: boolean;
  message: string;
  data: {
    portfolioItem: PortfolioItem;
  };
}

export interface FeaturedProjectsInput {
  projectIds: string[];
}

export interface FeaturedProjectsResponse {
  success: boolean;
  message: string;
  data: {
    featuredProjects: string[];
  };
}

export interface VerificationUploadResponse {
  success: boolean;
  message: string;
  data: {
    documentUrl: string;
    documentType: string;
  };
}

export interface SearchProsParams {
  category?: string;
  emirate?: string;
  minRating?: number;
  verificationStatus?: 'basic' | 'comprehensive';
  search?: string;
  page?: number;
  limit?: number;
}

export interface SearchProsResponse {
  success: boolean;
  data: {
    professionals: Array<{
      id: string;
      businessName: string;
      slug?: string;
      profilePhoto?: string;
      proProfile: ProProfile;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// ==================== Public Profile Functions ====================

/**
 * Get public professional profile (for homeowners)
 * @param id - Professional ID
 * @returns Public profile data
 */
export const getPublicProfile = async (id: string): Promise<PublicProfileResponse['data']> => {
  const response = await api.get<PublicProfileResponse>(`/pros/${id}`);
  return response.data.data;
};

/**
 * Search for professionals
 * @param params - Search parameters
 * @returns List of professionals matching criteria
 */
export const searchProfessionals = async (
  params: SearchProsParams = {}
): Promise<SearchProsResponse['data']> => {
  const response = await api.get<SearchProsResponse>('/pros/search', { params });
  return response.data.data;
};

// ==================== Professional Dashboard Functions ====================

/**
 * Get current professional's profile with completeness info
 * @returns Current pro profile with completeness data
 */
export const getMyProfile = async (): Promise<MyProfileResponse['data']> => {
  const response = await api.get<MyProfileResponse>('/pros/me');
  return response.data.data;
};

/**
 * Preview own profile (what public will see)
 * @returns Profile data in public format, regardless of verification status
 */
export const getMyProfilePreview = async (): Promise<PublicProfileResponse['data']> => {
  const response = await api.get<PublicProfileResponse>('/pros/me/preview');
  return response.data.data;
};

/**
 * Complete professional onboarding
 * @param data - Onboarding data collected during setup wizard
 * @returns Updated profile with slug
 */
export const completeOnboarding = async (data: {
  firstName: string;
  lastName: string;
  phone: string;
  businessEmail?: string;
  businessName: string;
  brandName?: string;
  businessType: 'sole-establishment' | 'llc' | 'general-partnership' | 'limited-partnership' | 'civil-company' | 'foreign-branch' | 'free-zone';
  tradeLicenseNumber: string;
  vatNumber: string;
  categories: string[];
  primaryEmirate: string;
  serviceRadius?: number;
}): Promise<{ proProfile: ProProfile; slug: string }> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: { proProfile: ProProfile; slug: string };
  }>('/pros/onboarding', data);
  return response.data.data;
};

/**
 * Update professional profile
 * @param data - Profile data to update
 * @returns Updated profile
 */
export const updateMyProfile = async (
  data: UpdateProfileInput
): Promise<UpdateProfileResponse['data']> => {
  const response = await api.put<UpdateProfileResponse>('/pros/me', data);
  return response.data.data;
};

/**
 * Upload profile photo
 * @param file - Image file to upload
 * @returns URL of uploaded photo
 *
 * @todo IMPLEMENTATION REQUIRED
 * This function requires a backend upload endpoint to be implemented.
 * The endpoint should:
 * - Accept multipart/form-data with a 'photo' field
 * - Validate file type (JPEG, PNG, WebP)
 * - Validate file size (max 5MB)
 * - Store the file (e.g., AWS S3, Cloudinary, local storage)
 * - Return the URL of the uploaded file
 *
 * Backend endpoint needed: POST /api/upload/profile-photo
 */
export const uploadProfilePhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('photo', file);

  try {
    const response = await api.post<{ success: boolean; data: { url: string } }>(
      '/upload/profile-photo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data.url;
  } catch (error) {
    // Provide helpful error message if endpoint doesn't exist
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Upload endpoint not implemented. Please implement POST /api/upload/profile-photo on the backend.');
      }
    }
    throw error;
  }
};

// ==================== Portfolio Functions ====================

/**
 * Add a new portfolio item
 * @param data - Portfolio item data
 * @returns Created portfolio item
 */
export const addPortfolioItem = async (
  data: PortfolioItemInput
): Promise<PortfolioItem> => {
  const response = await api.post<PortfolioItemResponse>('/pros/me/portfolio', data);
  return response.data.data.portfolioItem;
};

/**
 * Update an existing portfolio item
 * @param itemId - Portfolio item ID
 * @param data - Updated portfolio data
 * @returns Updated portfolio item
 */
export const updatePortfolioItem = async (
  itemId: string,
  data: Partial<PortfolioItemInput>
): Promise<PortfolioItem> => {
  const response = await api.put<PortfolioItemResponse>(
    `/pros/me/portfolio/${itemId}`,
    data
  );
  return response.data.data.portfolioItem;
};

/**
 * Delete a portfolio item
 * @param itemId - Portfolio item ID
 */
export const deletePortfolioItem = async (itemId: string): Promise<void> => {
  await api.delete(`/pros/me/portfolio/${itemId}`);
};

/**
 * Update featured projects
 * @param projectIds - Array of portfolio item IDs to feature (max 6)
 * @returns Updated featured projects array
 */
export const updateFeaturedProjects = async (
  projectIds: string[]
): Promise<string[]> => {
  const response = await api.put<FeaturedProjectsResponse>('/pros/me/featured-projects', {
    projectIds,
  });
  return response.data.data.featuredProjects;
};

/**
 * Upload portfolio images (multiple)
 * @param files - Array of image files
 * @returns Array of uploaded image URLs
 *
 * @todo IMPLEMENTATION REQUIRED
 * This function requires a backend upload endpoint to be implemented.
 * The endpoint should:
 * - Accept multipart/form-data with an 'images' field (array)
 * - Validate file types (JPEG, PNG, WebP)
 * - Validate file sizes (max 5MB each)
 * - Validate total number of files (max 10 per request)
 * - Store the files (e.g., AWS S3, Cloudinary, local storage)
 * - Return an array of URLs for the uploaded files
 *
 * Backend endpoint needed: POST /api/upload/portfolio-images
 */
export const uploadPortfolioImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  try {
    const response = await api.post<{ success: boolean; data: { urls: string[] } }>(
      '/upload/portfolio-images',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data.urls;
  } catch (error) {
    // Provide helpful error message if endpoint doesn't exist
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Upload endpoint not implemented. Please implement POST /api/upload/portfolio-images on the backend.');
      }
    }
    throw error;
  }
};

// ==================== Verification Functions ====================

/**
 * Upload verification document
 * @param file - Document file (PDF or image)
 * @param type - Document type
 * @returns Upload response with document URL
 *
 * @todo IMPLEMENTATION REQUIRED
 * This function requires a backend upload endpoint to be implemented.
 * The endpoint should:
 * - Accept multipart/form-data with 'document' and 'type' fields
 * - Validate file type (PDF, JPEG, PNG)
 * - Validate file size (max 10MB for documents)
 * - Store the file securely
 * - Update the professional's verification documents array
 * - Return the document URL and type
 *
 * Backend endpoint needed: POST /api/pros/me/verification/upload
 */
export const uploadVerificationDocument = async (
  file: File,
  type: 'license' | 'vat' | 'insurance' | 'id' | 'reference'
): Promise<VerificationUploadResponse['data']> => {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('type', type);

  try {
    const response = await api.post<VerificationUploadResponse>(
      '/pros/me/verification/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  } catch (error) {
    // Provide helpful error message if endpoint doesn't exist
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Upload endpoint not implemented. Please implement POST /api/pros/me/verification/upload on the backend.');
      }
    }
    throw error;
  }
};

// ==================== Helper Functions ====================

/**
 * Check if a slug is available
 * @param slug - Slug to check
 * @returns True if available, false if taken
 */
export const checkSlugAvailability = async (slug: string): Promise<boolean> => {
  try {
    const response = await api.get<{ success: boolean; available: boolean }>(
      `/pros/check-slug/${slug}`
    );
    return response.data.available;
  } catch {
    return false;
  }
};

/**
 * Generate slug from business name
 * @param businessName - Business name
 * @param emirate - Primary emirate (optional)
 * @returns Generated slug
 */
export { generateProSlug as generateSlug } from '@homezy/shared';

const professionalService = {
  // Public
  getPublicProfile,
  searchProfessionals,

  // Profile
  getMyProfile,
  updateMyProfile,
  uploadProfilePhoto,

  // Portfolio
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  updateFeaturedProjects,
  uploadPortfolioImages,

  // Verification
  uploadVerificationDocument,

  // Helpers
  checkSlugAvailability,
};

export default professionalService;
