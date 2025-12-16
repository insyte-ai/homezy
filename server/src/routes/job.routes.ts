import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getMyJobs,
  getJob,
  getJobByLead,
  updateStatus,
} from '../controllers/job.controller';

const router = Router();

// Homeowner routes
router.get('/my-jobs', authenticate, authorize('homeowner'), getMyJobs);
router.get('/:jobId', authenticate, getJob);
router.get('/lead/:leadId', authenticate, getJobByLead);
router.patch('/:jobId/status', authenticate, updateStatus);

export default router;
