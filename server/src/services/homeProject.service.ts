// @ts-nocheck - Temporary: disable type checking for initial implementation
import { HomeProject, IHomeProject } from '../models/HomeProject.model';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import type {
  CreateHomeProjectInput,
  UpdateHomeProjectInput,
  TaskInput,
  CostItemInput,
  MilestoneInput,
  InviteCollaboratorInput,
  ReorderTasksInput,
  HomeProjectStatus,
} from '@homezy/shared';

const DEFAULT_PROJECT_NAME = 'My Ideas';

/**
 * Create a new home project
 */
export async function createHomeProject(
  homeownerId: string,
  input: CreateHomeProjectInput
): Promise<IHomeProject> {
  // Generate IDs for tasks, costItems, and milestones
  const tasks = (input.tasks || []).map((task, index) => ({
    ...task,
    id: task.id || uuidv4(),
    order: task.order ?? index,
  }));

  const costItems = (input.costItems || []).map(item => ({
    ...item,
    id: item.id || uuidv4(),
  }));

  const milestones = (input.milestones || []).map(milestone => ({
    ...milestone,
    id: milestone.id || uuidv4(),
  }));

  const project = new HomeProject({
    homeownerId,
    propertyId: input.propertyId,
    name: input.name,
    description: input.description,
    category: input.category,
    status: input.status || 'planning',
    isDefault: input.isDefault || false,
    linkedLeadId: input.linkedLeadId,
    linkedQuoteId: input.linkedQuoteId,
    linkedJobId: input.linkedJobId,
    budgetEstimated: input.budgetEstimated,
    currency: 'AED',
    costItems,
    startDate: input.startDate,
    targetEndDate: input.targetEndDate,
    milestones,
    tasks,
    collaborators: [],
  });

  await project.save();
  return project;
}

/**
 * Get or create the default "My Ideas" project for a user
 */
export async function getOrCreateDefaultProject(homeownerId: string): Promise<IHomeProject> {
  let defaultProject = await HomeProject.findOne({ homeownerId, isDefault: true });

  if (!defaultProject) {
    defaultProject = await createHomeProject(homeownerId, {
      name: DEFAULT_PROJECT_NAME,
      description: 'Your default collection for saving ideas, professionals, products, and more.',
      category: 'other',
      isDefault: true,
    });
  }

  return defaultProject;
}

/**
 * Get a project by ID
 */
export async function getHomeProjectById(projectId: string): Promise<IHomeProject | null> {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return null;
  }
  return HomeProject.findById(projectId);
}

/**
 * Get all projects for a homeowner
 */
export async function getHomeownerProjects(
  homeownerId: string,
  options: {
    status?: HomeProjectStatus;
    category?: string;
    isDefault?: boolean;
    includeCollaborated?: boolean;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ projects: IHomeProject[]; total: number }> {
  const query: any = {};

  if (options.includeCollaborated !== false) {
    // Include projects where user is owner OR collaborator
    query.$or = [
      { homeownerId },
      { 'collaborators.userId': homeownerId, 'collaborators.status': 'accepted' },
    ];
  } else {
    query.homeownerId = homeownerId;
  }

  if (options.status) query.status = options.status;
  if (options.category) query.category = options.category;
  if (options.isDefault !== undefined) query.isDefault = options.isDefault;

  const [projects, total] = await Promise.all([
    HomeProject.find(query)
      .sort({ isDefault: -1, updatedAt: -1 })
      .skip(options.offset || 0)
      .limit(options.limit || 20),
    HomeProject.countDocuments(query),
  ]);

  return { projects, total };
}

/**
 * Update a project
 */
export async function updateHomeProject(
  projectId: string,
  userId: string,
  input: UpdateHomeProjectInput
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project) {
    return null;
  }

  // Check authorization (owner or accepted collaborator)
  if (!canAccessProject(project, userId)) {
    throw new Error('Not authorized to update this project');
  }

  // Don't allow changing isDefault to true (use separate endpoint)
  if (input.name !== undefined) project.name = input.name;
  if (input.description !== undefined) project.description = input.description;
  if (input.category !== undefined) project.category = input.category as any;
  if (input.status !== undefined) project.status = input.status as any;
  if (input.propertyId !== undefined) project.propertyId = input.propertyId || undefined;
  if (input.budgetEstimated !== undefined) project.budgetEstimated = input.budgetEstimated;
  if (input.startDate !== undefined) project.startDate = input.startDate || undefined;
  if (input.targetEndDate !== undefined) project.targetEndDate = input.targetEndDate || undefined;
  if (input.actualEndDate !== undefined) project.actualEndDate = input.actualEndDate || undefined;

  await project.save();
  return project;
}

