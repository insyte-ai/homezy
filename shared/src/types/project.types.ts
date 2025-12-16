/**
 * Home Project Management Types
 * Types for HomeProject, Task, CostItem, Milestone, Collaborator, and ProjectResource
 */

import type { HomeServiceCategory } from './home.types';

// ============================================================================
// Project Status & Enums
// ============================================================================

export const HOME_PROJECT_STATUSES = [
  'planning',
  'in-progress',
  'on-hold',
  'completed',
  'cancelled',
] as const;
export type HomeProjectStatus = typeof HOME_PROJECT_STATUSES[number];

export const TASK_STATUSES = ['todo', 'in-progress', 'blocked', 'done'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

export const COST_CATEGORIES = ['labor', 'materials', 'permits', 'other'] as const;
export type CostCategory = typeof COST_CATEGORIES[number];

export const COST_STATUSES = ['estimated', 'quoted', 'paid'] as const;
export type CostStatus = typeof COST_STATUSES[number];

export const COLLABORATOR_STATUSES = ['pending', 'accepted'] as const;
export type CollaboratorStatus = typeof COLLABORATOR_STATUSES[number];

export const RESOURCE_TYPES = [
  'idea',
  'pro',
  'product',
  'vendor',
  'document',
  'estimate',
  'link',
] as const;
export type ResourceType = typeof RESOURCE_TYPES[number];

export const DOCUMENT_CATEGORIES = [
  'design',
  'estimate',
  'contract',
  'permit',
  'receipt',
  'other',
] as const;
export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number];

export const VENDOR_TYPES = ['supplier', 'store', 'contractor'] as const;
export type VendorType = typeof VENDOR_TYPES[number];

// Project categories (areas of the home)
export const PROJECT_CATEGORIES = [
  'kitchen',
  'bathroom',
  'bedroom',
  'living-room',
  'dining-room',
  'outdoor',
  'garage',
  'hvac',
  'electrical',
  'plumbing',
  'flooring',
  'painting',
  'roofing',
  'landscaping',
  'pool',
  'security',
  'whole-home',
  'other',
] as const;
export type ProjectCategory = typeof PROJECT_CATEGORIES[number];

// ============================================================================
// Task Types
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo?: string; // collaborator userId
  dueDate?: Date;
  completedAt?: Date;
  priority: TaskPriority;
  order: number; // for drag-drop ordering
}

// ============================================================================
// Cost Item Types
// ============================================================================

export interface CostItem {
  id: string;
  title: string;
  category: CostCategory;
  estimatedCost?: number;
  actualCost?: number;
  vendorId?: string; // links to saved vendor resource
  status: CostStatus;
  receiptUrl?: string;
  notes?: string;
}

// ============================================================================
// Milestone Types
// ============================================================================

export const MILESTONE_STATUSES = ['pending', 'in-progress', 'completed'] as const;
export type MilestoneStatus = typeof MILESTONE_STATUSES[number];

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completedAt?: Date;
  status: MilestoneStatus;
}

// ============================================================================
// Collaborator Types
// ============================================================================

export interface Collaborator {
  userId?: string; // set when user accepts invite
  email: string;
  name?: string;
  invitedAt: Date;
  acceptedAt?: Date;
  status: CollaboratorStatus;
  inviteToken?: string; // used for accepting invite
}

// ============================================================================
// Home Project Types
// ============================================================================

export interface HomeProject {
  id: string;
  homeownerId: string; // creator/owner
  propertyId?: string; // which property this project is for

  name: string;
  description?: string;
  category: ProjectCategory;
  status: HomeProjectStatus;
  isDefault: boolean; // true for "My Ideas" collection - one per user

  // Integration with Homezy marketplace
  linkedLeadId?: string;
  linkedQuoteId?: string;
  linkedJobId?: string; // from accepted quotes

  // Budget Tracking
  budgetEstimated?: number;
  budgetActual?: number; // calculated: sum of cost items actualCost
  currency: 'AED';
  costItems: CostItem[];

  // Timeline
  startDate?: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;
  milestones: Milestone[];

  // Tasks (Kanban-style)
  tasks: Task[];

  // Collaboration
  collaborators: Collaborator[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// ============================================================================
// Project Resource Types (Polymorphic)
// ============================================================================

// Type-specific data interfaces
export interface IdeaResourceData {
  images: string[];
  sourceUrl?: string;
  inspiration?: string;
}

export interface ProResourceData {
  professionalId?: string; // Homezy pro
  externalName?: string;
  phone?: string;
  email?: string;
  rating?: number;
  specialty?: string;
}

export interface ProductResourceData {
  name: string;
  brand?: string;
  price?: number;
  currency: 'AED';
  sourceUrl?: string;
  images: string[];
  specifications?: string;
}

export interface VendorResourceData {
  name: string;
  type: VendorType;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
}

export interface DocumentResourceData {
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  category: DocumentCategory;
}

export interface EstimateResourceData {
  amount: number;
  currency: 'AED';
  validUntil?: Date;
  fromVendor?: string;
  description?: string;
  documentUrl?: string;
}

export interface LinkResourceData {
  url: string;
  previewImage?: string;
  description?: string;
}

// Union type for resource data
export type ResourceData =
  | { type: 'idea'; data: IdeaResourceData }
  | { type: 'pro'; data: ProResourceData }
  | { type: 'product'; data: ProductResourceData }
  | { type: 'vendor'; data: VendorResourceData }
  | { type: 'document'; data: DocumentResourceData }
  | { type: 'estimate'; data: EstimateResourceData }
  | { type: 'link'; data: LinkResourceData };

export interface ProjectResource {
  id: string;
  homeProjectId: string; // which project this belongs to
  homeownerId: string; // who saved it
  type: ResourceType;

  // Common fields
  title: string;
  notes?: string;
  tags: string[];

  // Type-specific data
  ideaData?: IdeaResourceData;
  proData?: ProResourceData;
  productData?: ProductResourceData;
  vendorData?: VendorResourceData;
  documentData?: DocumentResourceData;
  estimateData?: EstimateResourceData;
  linkData?: LinkResourceData;

  // Metadata
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Helper Types for API responses
// ============================================================================

export interface HomeProjectWithStats extends HomeProject {
  taskStats: {
    total: number;
    todo: number;
    inProgress: number;
    blocked: number;
    done: number;
  };
  budgetStats: {
    estimated: number;
    actual: number;
    remaining: number;
    percentUsed: number;
  };
  resourceCount: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  category: ProjectCategory;
  status: HomeProjectStatus;
  isDefault: boolean;
  taskProgress: number; // percentage of tasks completed
  budgetProgress: number; // percentage of budget used
  updatedAt: Date;
}
