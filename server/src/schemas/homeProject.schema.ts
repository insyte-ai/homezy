// @ts-nocheck - Temporary: disable type checking for initial implementation
import { z } from 'zod';
import {
  createHomeProjectSchema as sharedCreateHomeProjectSchema,
  updateHomeProjectSchema as sharedUpdateHomeProjectSchema,
  taskSchema as sharedTaskSchema,
  updateTaskSchema as sharedUpdateTaskSchema,
  costItemSchema as sharedCostItemSchema,
  updateCostItemSchema as sharedUpdateCostItemSchema,
  milestoneSchema as sharedMilestoneSchema,
  updateMilestoneSchema as sharedUpdateMilestoneSchema,
  inviteCollaboratorSchema as sharedInviteCollaboratorSchema,
  reorderTasksSchema as sharedReorderTasksSchema,
} from '@homezy/shared';

// ============================================================================
// Body Schemas (for POST/PATCH body validation)
// ============================================================================

export const createHomeProjectSchema = sharedCreateHomeProjectSchema;
export const updateHomeProjectSchema = sharedUpdateHomeProjectSchema;
export const addTaskSchema = sharedTaskSchema;
export const updateTaskSchema = sharedUpdateTaskSchema;
export const addCostItemSchema = sharedCostItemSchema;
export const updateCostItemSchema = sharedUpdateCostItemSchema;
export const addMilestoneSchema = sharedMilestoneSchema;
export const updateMilestoneSchema = sharedUpdateMilestoneSchema;
export const inviteCollaboratorSchema = sharedInviteCollaboratorSchema;
export const reorderTasksSchema = sharedReorderTasksSchema;

// ============================================================================
// Param Schemas
// ============================================================================

export const projectIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
});

export const taskIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  taskId: z.string().min(1, 'Task ID is required'),
});

export const costIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  costId: z.string().min(1, 'Cost item ID is required'),
});

export const milestoneIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  milestoneId: z.string().min(1, 'Milestone ID is required'),
});

export const collaboratorIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  userId: z.string().min(1, 'User ID is required'),
});

export const inviteTokenParamSchema = z.object({
  token: z.string().min(1, 'Invite token is required'),
});

// Aliases for backward compatibility
export const getHomeProjectByIdSchema = projectIdParamSchema;
export const deleteHomeProjectSchema = projectIdParamSchema;
export const deleteTaskSchema = taskIdParamSchema;
export const deleteCostItemSchema = costIdParamSchema;
export const deleteMilestoneSchema = milestoneIdParamSchema;
export const removeCollaboratorSchema = collaboratorIdParamSchema;
export const acceptInviteSchema = inviteTokenParamSchema;

// ============================================================================
// Query Schemas
// ============================================================================

export const listHomeProjectsSchema = z.object({
  status: z.enum(['planning', 'in-progress', 'on-hold', 'completed', 'cancelled']).optional(),
  category: z.string().optional(),
  isDefault: z.coerce.boolean().optional(),
  includeCollaborated: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

// Type exports
export type CreateHomeProjectInput = z.infer<typeof createHomeProjectSchema>;
export type UpdateHomeProjectInput = z.infer<typeof updateHomeProjectSchema>;
export type ListHomeProjectsInput = z.infer<typeof listHomeProjectsSchema>;
export type AddTaskInput = z.infer<typeof addTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AddCostItemInput = z.infer<typeof addCostItemSchema>;
export type UpdateCostItemInput = z.infer<typeof updateCostItemSchema>;
export type AddMilestoneInput = z.infer<typeof addMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
export type ReorderTasksInput = z.infer<typeof reorderTasksSchema>;
