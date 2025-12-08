import { api } from '../api';

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  homeownerId: string;
  professionalId: string;
  leadId: string;
  quoteId: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatus;
  budgetEstimated: number;
  budgetActual: number;
  startDate?: string;
  endDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectsResponse {
  success: boolean;
  projects: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ProjectResponse {
  success: boolean;
  project: Project;
  message?: string;
}

/**
 * Get my projects (homeowner)
 */
export async function getMyProjects(options?: {
  status?: ProjectStatus;
  page?: number;
  limit?: number;
}): Promise<ProjectsResponse> {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.page) params.set('page', options.page.toString());
  if (options?.limit) params.set('limit', options.limit.toString());

  const queryString = params.toString();
  const url = `/projects/my-projects${queryString ? `?${queryString}` : ''}`;

  const response = await api.get<ProjectsResponse>(url);
  return response.data;
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string): Promise<Project> {
  const response = await api.get<ProjectResponse>(`/projects/${projectId}`);
  return response.data.project;
}

/**
 * Get project by lead ID
 */
export async function getProjectByLeadId(leadId: string): Promise<Project | null> {
  try {
    const response = await api.get<ProjectResponse>(`/projects/lead/${leadId}`);
    return response.data.project;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  status: ProjectStatus
): Promise<Project> {
  const response = await api.patch<ProjectResponse>(`/projects/${projectId}/status`, {
    status,
  });
  return response.data.project;
}

/**
 * Helper to get status display info
 */
export function getProjectStatusInfo(status: ProjectStatus): {
  label: string;
  color: string;
  bgColor: string;
} {
  const statusInfo: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
    planning: { label: 'Planning', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    'in-progress': { label: 'In Progress', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100' },
    cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  };
  return statusInfo[status];
}
