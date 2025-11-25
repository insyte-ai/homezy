import { api } from '../api';

// Enums
export enum QuoteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  WITHDRAWN = 'withdrawn'
}

// Interfaces
export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  _id: string;
  lead: string | {
    _id: string;
    title: string;
    category: string;
    budgetBracket: string;
  };
  professional: string | {
    _id: string;
    businessName: string;
    rating?: number;
    reviewCount?: number;
    verificationStatus?: string;
  };
  professionalId: string;
  professionalName: string;
  pricing: {
    items: QuoteItem[];
    subtotal: number;
    vat: number;
    total: number;
  };
  timeline: {
    startDate: string;
    completionDate: string;
    estimatedDuration: number;
  };
  approach: string;
  warranty?: string;
  attachments?: string[];
  status: QuoteStatus;
  submittedAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteResponse {
  success: boolean;
  message: string;
  data: {
    quote: Quote;
  };
}

export interface QuotesListResponse {
  success: boolean;
  data: {
    quotes: Quote[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface SubmitQuoteInput {
  leadId: string;
  pricing: {
    items: QuoteItem[];
    subtotal: number;
    vat: number;
    total: number;
  };
  timeline: {
    startDate: string;
    completionDate: string;
  };
  approach: string;
  warranty?: string;
  attachments?: string[];
}

export interface UpdateQuoteInput {
  pricing?: {
    items: QuoteItem[];
    subtotal: number;
    vat: number;
    total: number;
  };
  timeline?: {
    startDate: string;
    completionDate: string;
  };
  approach?: string;
  warranty?: string;
  attachments?: string[];
}

/**
 * Submit a quote for a lead (professional only)
 */
export const submitQuote = async (leadId: string, input: Omit<SubmitQuoteInput, 'leadId'>): Promise<Quote> => {
  const response = await api.post<QuoteResponse>(`/leads/${leadId}/quotes`, input);
  return response.data.data.quote;
};

/**
 * Get all quotes for a lead (homeowner view)
 */
export const getQuotesForLead = async (leadId: string, params?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<{ quotes: Quote[]; total: number }> => {
  const response = await api.get<QuotesListResponse>(`/leads/${leadId}/quotes`, { params });
  return response.data.data;
};

/**
 * Get my quote for a specific lead (professional view)
 */
export const getMyQuoteForLead = async (leadId: string): Promise<Quote | null> => {
  const response = await api.get<{ success: boolean; data: { quote: Quote | null } }>(
    `/leads/${leadId}/quotes/my-quote`
  );
  return response.data.data.quote;
};

/**
 * Get my quotes (professional view)
 */
export const getMyQuotes = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ quotes: Quote[]; total: number }> => {
  const response = await api.get<QuotesListResponse>('/quotes/my-quotes', { params });
  return response.data.data;
};

/**
 * Get quote by ID
 */
export const getQuoteById = async (quoteId: string): Promise<Quote> => {
  const response = await api.get<QuoteResponse>(`/quotes/${quoteId}`);
  return response.data.data.quote;
};

/**
 * Update a quote (professional only, before acceptance)
 */
export const updateQuote = async (quoteId: string, input: UpdateQuoteInput): Promise<Quote> => {
  const response = await api.patch<QuoteResponse>(`/quotes/${quoteId}`, input);
  return response.data.data.quote;
};

/**
 * Delete a quote (professional only, before acceptance)
 */
export const deleteQuote = async (quoteId: string): Promise<void> => {
  await api.delete(`/quotes/${quoteId}`);
};

/**
 * Accept a quote (homeowner only)
 */
export const acceptQuote = async (quoteId: string, message?: string): Promise<Quote> => {
  const response = await api.post<QuoteResponse>(`/quotes/${quoteId}/accept`, { message });
  return response.data.data.quote;
};

/**
 * Decline a quote (homeowner only)
 */
export const declineQuote = async (quoteId: string, reason?: string): Promise<Quote> => {
  const response = await api.post<QuoteResponse>(`/quotes/${quoteId}/decline`, { reason });
  return response.data.data.quote;
};

export default {
  submitQuote,
  getQuotesForLead,
  getMyQuoteForLead,
  getMyQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  acceptQuote,
  declineQuote,
};
