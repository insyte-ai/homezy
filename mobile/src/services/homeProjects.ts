/**
 * Home Projects API Service
 * Handles all home project-related API calls
 */

import { api } from './api';

// ============================================================================
// Types
// ============================================================================

export type HomeProjectStatus = 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
export type ProjectCategory = 'kitchen' | 'bathroom' | 'bedroom' | 'living-room' | 'dining-room' | 'outdoor' | 'garage' | 'hvac' | 'electrical' | 'plumbing' | 'flooring' | 'painting' | 'roofing' | 'landscaping' | 'pool' | 'security' | 'whole-home' | 'other';
export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type CostCategory = 'labor' | 'materials' | 'permits' | 'other';
export type CostStatus = 'estimated' | 'quoted' | 'paid';
export type MilestoneStatus = 'pending' | 'in-progress' | 'completed';
export type CollaboratorStatus = 'pending' | 'accepted' | 'declined';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  priority: TaskPriority;
  order: number;
}

export interface CostItem {
  id: string;
  title: string;
  category: CostCategory;
  estimatedCost?: number;
  actualCost?: number;
  vendorId?: string;
  status: CostStatus;
  receiptUrl?: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  status: MilestoneStatus;
}

export interface Collaborator {
  userId?: string;
  email: string;
  name?: string;
  invitedAt: string;
  acceptedAt?: string;
  status: CollaboratorStatus;
  inviteToken?: string;
}

