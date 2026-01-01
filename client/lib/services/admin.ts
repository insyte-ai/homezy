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
  id: string;
  type: 'lead_created' | 'professional_registered' | 'lead_claimed' | 'credit_purchased';
  description: string;
  timestamp: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface ProfessionalListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  businessName?: string;
  serviceCategories: string[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
  onboardingCompleted: boolean;
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
    id: string;
    title: string;
    claimedAt: string;
    status: string;
  }>;
}

export interface HomeownerListItem {
  id: string;
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
    id: string;
    title: string;
    category: string;
    status: string;
    createdAt: string;
    claimsCount: number;
  }>;
}

export interface AdminLead {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetBracket: string;
  urgency: string;
  status: 'open' | 'full' | 'accepted' | 'expired' | 'cancelled';
  homeowner: {
    id: string;
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
    id: string;
    professional: {
      id: string;
      firstName: string;
      lastName: string;
      businessName?: string;
    };
    claimedAt: string;
    creditsUsed: number;
  }>;
}

export interface CreditTransaction {
  id: string;
  user: {
    id: string;
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

export const updateTradeLicenseExpiry = async (
  id: string,
  tradeLicenseExpiry: string
): Promise<{ tradeLicenseExpiry: string }> => {
  const response = await api.put(`/admin/professionals/${id}/trade-license-expiry`, {
    tradeLicenseExpiry,
  });
  return response.data.data;
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

// ==================== IDEAS MODERATION ====================

import type {
  AdminIdeasPhoto,
  AdminIdeasListResponse,
  AdminIdeasStats,
  AdminPhotoStatus,
  RoomCategory,
} from '@homezy/shared';

export interface ListIdeasPhotosParams {
  limit?: number;
  cursor?: string;
  professionalId?: string;
  roomCategory?: RoomCategory;
  adminStatus?: AdminPhotoStatus;
  publishedToIdeas?: boolean;
  sort?: 'newest' | 'popular' | 'mostSaved';
}

export const getIdeasStats = async (): Promise<AdminIdeasStats> => {
  const response = await api.get('/admin/ideas/stats');
  return response.data.data.stats;
};

export const listIdeasPhotos = async (
  params: ListIdeasPhotosParams = {}
): Promise<AdminIdeasListResponse> => {
  const response = await api.get('/admin/ideas/photos', { params });
  return response.data.data;
};

export const getIdeasPhoto = async (
  projectId: string,
  photoId: string
): Promise<AdminIdeasPhoto> => {
  const response = await api.get(`/admin/ideas/photos/${projectId}/${photoId}`);
  return response.data.data.photo;
};

export const updateIdeasPhotoStatus = async (
  projectId: string,
  photoId: string,
  adminStatus: AdminPhotoStatus,
  removalReason?: string
): Promise<void> => {
  await api.patch(`/admin/ideas/photos/${projectId}/${photoId}/status`, {
    adminStatus,
    removalReason,
  });
};

export const bulkUpdateIdeasPhotoStatus = async (
  photos: Array<{ projectId: string; photoId: string }>,
  adminStatus: AdminPhotoStatus,
  removalReason?: string
): Promise<{ updatedCount: number }> => {
  const response = await api.post('/admin/ideas/photos/bulk-status', {
    photos,
    adminStatus,
    removalReason,
  });
  return response.data.data;
};

// Publish a photo to Ideas
export const publishPhotoToIdeas = async (
  projectId: string,
  photoId: string
): Promise<void> => {
  await api.post(`/admin/ideas/photos/${projectId}/${photoId}/publish`);
};

// Unpublish a photo from Ideas
export const unpublishPhotoFromIdeas = async (
  projectId: string,
  photoId: string
): Promise<void> => {
  await api.post(`/admin/ideas/photos/${projectId}/${photoId}/unpublish`);
};

// Bulk publish photos to Ideas
export const bulkPublishToIdeas = async (
  photos: Array<{ projectId: string; photoId: string }>
): Promise<{ updatedCount: number }> => {
  const response = await api.post('/admin/ideas/photos/bulk-publish', { photos });
  return response.data.data;
};

// Bulk unpublish photos from Ideas
export const bulkUnpublishFromIdeas = async (
  photos: Array<{ projectId: string; photoId: string }>
): Promise<{ updatedCount: number }> => {
  const response = await api.post('/admin/ideas/photos/bulk-unpublish', { photos });
  return response.data.data;
};
