import { api } from '../api';

export interface SearchResult {
  requests: Array<{
    _id: string;
    title: string;
    category: string;
    status: string;
    createdAt: string;
  }>;
  quotes: Array<{
    _id: string;
    leadId: string;
    leadTitle: string;
    professionalName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  professionals: Array<{
    _id: string;
    businessName: string;
    services: string[];
    rating: number;
    reviewCount: number;
    profilePhoto?: string;
  }>;
}

export interface SearchResponse {
  success: boolean;
  data: SearchResult;
}

/**
 * Search across requests, quotes, and professionals
 */
export const searchDashboard = async (query: string, limit: number = 5): Promise<SearchResult> => {
  const response = await api.get<SearchResponse>('/search', {
    params: { q: query, limit },
  });
  return response.data.data;
};
