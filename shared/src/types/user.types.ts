import type { UserRole, EmirateId, ServiceCategoryId } from '../constants';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
  homeownerProfile?: HomeownerProfile;
  professionalProfile?: ProfessionalProfile;
}

export interface HomeownerProfile {
  favoriteProfessionals: string[];
  savedSearches: SavedSearch[];
  notificationPreferences: NotificationPreferences;
}

export interface ProfessionalProfile {
  businessName: string;
  tagline?: string;
  bio?: string;
  categories: ServiceCategoryId[];
  serviceAreas: ServiceArea[];
  yearsInBusiness?: number;
  teamSize?: number;
  languages: string[];

  // Verification
  verificationStatus: 'pending' | 'basic' | 'comprehensive' | 'rejected';
  verificationDocuments: VerificationDocument[];

  // Portfolio
  portfolio: PortfolioItem[];
  featuredProjects: string[]; // IDs of featured portfolio items

  // Pricing
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  minimumProjectSize?: number;

  // Stats
  rating: number;
  reviewCount: number;
  projectsCompleted: number;
  responseTimeHours: number;
  quoteAcceptanceRate: number;

  // Settings
  availability: Availability;
  businessType: 'sole-proprietor' | 'llc' | 'corporation';
}

export interface ServiceArea {
  emirate: EmirateId;
  neighborhoods: string[];
  serviceRadius?: number; // in km
  willingToTravelOutside: boolean;
  extraTravelCost?: number;
}

export interface VerificationDocument {
  type: 'license' | 'insurance' | 'id' | 'portfolio' | 'reference';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: ServiceCategoryId;
  images: string[];
  beforeImages?: string[];
  afterImages?: string[];
  completionDate: Date;
  isFeatured: boolean;
}

export interface Availability {
  schedule: WeeklySchedule;
  unavailableDates: Date[];
  maxAppointmentsPerDay: number;
  bufferTimeMinutes: number;
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isAvailable: boolean;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
}

export interface SavedSearch {
  id: string;
  name: string;
  category?: ServiceCategoryId;
  emirate?: EmirateId;
  minRating?: number;
  notifyOnNew: boolean;
  createdAt: Date;
}

export interface NotificationPreferences {
  email: {
    newQuote: boolean;
    newMessage: boolean;
    projectUpdate: boolean;
    reviewRequest: boolean;
    marketing: boolean;
  };
  push: {
    newQuote: boolean;
    newMessage: boolean;
    projectUpdate: boolean;
  };
  doNotDisturbStart?: string; // HH:mm format
  doNotDisturbEnd?: string; // HH:mm format
}
