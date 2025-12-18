/**
 * Quotes API Service
 * Handles all quote-related API calls
 */

import { api } from './api';
import { Quote } from './leads';

interface QuotesResponse {
  success: boolean;
  data: {
    quotes: Quote[];
    total: number;
  };
}

interface QuoteResponse {
  success: boolean;
  data: {
    quote: Quote;
  };
}

/**
 * Get quotes for a lead (homeowner view)
 */
export const getQuotesForLead = async (leadId: string): Promise<Quote[]> => {
  const response = await api.get<QuotesResponse>(`/leads/${leadId}/quotes`);
  return response.data.data.quotes;
};

/**
 * Get quote by ID
 */
export const getQuoteById = async (quoteId: string): Promise<Quote> => {
  const response = await api.get<QuoteResponse>(`/quotes/${quoteId}`);
  return response.data.data.quote;
};

/**
 * Accept a quote (homeowner action)
 */
export const acceptQuote = async (
  quoteId: string,
  data?: { message?: string }
): Promise<Quote> => {
  const response = await api.post<QuoteResponse>(`/quotes/${quoteId}/accept`, data);
  return response.data.data.quote;
};

/**
 * Decline a quote (homeowner action)
 */
export const declineQuote = async (
  quoteId: string,
  data?: { reason?: string }
): Promise<Quote> => {
  const response = await api.post<QuoteResponse>(`/quotes/${quoteId}/decline`, data);
  return response.data.data.quote;
};

/**
 * Get my quotes (professional view)
 */
export const getMyQuotes = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ quotes: Quote[]; total: number; pagination: any }> => {
  const response = await api.get<{
    success: boolean;
    data: {
      quotes: Quote[];
      total: number;
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
  }>('/quotes/my-quotes', { params });
  return response.data.data;
};

/**
 * Submit a quote for a lead (professional action)
 */
export const submitQuote = async (
  leadId: string,
  data: {
    estimatedStartDate: string;
    estimatedCompletionDate: string;
    estimatedDurationDays: number;
    items: {
      description: string;
      category: 'labor' | 'materials' | 'permits' | 'equipment' | 'other';
      quantity: number;
      unitPrice: number;
      notes?: string;
    }[];
    approach: string;
    warranty?: string;
    questions?: string;
  }
): Promise<Quote> => {
  const response = await api.post<QuoteResponse>(`/leads/${leadId}/quotes`, data);
  return response.data.data.quote;
};

/**
 * Update a quote (professional action)
 */
export const updateQuote = async (
  quoteId: string,
  data: Partial<{
    estimatedStartDate: string;
    estimatedCompletionDate: string;
    estimatedDurationDays: number;
    items: {
      description: string;
      category: 'labor' | 'materials' | 'permits' | 'equipment' | 'other';
      quantity: number;
      unitPrice: number;
      notes?: string;
    }[];
    approach: string;
    warranty?: string;
    questions?: string;
  }>
): Promise<Quote> => {
  const response = await api.patch<QuoteResponse>(`/quotes/${quoteId}`, data);
  return response.data.data.quote;
};
