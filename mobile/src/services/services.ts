/**
 * Service Data API
 * Handles fetching service categories and subservices
 */

import { api } from './api';

export interface ServiceType {
  id: string;
  name: string;
}

export interface SubService {
  id: string;
  name: string;
  slug: string;
  category?: string;
  group?: string;
  icon?: string;
  keywords?: string[];
  serviceTypes?: ServiceType[];
  matchedKeyword?: string | null;
  matchedType?: string | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon?: string;
  subservices: SubService[];
}

export interface ServiceGroup {
  id: string;
  name: string;
  categories: ServiceCategory[];
  isActive: boolean;
}

/**
 * Get all service groups
 */
export const getAllServices = async (): Promise<ServiceGroup[]> => {
  const response = await api.get('/services');
  return response.data.data;
};

/**
 * Get all subservices (flattened list for autocomplete)
 */
export const getAllSubservices = async (): Promise<SubService[]> => {
  const response = await api.get('/services/subservices');
  return response.data.data;
};

/**
 * Search services by query
 */
export const searchServices = async (query: string): Promise<SubService[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const response = await api.get('/services/search', {
    params: { q: query },
  });
  return response.data.data;
};

/**
 * Get service by slug
 */
export const getServiceBySlug = async (slug: string): Promise<SubService> => {
  const response = await api.get(`/services/slug/${slug}`);
  return response.data.data;
};

/**
 * Get services by category
 */
export const getServicesByCategory = async (categoryId: string): Promise<ServiceCategory> => {
  const response = await api.get(`/services/category/${categoryId}`);
  return response.data.data;
};
