import { api } from '../api';
import type {
  HomeProject,
  HomeProjectWithStats,
  ProjectSummary,
  Task,
  CostItem,
  Milestone,
  Collaborator,
  HomeProjectStatus,
  TaskStatus,
  TaskPriority,
  CostCategory,
  CostStatus,
  MilestoneStatus,
  ProjectCategory,
} from '@homezy/shared';

// Re-export types for convenience
export type {
  HomeProject,
  HomeProjectWithStats,
  ProjectSummary,
  Task,
  CostItem,
  Milestone,
  Collaborator,
  HomeProjectStatus,
  TaskStatus,
  TaskPriority,
  CostCategory,
  CostStatus,
  MilestoneStatus,
  ProjectCategory,
};

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
