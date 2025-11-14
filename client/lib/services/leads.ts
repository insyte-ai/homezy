import { api } from '../api';

// Enums
export enum LeadStatus {
  OPEN = 'open',
  FULL = 'full',
  QUOTED = 'quoted',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum UrgencyLevel {
  EMERGENCY = 'emergency', // <24h
  URGENT = 'urgent', // <1 week
  FLEXIBLE = 'flexible', // 1-4 weeks
  PLANNING = 'planning' // >1 month
}

export enum BudgetBracket {
  BELOW_1K = '500-1k', // AED 500-1K - 5 credits
  BRACKET_1K_5K = '1k-5k', // AED 1K-5K - 10 credits
  BRACKET_5K_15K = '5k-15k', // AED 5K-15K - 20 credits
  BRACKET_15K_50K = '15k-50k', // AED 15K-50K - 40 credits
  BRACKET_50K_150K = '50k-150k', // AED 50K-150K - 75 credits
  ABOVE_150K = '150k+' // AED 150K+ - 125 credits
}

// Interfaces
export interface CreateLeadInput {
  title: string;
  description: string;
  category: string;
  location: {
    emirate: string;
    neighborhood?: string;
    address?: string;
  };
  budgetBracket: string;
  urgency: string;
  timeline?: string;
  photos?: string[];
  serviceAnswers?: {
    serviceId: string;
    answers: {
      [questionId: string]: string | string[] | number;
    };
    answeredAt: Date;
  };
  preferredContactMethod?: 'phone' | 'email' | 'whatsapp';
  additionalNotes?: string;
}

export interface Lead {
  _id: string;
  homeownerId: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  title: string;
  description: string;
  category: string;
  location: {
    emirate: string;
    neighborhood?: string;
    address?: string;
  };
  budgetBracket: string;
  urgency: string;
  timeline?: string;
  photos?: string[];
  status: LeadStatus;
  claimsCount: number;
  quotesCount: number;
  maxClaimsAllowed: number;
  creditsRequired: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  matchScore?: number;
  claim?: LeadClaim;
}

export interface LeadClaim {
  _id: string;
  lead: string | Lead;
  professional: string;
  professionalName: string;
  creditsSpent: number;
  claimedAt: string;
  refunded: boolean;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadResponse {
  success: boolean;
  message: string;
  data: {
    lead: Lead;
  };
}

export interface LeadsListResponse {
  success: boolean;
  data: {
    leads: Lead[];
    total: number;
    limit: number;
    offset: number;
  };
}

export interface MarketplaceResponse {
  success: boolean;
  data: {
    leads: Lead[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ClaimLeadResponse {
  success: boolean;
  message: string;
  data: {
    claim: LeadClaim;
    lead: Lead;
    remainingCredits: number;
  };
}

export interface MyClaimsResponse {
  success: boolean;
  data: {
    leads: Lead[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface LeadFilters {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  urgency?: string;
  location?: string;
  search?: string;
  status?: string;
}

/**
 * Create a new lead
 */
export const createLead = async (input: CreateLeadInput): Promise<Lead> => {
  const response = await api.post<LeadResponse>('/leads', input);
  return response.data.data.lead;
};

/**
 * Get my leads (homeowner view)
 */
export const getMyLeads = async (params?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<{ leads: Lead[]; total: number }> => {
  const response = await api.get<LeadsListResponse>('/leads/my-leads', { params });
  return response.data.data;
};

/**
 * Get lead details by ID
 */
export const getLeadById = async (leadId: string): Promise<Lead> => {
  const response = await api.get<LeadResponse>(`/leads/${leadId}`);
  return response.data.data.lead;
};

/**
 * Cancel a lead
 */
export const cancelLead = async (leadId: string, reason?: string): Promise<Lead> => {
  const response = await api.post<LeadResponse>(`/leads/${leadId}/cancel`, { reason });
  return response.data.data.lead;
};

/**
 * Get marketplace leads (professional view)
 */
export const getMarketplace = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  urgency?: string;
  location?: string;
  search?: string;
}): Promise<{ leads: Lead[]; pagination: any }> => {
  const response = await api.get<MarketplaceResponse>('/leads/marketplace', { params });
  return response.data.data;
};

/**
 * Claim a lead (spend credits)
 */
export const claimLead = async (leadId: string): Promise<ClaimLeadResponse['data']> => {
  const response = await api.post<ClaimLeadResponse>(`/leads/${leadId}/claim`);
  return response.data.data;
};

/**
 * Get my claimed leads (professional view)
 */
export const getMyClaims = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ leads: Lead[]; pagination: any }> => {
  const response = await api.get<MyClaimsResponse>('/leads/my-claims', { params });
  return response.data.data;
};

/**
 * Calculate credit cost for a lead
 */
export const calculateCreditCost = async (leadId: string): Promise<{
  creditsRequired: number;
  breakdown: {
    baseCost: number;
    urgencyMultiplier: number;
    verificationDiscount: number;
  };
}> => {
  const response = await api.post(`/credits/calculate-cost`, { leadId });
  return response.data.data;
};

export default {
  createLead,
  getMyLeads,
  getLeadById,
  cancelLead,
  getMarketplace,
  claimLead,
  getMyClaims,
  calculateCreditCost,
};
