import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getMyProjects,
  getProject,
  getProjectByLead,
  updateStatus,
} from '../controllers/project.controller';

const router = Router();

// Homeowner routes
router.get('/my-projects', authenticate, authorize('homeowner'), getMyProjects);
router.get('/:projectId', authenticate, getProject);
router.get('/lead/:leadId', authenticate, getProjectByLead);
router.patch('/:projectId/status', authenticate, updateStatus);

export default router;