/**
 * Delete a project
 */
export async function deleteHomeProject(
  projectId: string,
  homeownerId: string
): Promise<boolean> {
  const project = await HomeProject.findById(projectId);

  if (!project || project.homeownerId !== homeownerId) {
    return false;
  }

  // Prevent deleting default project
  if (project.isDefault) {
    throw new Error('Cannot delete the default project');
  }

  await project.deleteOne();
  return true;
}

// ============================================================================
// Task Management
// ============================================================================

/**
 * Add a task to a project
 */
export async function addTask(
  projectId: string,
  userId: string,
  task: TaskInput
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || !canAccessProject(project, userId)) {
    return null;
  }

  const newTask = {
    ...task,
    id: task.id || uuidv4(),
    order: task.order ?? project.tasks.length,
  };

  project.tasks.push(newTask as any);
  await project.save();

  return project;
}

/**
 * Update a task
 */
export async function updateTask(
  projectId: string,
  userId: string,
  taskId: string,
  updates: Partial<TaskInput>
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || !canAccessProject(project, userId)) {
    return null;
  }

  const taskIndex = project.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return null;
  }

  const task = project.tasks[taskIndex];
  if (updates.title !== undefined) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.status !== undefined) {
    task.status = updates.status as any;
    if (updates.status === 'done' && !task.completedAt) {
      task.completedAt = new Date();
    }
  }
  if (updates.assignedTo !== undefined) task.assignedTo = updates.assignedTo;
  if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
  if (updates.priority !== undefined) task.priority = updates.priority as any;
  if (updates.order !== undefined) task.order = updates.order;

  await project.save();
  return project;
}

/**
 * Delete a task
 */
export async function deleteTask(
  projectId: string,
  userId: string,
  taskId: string
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || !canAccessProject(project, userId)) {
    return null;
  }

  const taskIndex = project.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return null;
  }

  project.tasks.splice(taskIndex, 1);
  await project.save();

  return project;
}

/**
 * Reorder tasks (for drag-drop)
 */
export async function reorderTasks(
  projectId: string,
  userId: string,
  taskUpdates: ReorderTasksInput['tasks']
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || !canAccessProject(project, userId)) {
    return null;
  }

  // Update each task's status and order
  for (const update of taskUpdates) {
    const task = project.tasks.find(t => t.id === update.id);
    if (task) {
      task.status = update.status as any;
      task.order = update.order;
      if (update.status === 'done' && !task.completedAt) {
        task.completedAt = new Date();
      }
    }
  }

  await project.save();
  return project;
}

// ============================================================================
// Cost Item Management
// ============================================================================

/**
 * Add a cost item to a project
 */
export async function addCostItem(
  projectId: string,
  userId: string,
  costItem: CostItemInput
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || !canAccessProject(project, userId)) {
    return null;
  }

  const newCostItem = {
    ...costItem,
    id: costItem.id || uuidv4(),
  };

  project.costItems.push(newCostItem as any);
  await project.save();

  return project;
}

/**
 * Update a cost item
 */
export async function updateCostItem(
  projectId: string,
  userId: string,
  costItemId: string,
  updates: Partial<CostItemInput>
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || !canAccessProject(project, userId)) {
    return null;
  }

  const itemIndex = project.costItems.findIndex(c => c.id === costItemId);
  if (itemIndex === -1) {
    return null;
  }

  const item = project.costItems[itemIndex];
  if (updates.title !== undefined) item.title = updates.title;
  if (updates.category !== undefined) item.category = updates.category as any;
  if (updates.estimatedCost !== undefined) item.estimatedCost = updates.estimatedCost;
  if (updates.actualCost !== undefined) item.actualCost = updates.actualCost;
  if (updates.vendorId !== undefined) item.vendorId = updates.vendorId;
  if (updates.status !== undefined) item.status = updates.status as any;
  if (updates.receiptUrl !== undefined) item.receiptUrl = updates.receiptUrl;
  if (updates.notes !== undefined) item.notes = updates.notes;

  await project.save();
  return project;
}

/**
 * Delete a cost item
 */
export async function deleteCostItem(
  projectId: string,
  userId: string,
  costItemId: string
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || !canAccessProject(project, userId)) {
    return null;
  }

  const itemIndex = project.costItems.findIndex(c => c.id === costItemId);
  if (itemIndex === -1) {
    return null;
  }

  project.costItems.splice(itemIndex, 1);
  await project.save();

  return project;
}

