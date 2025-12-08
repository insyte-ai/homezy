import Project, { IProject } from '../models/Project.model';
import { Lead } from '../models/Lead.model';
import { Quote } from '../models/Quote.model';
import mongoose from 'mongoose';

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'cancelled';

export interface CreateProjectInput {
  homeownerId: string;
  professionalId: string;
  leadId: string;
  quoteId: string;
  title: string;
  description: string;
  category: string;
  budgetEstimated: number;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateProjectStatusInput {
  status: ProjectStatus;
  completedAt?: Date;
}

/**
 * Create a new project from an accepted quote
 */
export async function createProject(input: CreateProjectInput): Promise<IProject> {
  const project = new Project({
    homeownerId: input.homeownerId,
    professionalId: input.professionalId,
    leadId: input.leadId,
    quoteId: input.quoteId,
    title: input.title,
    description: input.description,
    category: input.category,
    budgetEstimated: input.budgetEstimated,
    budgetActual: 0,
    status: 'planning',
    startDate: input.startDate,
    endDate: input.endDate,
    milestones: [],
    documents: [],
    photos: [],
  });

  await project.save();
  return project;
}

/**
 * Get a project by ID
 */
export async function getProjectById(projectId: string): Promise<IProject | null> {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return null;
  }
  return Project.findById(projectId);
}

/**
 * Get a project by lead ID
 */
export async function getProjectByLeadId(leadId: string): Promise<IProject | null> {
  return Project.findOne({ leadId });
}

/**
 * Get projects for a homeowner
 */
export async function getHomeownerProjects(
  homeownerId: string,
  options: { status?: ProjectStatus; limit?: number; skip?: number } = {}
): Promise<{ projects: IProject[]; total: number }> {
  const query: any = { homeownerId };

  if (options.status) {
    query.status = options.status;
  }

  const [projects, total] = await Promise.all([
    Project.find(query)
      .sort({ createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20),
    Project.countDocuments(query),
  ]);

  return { projects, total };
}

/**
 * Get projects for a professional
 */
export async function getProfessionalProjects(
  professionalId: string,
  options: { status?: ProjectStatus; limit?: number; skip?: number } = {}
): Promise<{ projects: IProject[]; total: number }> {
  const query: any = { professionalId };

  if (options.status) {
    query.status = options.status;
  }

  const [projects, total] = await Promise.all([
    Project.find(query)
      .sort({ createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20),
    Project.countDocuments(query),
  ]);

  return { projects, total };
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  projectId: string,
  userId: string,
  input: UpdateProjectStatusInput
): Promise<IProject | null> {
  const project = await Project.findById(projectId);

  if (!project) {
    return null;
  }

  // Only homeowner or professional can update status
  if (project.homeownerId !== userId && project.professionalId !== userId) {
    throw new Error('Not authorized to update this project');
  }

  // Validate status transitions
  const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
    planning: ['in-progress', 'cancelled'],
    'in-progress': ['completed', 'cancelled'],
    completed: [], // Cannot transition from completed
    cancelled: [], // Cannot transition from cancelled
  };

  const currentStatus = project.status as ProjectStatus;
  if (!validTransitions[currentStatus].includes(input.status)) {
    throw new Error(`Cannot transition from ${currentStatus} to ${input.status}`);
  }

  project.status = input.status;

  if (input.status === 'completed') {
    project.completedAt = input.completedAt || new Date();
  }

  await project.save();
  return project;
}

/**
 * Create a project when a quote is accepted
 */
export async function createProjectFromQuote(
  leadId: string,
  quoteId: string,
  homeownerId: string
): Promise<IProject> {
  // Get lead and quote details
  const [lead, quote] = await Promise.all([
    Lead.findById(leadId),
    Quote.findById(quoteId),
  ]);

  if (!lead) {
    throw new Error('Lead not found');
  }

  if (!quote) {
    throw new Error('Quote not found');
  }

  // Check if project already exists for this lead
  const existingProject = await Project.findOne({ leadId });
  if (existingProject) {
    return existingProject;
  }

  return createProject({
    homeownerId,
    professionalId: quote.professionalId.toString(),
    leadId,
    quoteId,
    title: lead.title,
    description: lead.description,
    category: lead.category,
    budgetEstimated: quote.pricing.total,
    startDate: quote.timeline.startDate,
    endDate: quote.timeline.completionDate,
  });
}
