import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getDashboardStats,
  getRecentActivity,
  getProfessionals,
  getProfessionalById,
  approveProfessional,
  rejectProfessional,
  getHomeowners,
  getHomeownerById,
  getLeads,
  getLeadById,
  getCreditTransactions,
  reloadKnowledgeBase,
  getKnowledgeBaseStats,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/activity', getRecentActivity);

// Professional management routes
router.get('/professionals', getProfessionals);
router.get('/professionals/:id', getProfessionalById);
router.post('/professionals/:id/approve', approveProfessional);
router.post('/professionals/:id/reject', rejectProfessional);

// Homeowner management routes
router.get('/homeowners', getHomeowners);
router.get('/homeowners/:id', getHomeownerById);

// Lead management routes
router.get('/leads', getLeads);
router.get('/leads/:id', getLeadById);

// Credit management routes
router.get('/credits', getCreditTransactions);

// Knowledge base management routes
router.get('/knowledge-base/stats', getKnowledgeBaseStats);
router.post('/knowledge-base/reload', reloadKnowledgeBase);

export default router;