export interface HomeProject {
  id: string;
  homeownerId: string;
  propertyId?: string;
  name: string;
  description?: string;
  category: ProjectCategory;
  status: HomeProjectStatus;
  isDefault: boolean;
  linkedLeadId?: string;
  linkedQuoteId?: string;
  linkedJobId?: string;
  budgetEstimated?: number;
  budgetActual?: number;
  currency: 'AED';
  costItems: CostItem[];
  startDate?: string;
  targetEndDate?: string;
  actualEndDate?: string;
  milestones: Milestone[];
  tasks: Task[];
  collaborators: Collaborator[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface HomeProjectWithStats extends HomeProject {
  tasksCompleted: number;
  tasksTotal: number;
  progress: number;
}

// ============================================================================
// Input Types
// ============================================================================

export interface CreateHomeProjectInput {
  name: string;
  description?: string;
  category: ProjectCategory;
  propertyId?: string;
  budgetEstimated?: number;
  startDate?: string;
  targetEndDate?: string;
}

export interface UpdateHomeProjectInput {
  name?: string;
  description?: string;
  category?: ProjectCategory;
  propertyId?: string;
  status?: HomeProjectStatus;
  budgetEstimated?: number;
  startDate?: string;
  targetEndDate?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignedTo?: string;
}

export interface ReorderTasksInput {
  taskOrders: { taskId: string; order: number; status?: TaskStatus }[];
}

export interface CreateCostItemInput {
  title: string;
  category: CostCategory;
  estimatedCost?: number;
  actualCost?: number;
  vendorId?: string;
  status?: CostStatus;
  notes?: string;
}

export interface UpdateCostItemInput {
  title?: string;
  category?: CostCategory;
  estimatedCost?: number;
  actualCost?: number;
  vendorId?: string;
  status?: CostStatus;
  receiptUrl?: string;
  notes?: string;
}

export interface CreateMilestoneInput {
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: MilestoneStatus;
}

export interface InviteCollaboratorInput {
  email: string;
  name?: string;
}

export interface HomeProjectListParams {
  propertyId?: string;
  status?: HomeProjectStatus;
  category?: ProjectCategory;
  isDefault?: boolean;
  includeCollaborated?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

interface ProjectResponse {
  success: boolean;
  data: {
    project: HomeProject;
  };
}

interface ProjectsListResponse {
  success: boolean;
  data: {
    projects: HomeProjectWithStats[];
    total: number;
    limit: number;
    offset: number;
  };
}

interface DefaultProjectResponse {
  success: boolean;
  data: {
    project: HomeProject;
    created: boolean;
  };
}

// ============================================================================
// Project CRUD
// ============================================================================

/**
 * Create a new home project
 */
export async function createHomeProject(input: CreateHomeProjectInput): Promise<HomeProject> {
  const response = await api.post<ProjectResponse>('/home-projects', input);
  return response.data.data.project;
}

/**
 * Get all projects for the authenticated user
 */
export async function getMyHomeProjects(params?: HomeProjectListParams): Promise<{
  projects: HomeProjectWithStats[];
  total: number;
}> {
  const response = await api.get<ProjectsListResponse>('/home-projects', { params });
  return {
    projects: response.data.data.projects,
    total: response.data.data.total,
  };
}

/**
 * Get a project by ID
 */
export async function getHomeProjectById(projectId: string): Promise<HomeProject> {
  const response = await api.get<ProjectResponse>(`/home-projects/${projectId}`);
  return response.data.data.project;
}

/**
 * Get or create the default "My Ideas" project
 */
export async function getDefaultProject(): Promise<{ project: HomeProject; created: boolean }> {
  const response = await api.get<DefaultProjectResponse>('/home-projects/default');
  return response.data.data;
}

/**
 * Update a project
 */
export async function updateHomeProject(
  projectId: string,
  input: UpdateHomeProjectInput
): Promise<HomeProject> {
  const response = await api.patch<ProjectResponse>(`/home-projects/${projectId}`, input);
  return response.data.data.project;
}

/**
 * Delete a project
 */
export async function deleteHomeProject(projectId: string): Promise<void> {
  await api.delete(`/home-projects/${projectId}`);
}

// ============================================================================
// Task Management
// ============================================================================

/**
 * Add a task to a project
 */
export async function addTask(projectId: string, task: CreateTaskInput): Promise<HomeProject> {
  const response = await api.post<ProjectResponse>(`/home-projects/${projectId}/tasks`, task);
  return response.data.data.project;
}

/**
 * Update a task
 */
export async function updateTask(
  projectId: string,
  taskId: string,
  updates: UpdateTaskInput
): Promise<HomeProject> {
  const response = await api.patch<ProjectResponse>(
    `/home-projects/${projectId}/tasks/${taskId}`,
    updates
  );
  return response.data.data.project;
}

/**
 * Delete a task
 */
export async function deleteTask(projectId: string, taskId: string): Promise<HomeProject> {
  const response = await api.delete<ProjectResponse>(
    `/home-projects/${projectId}/tasks/${taskId}`
  );
  return response.data.data.project;
}

/**
 * Reorder tasks (for drag-drop)
 */
export async function reorderTasks(
  projectId: string,
  input: ReorderTasksInput
): Promise<HomeProject> {
  const response = await api.patch<ProjectResponse>(
    `/home-projects/${projectId}/tasks/reorder`,
    input
  );
  return response.data.data.project;
}

// ============================================================================
// Cost Item Management
// ============================================================================

/**
 * Add a cost item to a project
 */
export async function addCostItem(
  projectId: string,
  costItem: CreateCostItemInput
): Promise<HomeProject> {
  const response = await api.post<ProjectResponse>(`/home-projects/${projectId}/costs`, costItem);
  return response.data.data.project;
}

/**
 * Update a cost item
 */
export async function updateCostItem(
  projectId: string,
  costId: string,
  updates: UpdateCostItemInput
): Promise<HomeProject> {
  const response = await api.patch<ProjectResponse>(
    `/home-projects/${projectId}/costs/${costId}`,
    updates
  );
  return response.data.data.project;
}

/**
 * Delete a cost item
 */
export async function deleteCostItem(projectId: string, costId: string): Promise<HomeProject> {
  const response = await api.delete<ProjectResponse>(
    `/home-projects/${projectId}/costs/${costId}`
  );
  return response.data.data.project;
}

// ============================================================================
// Milestone Management
// ============================================================================

/**
 * Add a milestone to a project
 */
export async function addMilestone(
  projectId: string,
  milestone: CreateMilestoneInput
): Promise<HomeProject> {
  const response = await api.post<ProjectResponse>(
    `/home-projects/${projectId}/milestones`,
    milestone
  );
  return response.data.data.project;
}

/**
 * Update a milestone
 */
export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  updates: UpdateMilestoneInput
): Promise<HomeProject> {
  const response = await api.patch<ProjectResponse>(
    `/home-projects/${projectId}/milestones/${milestoneId}`,
    updates
  );
  return response.data.data.project;
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(
  projectId: string,
  milestoneId: string
): Promise<HomeProject> {
  const response = await api.delete<ProjectResponse>(
    `/home-projects/${projectId}/milestones/${milestoneId}`
  );
  return response.data.data.project;
}

// ============================================================================
// Collaboration
// ============================================================================

/**
 * Invite a collaborator to a project
 */
export async function inviteCollaborator(
  projectId: string,
  input: InviteCollaboratorInput
): Promise<HomeProject> {
  const response = await api.post<ProjectResponse>(
    `/home-projects/${projectId}/collaborators/invite`,
    input
  );
  return response.data.data.project;
}

/**
 * Accept a collaboration invite
 */
export async function acceptInvite(token: string): Promise<HomeProject> {
  const response = await api.post<ProjectResponse>(`/home-projects/accept-invite/${token}`);
  return response.data.data.project;
}

/**
 * Remove a collaborator from a project
 */
export async function removeCollaborator(
  projectId: string,
  userId: string
): Promise<HomeProject> {
  const response = await api.delete<ProjectResponse>(
    `/home-projects/${projectId}/collaborators/${userId}`
  );
  return response.data.data.project;
}

// ============================================================================
// Helper Configuration
// ============================================================================

export const projectStatusConfig: Record<HomeProjectStatus, { label: string; color: string; bgColor: string }> = {
  planning: { label: 'Planning', color: '#6366F1', bgColor: '#EEF2FF' },
  'in-progress': { label: 'In Progress', color: '#F59E0B', bgColor: '#FFFBEB' },
  'on-hold': { label: 'On Hold', color: '#6B7280', bgColor: '#F3F4F6' },
  completed: { label: 'Completed', color: '#10B981', bgColor: '#ECFDF5' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bgColor: '#FEF2F2' },
};

export const projectCategoryConfig: Record<ProjectCategory, { label: string; icon: string }> = {
  kitchen: { label: 'Kitchen', icon: 'restaurant' },
  bathroom: { label: 'Bathroom', icon: 'water' },
  bedroom: { label: 'Bedroom', icon: 'bed' },
  'living-room': { label: 'Living Room', icon: 'tv' },
  'dining-room': { label: 'Dining Room', icon: 'restaurant-outline' },
  outdoor: { label: 'Outdoor', icon: 'leaf' },
  garage: { label: 'Garage', icon: 'car' },
  hvac: { label: 'HVAC', icon: 'thermometer' },
  electrical: { label: 'Electrical', icon: 'flash' },
  plumbing: { label: 'Plumbing', icon: 'water-outline' },
  flooring: { label: 'Flooring', icon: 'grid' },
  painting: { label: 'Painting', icon: 'color-palette' },
  roofing: { label: 'Roofing', icon: 'home' },
  landscaping: { label: 'Landscaping', icon: 'leaf-outline' },
  pool: { label: 'Pool', icon: 'water' },
  security: { label: 'Security', icon: 'shield-checkmark' },
  'whole-home': { label: 'Whole Home', icon: 'home-outline' },
  other: { label: 'Other', icon: 'ellipsis-horizontal' },
};

export const taskStatusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  todo: { label: 'To Do', color: '#6B7280', bgColor: '#F3F4F6' },
  'in-progress': { label: 'In Progress', color: '#3B82F6', bgColor: '#EFF6FF' },
  blocked: { label: 'Blocked', color: '#EF4444', bgColor: '#FEF2F2' },
  done: { label: 'Done', color: '#10B981', bgColor: '#ECFDF5' },
};

export const taskPriorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#6B7280' },
  medium: { label: 'Medium', color: '#F59E0B' },
  high: { label: 'High', color: '#EF4444' },
};

export const costCategoryConfig: Record<CostCategory, { label: string; icon: string }> = {
  labor: { label: 'Labor', icon: 'people' },
  materials: { label: 'Materials', icon: 'cube' },
  permits: { label: 'Permits', icon: 'document-text' },
  other: { label: 'Other', icon: 'ellipsis-horizontal' },
};

export const costStatusConfig: Record<CostStatus, { label: string; color: string }> = {
  estimated: { label: 'Estimated', color: '#6B7280' },
  quoted: { label: 'Quoted', color: '#3B82F6' },
  paid: { label: 'Paid', color: '#10B981' },
};
