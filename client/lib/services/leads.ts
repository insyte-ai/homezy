import { api } from '../api';

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
  homeownerId: string;
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
  status: 'open' | 'full' | 'quoted' | 'accepted' | 'expired' | 'cancelled';
  claimsCount: number;
  quotesCount: number;
  expiresAt: string;
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

export default {
  createLead,
  getMyLeads,
  getLeadById,
  cancelLead,
};
