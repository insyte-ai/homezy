import { z } from 'zod';
import {
  HOME_PROJECT_STATUSES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  COST_CATEGORIES,
  COST_STATUSES,
  MILESTONE_STATUSES,
  RESOURCE_TYPES,
  DOCUMENT_CATEGORIES,
  VENDOR_TYPES,
  PROJECT_CATEGORIES,
} from '../types/project.types';

/**
 * Validation schemas for Home Project Management
 * HomeProject, Task, CostItem, Milestone, Collaborator, ProjectResource
 */

// ============================================================================
// Task Schemas
// ============================================================================

export const taskSchema = z.object({
  id: z.string().optional(), // Generated on server if not provided
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(TASK_STATUSES).optional().default('todo'),
  assignedTo: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  priority: z.enum(TASK_PRIORITIES).optional().default('medium'),
  order: z.number().int().nonnegative().optional(),
});

export const createTaskSchema = taskSchema;

export const updateTaskSchema = taskSchema.partial();

export const reorderTasksSchema = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    status: z.enum(TASK_STATUSES),
    order: z.number().int().nonnegative(),
  })),
});

// ============================================================================
// Cost Item Schemas
// ============================================================================

export const costItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Cost item title is required').max(200),
  category: z.enum(COST_CATEGORIES),
  estimatedCost: z.number().nonnegative().optional(),
  actualCost: z.number().nonnegative().optional(),
  vendorId: z.string().optional(), // Links to saved vendor resource
  status: z.enum(COST_STATUSES).optional().default('estimated'),
  receiptUrl: z.string().url().optional(),
  notes: z.string().max(1000).optional(),
});

export const createCostItemSchema = costItemSchema;

export const updateCostItemSchema = costItemSchema.partial();

// ============================================================================
// Milestone Schemas
// ============================================================================

export const milestoneSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Milestone title is required').max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  status: z.enum(MILESTONE_STATUSES).optional().default('pending'),
});

export const createMilestoneSchema = milestoneSchema;

export const updateMilestoneSchema = milestoneSchema.partial();

// ============================================================================
// Collaborator Schemas
// ============================================================================

export const inviteCollaboratorSchema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().max(100).optional(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
});

// ============================================================================
// Home Project Schemas
// ============================================================================

export const createHomeProjectSchema = z.object({
  propertyId: z.string().optional(),
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(PROJECT_CATEGORIES),
  status: z.enum(HOME_PROJECT_STATUSES).optional().default('planning'),
  isDefault: z.boolean().optional().default(false),

  // Marketplace integration
  linkedLeadId: z.string().optional(),
  linkedQuoteId: z.string().optional(),
  linkedJobId: z.string().optional(),

  // Budget
  budgetEstimated: z.number().nonnegative().optional(),

  // Timeline
  startDate: z.coerce.date().optional(),
  targetEndDate: z.coerce.date().optional(),

  // Initial items (optional)
  tasks: z.array(taskSchema).optional().default([]),
  costItems: z.array(costItemSchema).optional().default([]),
  milestones: z.array(milestoneSchema).optional().default([]),
});

export const updateHomeProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  category: z.enum(PROJECT_CATEGORIES).optional(),
  status: z.enum(HOME_PROJECT_STATUSES).optional(),
  propertyId: z.string().nullable().optional(), // Allow unlinking
  budgetEstimated: z.number().nonnegative().optional(),
  startDate: z.coerce.date().nullable().optional(),
  targetEndDate: z.coerce.date().nullable().optional(),
  actualEndDate: z.coerce.date().nullable().optional(),
});

// ============================================================================
// Project Resource Schemas
// ============================================================================

// Type-specific data schemas
export const ideaResourceDataSchema = z.object({
  images: z.array(z.string().url()).max(20).optional().default([]),
  sourceUrl: z.string().url().optional(),
  inspiration: z.string().max(2000).optional(),
});

export const proResourceDataSchema = z.object({
  professionalId: z.string().optional(), // Homezy pro
  externalName: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  rating: z.number().min(0).max(5).optional(),
  specialty: z.string().max(200).optional(),
});

export const productResourceDataSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  brand: z.string().max(100).optional(),
  price: z.number().nonnegative().optional(),
  sourceUrl: z.string().url().optional(),
  images: z.array(z.string().url()).max(10).optional().default([]),
  specifications: z.string().max(2000).optional(),
});

export const vendorResourceDataSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').max(200),
  type: z.enum(VENDOR_TYPES),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().max(500).optional(),
  website: z.string().url().optional(),
});

