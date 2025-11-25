import api from './api';

// ==================== INTERFACES ====================

export interface DashboardStats {
  totalHomeowners: number;
  totalProfessionals: number;
  pendingApprovals: number;
  totalLeads: number;
  activeLeads: number;
  completedLeads: number;
  totalRevenue: number;
  creditsPurchased: number;
  creditsUsed: number;
}

export interface RecentActivity {
  _id: string;
  type: 'lead_created' | 'professional_registered' | 'lead_claimed' | 'credit_purchased';
  description: string;
  timestamp: string;
  user?: {
    _id: string;
    name: string;
  };
}

export interface ProfessionalListItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  businessName?: string;
  serviceCategories: string[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  totalLeadsClaimed: number;
  totalJobsCompleted: number;
  rating?: number;
}

export interface ProfessionalDetails extends ProfessionalListItem {
  address?: {
    street: string;
    city: string;
    emirate: string;
    country: string;
  };
  tradeLicense?: {
    number: string;
    issueDate: string;
    expiryDate: string;
    documentUrl: string;
    verified: boolean;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
    documentUrl: string;
    verified: boolean;
  };
  adminNotes?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  creditBalance: {
    totalCredits: number;
    freeCredits: number;
    paidCredits: number;
  };
  leads: Array<{
    _id: string;
    title: string;
    claimedAt: string;
    status: string;
  }>;
}

export interface HomeownerListItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  totalLeadsSubmitted: number;
  activeLeads: number;
}

export interface HomeownerDetails extends HomeownerListItem {
  address?: {
    street: string;
    city: string;
    emirate: string;
    country: string;
  };
  leads: Array<{
    _id: string;
    title: string;
    category: string;
    status: string;
    createdAt: string;
    claimsCount: number;
  }>;
}

export interface AdminLead {
  _id: string;
  title: string;
  description: string;
  category: string;
  budgetBracket: string;
  urgency: string;
  status: 'open' | 'quoted' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  homeowner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
  location: {
    emirate: string;
    city: string;
  };
  claimsCount: number;
  maxClaimsAllowed: number;
  creditsRequired: number;
  createdAt: string;
  expiresAt: string;
  claims: Array<{
    _id: string;
    professional: {
      _id: string;
      firstName: string;
      lastName: string;
      businessName?: string;
    };
    claimedAt: string;
    creditsUsed: number;
  }>;
}

export interface CreditTransaction {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  amount: number;
  balance: {
    before: number;
    after: number;
  };
  description: string;
  stripeTransactionId?: string;
  createdAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ==================== DASHBOARD ====================

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data.data;
};

export const getRecentActivity = async (limit: number = 10): Promise<RecentActivity[]> => {
  const response = await api.get('/admin/dashboard/activity', { params: { limit } });
  return response.data.data;
};

// ==================== PROFESSIONALS ====================

export const getProfessionals = async (
  params: PaginationParams & {
    status?: string;
    verificationStatus?: string;
    serviceCategory?: string;
  }
): Promise<PaginatedResponse<ProfessionalListItem>> => {
  const response = await api.get('/admin/professionals', { params });
  const { items, pagination } = response.data.data;
  return { data: items, pagination };
};

export const getProfessionalDetails = async (id: string): Promise<ProfessionalDetails> => {
  const response = await api.get(`/admin/professionals/${id}`);
  return response.data.data;
};

export const approveProfessional = async (
  id: string,
  data: {
    verificationLevel?: 'basic' | 'comprehensive';
    notes?: string;
  }
): Promise<void> => {
  await api.post(`/admin/professionals/${id}/approve`, data);
};

export const rejectProfessional = async (
  id: string,
  data: {
    reason: string;
    notes?: string;
  }
): Promise<void> => {
  await api.post(`/admin/professionals/${id}/reject`, data);
};

export const suspendProfessional = async (
  id: string,
  data: {
    reason: string;
    notes?: string;
  }
): Promise<void> => {
  await api.post(`/admin/professionals/${id}/suspend`, data);
};

export const activateProfessional = async (id: string): Promise<void> => {
  await api.post(`/admin/professionals/${id}/activate`);
};

export const updateProfessionalNotes = async (
  id: string,
  notes: string
): Promise<void> => {
  await api.put(`/admin/professionals/${id}/notes`, { notes });
};

// ==================== HOMEOWNERS ====================

export const getHomeowners = async (
  params: PaginationParams
): Promise<PaginatedResponse<HomeownerListItem>> => {
  const response = await api.get('/admin/homeowners', { params });
  const { items, pagination } = response.data.data;
  return { data: items, pagination };
};

export const getHomeownerDetails = async (id: string): Promise<HomeownerDetails> => {
  const response = await api.get(`/admin/homeowners/${id}`);
  return response.data.data;
};

// ==================== LEADS ====================

export const getAdminLeads = async (
  params: PaginationParams & {
    status?: string;
    category?: string;
    urgency?: string;
    minBudget?: number;
    maxBudget?: number;
  }
): Promise<PaginatedResponse<AdminLead>> => {
  const response = await api.get('/admin/leads', { params });
  const { items, pagination } = response.data.data;
  return { data: items, pagination };
};

export const getAdminLeadDetails = async (id: string): Promise<AdminLead> => {
  const response = await api.get(`/admin/leads/${id}`);
  return response.data.data;
};

export const updateLeadStatus = async (
  id: string,
  status: string,
  notes?: string
): Promise<void> => {
  await api.put(`/admin/leads/${id}/status`, { status, notes });
};

// ==================== CREDITS ====================

export const getCreditTransactions = async (
  params: PaginationParams & {
    userId?: string;
    type?: string;
  }
): Promise<PaginatedResponse<CreditTransaction>> => {
  const response = await api.get('/admin/credits', { params });
  const { items, pagination } = response.data.data;
  return { data: items, pagination };
};

export const refundCredits = async (
  userId: string,
  amount: number,
  reason: string
): Promise<void> => {
  await api.post('/admin/credits/refund', { userId, amount, reason });
};

export const addBonusCredits = async (
  userId: string,
  amount: number,
  reason: string
): Promise<void> => {
  await api.post('/admin/credits/bonus', { userId, amount, reason });
};

// ==================== EXPORT ====================

export const exportProfessionals = async (
  format: 'csv' | 'json',
  filters?: any
): Promise<Blob> => {
  const response = await api.get('/admin/professionals/export', {
    params: { format, ...filters },
    responseType: 'blob',
  });
  return response.data;
};

export const exportLeads = async (
  format: 'csv' | 'json',
  filters?: any
): Promise<Blob> => {
  const response = await api.get('/admin/leads/export', {
    params: { format, ...filters },
    responseType: 'blob',
  });
  return response.data;
};

export const exportHomeowners = async (
  format: 'csv' | 'json',
  filters?: any
): Promise<Blob> => {
  const response = await api.get('/admin/homeowners/export', {
    params: { format, ...filters },
    responseType: 'blob',
  });
  return response.data;
};
