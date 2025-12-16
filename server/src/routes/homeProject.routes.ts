import express from 'express';
import {
  createHomeProject,
  getMyHomeProjects,
  getHomeProjectById,
  getDefaultProject,
  updateHomeProject,
  deleteHomeProject,
  addTask,
  updateTask,
  deleteTask,
  reorderTasks,
  addCostItem,
  updateCostItem,
  deleteCostItem,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  inviteCollaborator,
  acceptInvite,
  removeCollaborator,
} from '../controllers/homeProject.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import projectResourceRoutes from './projectResource.routes';
import {
  createHomeProjectSchema,
  updateHomeProjectSchema,
  getHomeProjectByIdSchema,
  deleteHomeProjectSchema,
  listHomeProjectsSchema,
  addTaskSchema,
  updateTaskSchema,
  deleteTaskSchema,
  reorderTasksSchema,
  addCostItemSchema,
  updateCostItemSchema,
  deleteCostItemSchema,
  addMilestoneSchema,
  updateMilestoneSchema,
  deleteMilestoneSchema,
  inviteCollaboratorSchema,
  removeCollaboratorSchema,
  acceptInviteSchema,
} from '../schemas/homeProject.schema';

const router = express.Router();

// All routes require authentication and homeowner role
router.use(authenticate);
router.use(authorize('homeowner'));

// ============================================================================
// Project CRUD Routes
// ============================================================================

// Create project
router.post(
  '/',
  validate(createHomeProjectSchema),
  createHomeProject
);

// Get all projects for the authenticated user
router.get(
  '/',
  validate(listHomeProjectsSchema, 'query'),
  getMyHomeProjects
);

// Get default "My Ideas" project (must be before /:id route)
router.get(
  '/default',
  getDefaultProject
);

// Accept collaboration invite (must be before /:id route)
router.post(
  '/accept-invite/:token',
  validate(acceptInviteSchema, 'params'),
  acceptInvite
);

// Get project by ID
router.get(
  '/:id',
  validate(getHomeProjectByIdSchema, 'params'),
  getHomeProjectById
);

// Update project
router.patch(
  '/:id',
  validate(updateHomeProjectSchema),
  updateHomeProject
);

// Delete project
router.delete(
  '/:id',
  validate(deleteHomeProjectSchema, 'params'),
  deleteHomeProject
);

// ============================================================================
// Task Routes
// ============================================================================

// Add task to project
router.post(
  '/:id/tasks',
  validate(addTaskSchema),
  addTask
);

// Reorder tasks (must be before /:taskId route)
router.patch(
  '/:id/tasks/reorder',
  validate(reorderTasksSchema),
  reorderTasks
);

// Update task
router.patch(
  '/:id/tasks/:taskId',
  validate(updateTaskSchema),
  updateTask
);

// Delete task
router.delete(
  '/:id/tasks/:taskId',
  validate(deleteTaskSchema, 'params'),
  deleteTask
);

// ============================================================================
// Cost Item Routes
// ============================================================================

// Add cost item to project
router.post(
  '/:id/costs',
  validate(addCostItemSchema),
  addCostItem
);

// Update cost item
router.patch(
  '/:id/costs/:costId',
  validate(updateCostItemSchema),
  updateCostItem
);

// Delete cost item
router.delete(
  '/:id/costs/:costId',
  validate(deleteCostItemSchema, 'params'),
  deleteCostItem
);

// ============================================================================
// Milestone Routes
// ============================================================================

// Add milestone to project
router.post(
  '/:id/milestones',
  validate(addMilestoneSchema),
  addMilestone
);

// Update milestone
router.patch(
  '/:id/milestones/:milestoneId',
  validate(updateMilestoneSchema),
  updateMilestone
);

// Delete milestone
router.delete(
  '/:id/milestones/:milestoneId',
  validate(deleteMilestoneSchema, 'params'),
  deleteMilestone
);

// ============================================================================
// Collaboration Routes
// ============================================================================

// Invite collaborator
router.post(
  '/:id/collaborators/invite',
  validate(inviteCollaboratorSchema),
  inviteCollaborator
);

// Remove collaborator
router.delete(
  '/:id/collaborators/:userId',
  validate(removeCollaboratorSchema, 'params'),
  removeCollaborator
);

// ============================================================================
// Project Resources (nested routes)
// ============================================================================

router.use('/:id/resources', projectResourceRoutes);

export default router;