export const documentResourceDataSchema = z.object({
  fileUrl: z.string().url('Valid file URL is required'),
  fileType: z.string().max(50),
  fileSize: z.number().positive().optional(),
  category: z.enum(DOCUMENT_CATEGORIES),
});

export const estimateResourceDataSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  validUntil: z.coerce.date().optional(),
  fromVendor: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  documentUrl: z.string().url().optional(),
});

export const linkResourceDataSchema = z.object({
  url: z.string().url('Valid URL is required'),
  previewImage: z.string().url().optional(),
  description: z.string().max(500).optional(),
});

// Base resource schema (without refinement) - can be used with .omit(), .pick(), etc.
export const createResourceSchemaBase = z.object({
  homeProjectId: z.string().min(1, 'Project ID is required'),
  type: z.enum(RESOURCE_TYPES),
  title: z.string().min(1, 'Title is required').max(200),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  isFavorite: z.boolean().optional().default(false),

  // Type-specific data (one should be provided based on type)
  ideaData: ideaResourceDataSchema.optional(),
  proData: proResourceDataSchema.optional(),
  productData: productResourceDataSchema.optional(),
  vendorData: vendorResourceDataSchema.optional(),
  documentData: documentResourceDataSchema.optional(),
  estimateData: estimateResourceDataSchema.optional(),
  linkData: linkResourceDataSchema.optional(),
});

// Main resource schema with conditional type validation
export const createResourceSchema = createResourceSchemaBase.refine((data) => {
  // Ensure the correct data field is provided based on type
  const typeDataMap: Record<string, string> = {
    idea: 'ideaData',
    pro: 'proData',
    product: 'productData',
    vendor: 'vendorData',
    document: 'documentData',
    estimate: 'estimateData',
    link: 'linkData',
  };
  const requiredField = typeDataMap[data.type];
  return requiredField && data[requiredField as keyof typeof data] !== undefined;
}, {
  message: 'Type-specific data must be provided based on resource type',
});

export const updateResourceSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isFavorite: z.boolean().optional(),

  // Type-specific data updates
  ideaData: ideaResourceDataSchema.partial().optional(),
  proData: proResourceDataSchema.partial().optional(),
  productData: productResourceDataSchema.partial().optional(),
  vendorData: vendorResourceDataSchema.partial().optional(),
  documentData: documentResourceDataSchema.partial().optional(),
  estimateData: estimateResourceDataSchema.partial().optional(),
  linkData: linkResourceDataSchema.partial().optional(),
});

// ============================================================================
// Query Schemas
// ============================================================================

export const homeProjectQuerySchema = z.object({
  propertyId: z.string().optional(),
  status: z.enum(HOME_PROJECT_STATUSES).optional(),
  category: z.enum(PROJECT_CATEGORIES).optional(),
  isDefault: z.coerce.boolean().optional(),
  includeCollaborated: z.coerce.boolean().optional().default(true), // Include projects user is collaborator on
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export const resourceQuerySchema = z.object({
  homeProjectId: z.string().optional(), // If not provided, search across all user's projects
  type: z.enum(RESOURCE_TYPES).optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.coerce.boolean().optional(),
  search: z.string().max(100).optional(), // Search in title and notes
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

// ============================================================================
// Type Exports
// ============================================================================

export type TaskInput = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>;

export type CostItemInput = z.infer<typeof costItemSchema>;
export type CreateCostItemInput = z.infer<typeof createCostItemSchema>;
export type UpdateCostItemInput = z.infer<typeof updateCostItemSchema>;

export type MilestoneInput = z.infer<typeof milestoneSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;

export type CreateHomeProjectInput = z.infer<typeof createHomeProjectSchema>;
export type UpdateHomeProjectInput = z.infer<typeof updateHomeProjectSchema>;

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;

export type IdeaResourceDataInput = z.infer<typeof ideaResourceDataSchema>;
export type ProResourceDataInput = z.infer<typeof proResourceDataSchema>;
export type ProductResourceDataInput = z.infer<typeof productResourceDataSchema>;
export type VendorResourceDataInput = z.infer<typeof vendorResourceDataSchema>;
export type DocumentResourceDataInput = z.infer<typeof documentResourceDataSchema>;
export type EstimateResourceDataInput = z.infer<typeof estimateResourceDataSchema>;
export type LinkResourceDataInput = z.infer<typeof linkResourceDataSchema>;

export type HomeProjectQueryInput = z.infer<typeof homeProjectQuerySchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