// ============================================================================
// Milestone Management
// ============================================================================

/**
 * Add a milestone to a project
 */
export async function addMilestone(
  projectId: string,
  userId: string,
  milestone: MilestoneInput
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || !canAccessProject(project, userId)) {
    return null;
  }

  const newMilestone = {
    ...milestone,
    id: milestone.id || uuidv4(),
  };

  project.milestones.push(newMilestone as any);
  await project.save();

  return project;
}

/**
 * Update a milestone
 */
export async function updateMilestone(
  projectId: string,
  userId: string,
  milestoneId: string,
  updates: Partial<MilestoneInput>
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || !canAccessProject(project, userId)) {
    return null;
  }

  const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
  if (milestoneIndex === -1) {
    return null;
  }

  const milestone = project.milestones[milestoneIndex];
  if (updates.title !== undefined) milestone.title = updates.title;
  if (updates.description !== undefined) milestone.description = updates.description;
  if (updates.dueDate !== undefined) milestone.dueDate = updates.dueDate;
  if (updates.status !== undefined) {
    milestone.status = updates.status as any;
    if (updates.status === 'completed' && !milestone.completedAt) {
      milestone.completedAt = new Date();
    }
  }

  await project.save();
  return project;
}

/**
 * Delete a milestone
 */
export async function deleteMilestone(
  projectId: string,
  userId: string,
  milestoneId: string
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || !canAccessProject(project, userId)) {
    return null;
  }

  const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
  if (milestoneIndex === -1) {
    return null;
  }

  project.milestones.splice(milestoneIndex, 1);
  await project.save();

  return project;
}

// ============================================================================
// Collaboration
// ============================================================================

/**
 * Invite a collaborator to a project
 */
export async function inviteCollaborator(
  projectId: string,
  homeownerId: string,
  input: InviteCollaboratorInput
): Promise<{ project: IHomeProject; inviteToken: string } | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || project.homeownerId !== homeownerId) {
    return null;
  }

  // Check if already invited
  const existingCollaborator = project.collaborators.find(
    c => c.email.toLowerCase() === input.email.toLowerCase()
  );

  if (existingCollaborator) {
    throw new Error('User is already invited to this project');
  }

  // Generate invite token
  const inviteToken = crypto.randomBytes(32).toString('hex');

  project.collaborators.push({
    email: input.email.toLowerCase(),
    name: input.name,
    invitedAt: new Date(),
    status: 'pending',
    inviteToken,
  } as any);

  await project.save();

  return { project, inviteToken };
}

/**
 * Accept a collaboration invite
 */
export async function acceptCollaboratorInvite(
  inviteToken: string,
  userId: string,
  userEmail: string
): Promise<IHomeProject | null> {
  const project = await HomeProject.findOne({
    'collaborators.inviteToken': inviteToken,
  });

  if (!project) {
    return null;
  }

  const collaborator = project.collaborators.find(c => c.inviteToken === inviteToken);
  if (!collaborator) {
    return null;
  }

  // Verify email matches
  if (collaborator.email.toLowerCase() !== userEmail.toLowerCase()) {
    throw new Error('Email does not match invite');
  }

  collaborator.userId = userId;
  collaborator.acceptedAt = new Date();
  collaborator.status = 'accepted';
  collaborator.inviteToken = undefined;

  await project.save();
  return project;
}

/**
 * Remove a collaborator from a project
 */
export async function removeCollaborator(
  projectId: string,
  homeownerId: string,
  collaboratorUserId: string
): Promise<IHomeProject | null> {
  const project = await HomeProject.findById(projectId);

  if (!project || project.homeownerId !== homeownerId) {
    return null;
  }

  const collaboratorIndex = project.collaborators.findIndex(
    c => c.userId === collaboratorUserId
  );

  if (collaboratorIndex === -1) {
    return null;
  }

  project.collaborators.splice(collaboratorIndex, 1);
  await project.save();

  return project;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a user can access a project (owner or accepted collaborator)
 */
function canAccessProject(project: IHomeProject, userId: string): boolean {
  if (project.homeownerId === userId) {
    return true;
  }

  const collaborator = project.collaborators.find(
    c => c.userId === userId && c.status === 'accepted'
  );

  return !!collaborator;
}

/**
 * Check if a user is the owner of a project
 */
export function isProjectOwner(project: IHomeProject, userId: string): boolean {
  return project.homeownerId === userId;
}
