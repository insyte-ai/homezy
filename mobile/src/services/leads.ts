/**
 * Leads API Service
 * Handles all lead-related API calls
 */

import { api } from './api';

// Enums
export enum LeadStatus {
  OPEN = 'open',
  FULL = 'full',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum UrgencyLevel {
  EMERGENCY = 'emergency',
  URGENT = 'urgent',
  FLEXIBLE = 'flexible',
  PLANNING = 'planning'
}

export enum BudgetBracket {
  UNDER_3K = 'under-3k',
  BRACKET_3K_5K = '3k-5k',
  BRACKET_5K_20K = '5k-20k',
  BRACKET_20K_50K = '20k-50k',
  BRACKET_50K_100K = '50k-100k',
  BRACKET_100K_250K = '100k-250k',
  OVER_250K = 'over-250k'
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

export interface LeadAttachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  thumbnail?: string;
  filename: string;
  size: number;
  uploadedAt: string;
}

export interface Lead {
  id: string;
  homeownerId: string | {
    id: string;
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
  attachments?: LeadAttachment[];
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
  hasClaimed?: boolean;
  leadType?: 'direct' | 'indirect';
  targetProfessionalId?: string;
  directLeadExpiresAt?: string;
  directLeadStatus?: 'pending' | 'accepted' | 'declined' | 'converted';
}

export interface LeadClaim {
  id: string;
  lead: string | Lead;
  professional: string;
  professionalName: string;
  creditsSpent: number;
  creditsCost?: number;
  claimedAt: string;
  quoteSubmitted?: boolean;
  refunded: boolean;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadClaimWithProfessional extends Omit<LeadClaim, 'professional'> {
  professionalId: string;
  professional?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profilePhoto?: string;
    proProfile?: {
      businessName?: string;
      slug?: string;
      phone?: string;
      rating?: number;
      reviewCount?: number;
      verificationStatus?: string;
    };
  };
}

export interface Quote {
  id: string;
  leadId: string;
  professionalId: string;
  professional?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    proProfile?: {
      businessName?: string;
      rating?: number;
      reviewCount?: number;
      verificationStatus?: string;
    };
  };
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  // Nested pricing object from backend
  pricing: {
    items: QuoteItem[];
    subtotal: number;
    vat: number;
    total: number;
  };
  // Nested timeline object from backend
  timeline: {
    estimatedDuration: number;
  };
  // These may be present on some endpoints (flattened) or in pricing object
  estimatedStartDate?: string;
  estimatedCompletionDate?: string;
  approach: string;
  warranty?: string;
  attachments?: { url: string; filename: string }[];
  questions?: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
  // For convenience - lead info when included
  lead?: {
    id: string;
    title: string;
    category: string;
  };
}

export interface QuoteItem {
  id: string;
  description: string;
  category: 'labor' | 'materials' | 'permits' | 'equipment' | 'other';
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

// Response types
interface LeadResponse {
  success: boolean;
  message: string;
  data: {
    lead: Lead;
  };
}

interface LeadsListResponse {
  success: boolean;
  data: {
    leads: Lead[];
    total: number;
    limit: number;
    offset: number;
  };
}

interface MarketplaceResponse {
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

interface ClaimLeadResponse {
  success: boolean;
  message: string;
  data: {
    claim: LeadClaim;
    lead: Lead;
    remainingCredits: number;
  };
}

interface MyClaimsResponse {
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

/**
 * Create a new lead
 */
export const createLead = async (input: CreateLeadInput): Promise<Lead> => {
  const response = await api.post<LeadResponse>('/leads', input);
  return response.data.data.lead;
};

/**
 * Create a direct lead (sent to specific professional)
 */
export const createDirectLead = async (
  professionalId: string,
  input: CreateLeadInput
): Promise<Lead> => {
  const response = await api.post<LeadResponse>('/leads/direct', {
    professionalId,
    ...input,
  });
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
 * Get my direct leads (professional view)
 */
export const getMyDirectLeads = async (params?: {
  status?: 'pending' | 'accepted' | 'declined' | 'converted';
}): Promise<{ leads: Lead[]; total: number }> => {
  const response = await api.get<{
    success: boolean;
    data: { leads: Lead[]; total: number };
  }>('/leads/my-direct-leads', { params });
  return response.data.data;
};

/**
 * Accept a direct lead
 */
export const acceptDirectLead = async (leadId: string): Promise<{
  lead: Lead;
  claim: LeadClaim;
  creditsDeducted: number;
}> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: {
      lead: Lead;
      claim: LeadClaim;
      creditsDeducted: number;
    };
  }>(`/leads/${leadId}/accept-direct`);
  return response.data.data;
};

/**
 * Decline a direct lead
 */
export const declineDirectLead = async (
  leadId: string,
  reason?: string
): Promise<Lead> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: { lead: Lead };
  }>(`/leads/${leadId}/decline-direct`, { reason });
  return response.data.data.lead;
};

/**
 * Get claims for a lead (homeowner view)
 */
export const getLeadClaims = async (leadId: string): Promise<LeadClaimWithProfessional[]> => {
  const response = await api.get<{
    success: boolean;
    data: { claims: LeadClaimWithProfessional[] };
  }>(`/leads/${leadId}/claims`);
  return response.data.data.claims;
};

/**
 * Generate AI-powered lead title and description
 */
export const generateLeadContent = async (data: {
  category: string;
  serviceAnswers?: {
    serviceId: string;
    answers: Record<string, string | string[] | number>;
  };
  location?: { emirate?: string; neighborhood?: string };
  urgency?: string;
  budgetBracket?: string;
}): Promise<{
  title: string;
  description: string;
}> => {
  const response = await api.post<{
    success: boolean;
    data: { title: string; description: string };
  }>('/leads/generate-content', data);
  return response.data.data;
};
