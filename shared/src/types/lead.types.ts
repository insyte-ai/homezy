import type {
  ServiceCategoryId,
  EmirateId,
  BudgetBracketId,
  UrgencyLevel,
  LeadStatus,
  QuoteStatus,
} from '../constants';

export interface ServiceAnswers {
  serviceId: string;
  answers: {
    [questionId: string]: string | string[] | number;
  };
  answeredAt: Date;
  updatedAt?: Date;
}

export interface Lead {
  id: string;
  homeownerId: string;
  title: string;
  description: string;
  category: ServiceCategoryId;
  location: Location;
  budgetBracket: BudgetBracketId;
  urgency: UrgencyLevel;
  timeline?: string;
  attachments: Attachment[];
  serviceAnswers?: ServiceAnswers;
  preferences: LeadPreferences;
  // Lead Type: Direct (private to specific pro) or Indirect (public marketplace)
  leadType: 'direct' | 'indirect';
  targetProfessionalId?: string; // For direct leads
  directLeadExpiresAt?: Date; // 24-hour expiry for direct leads
  directLeadStatus?: 'pending' | 'accepted' | 'declined' | 'converted';
  convertedToPublicAt?: Date; // When direct lead was converted to public
  reminder1Sent?: boolean; // 12-hour reminder sent
  reminder2Sent?: boolean; // 1-hour reminder sent
  status: LeadStatus;
  claimCount: number;
  maxClaims: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  emirate: EmirateId;
  neighborhood?: string;
  fullAddress?: string; // Only visible to claimed professionals
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Attachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  thumbnail?: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

export interface LeadPreferences {
  requiredVerification: 'any' | 'basic' | 'comprehensive';
  minRating?: number;
  maxResponseTime?: number; // in hours
  preferredStartDate?: Date;
  additionalRequirements?: string;
}

export interface LeadClaim {
  id: string;
  leadId: string;
  professionalId: string;
  creditsCost: number;
  claimedAt: Date;
  quoteSubmitted: boolean;
  quoteSubmittedAt?: Date;
}

export interface Quote {
  id: string;
  leadId: string;
  professionalId: string;
  status: QuoteStatus;

  // Timeline
  estimatedStartDate: Date;
  estimatedCompletionDate: Date;
  estimatedDurationDays: number;

  // Budget
  items: QuoteItem[];
  subtotal: number;
  vat: number;
  total: number;

  // Details
  approach: string;
  warranty?: string;
  attachments: Attachment[];
  questions?: string; // Questions for homeowner

  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
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
