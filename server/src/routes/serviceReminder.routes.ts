import express from 'express';
import {
  createServiceReminder,
  getMyReminders,
  getServiceReminderById,
  getUpcomingReminders,
  getOverdueReminders,
  updateServiceReminder,
  snoozeReminder,
  pauseReminder,
  resumeReminder,
  completeReminder,
  convertToQuote,
  deleteServiceReminder,
  syncReminders,
} from '../controllers/serviceReminder.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createServiceReminderSchema,
  updateServiceReminderSchema,
  getServiceReminderByIdSchema,
  deleteServiceReminderSchema,
  listServiceRemindersSchema,
  getUpcomingRemindersSchema,
  snoozeReminderSchema,
  pauseReminderSchema,
  completeReminderSchema,
  convertToQuoteSchema,
} from '../schemas/serviceReminder.schema';

const router = express.Router();

// All routes require authentication and homeowner role
router.use(authenticate);
router.use(authorize('homeowner'));

// Create reminder
router.post(
  '/',
  validate(createServiceReminderSchema),
  createServiceReminder
);

// Sync reminders from service history (must be before /:id routes)
router.post(
  '/sync',
  syncReminders
);

// Get all reminders for the authenticated user
router.get(
  '/',
  validate(listServiceRemindersSchema, 'query'),
  getMyReminders
);

// Get upcoming reminders (must be before /:id route)
router.get(
  '/upcoming',
  validate(getUpcomingRemindersSchema, 'query'),
  getUpcomingReminders
);

// Get overdue reminders (must be before /:id route)
router.get(
  '/overdue',
  getOverdueReminders
);

// Get reminder by ID
router.get(
  '/:id',
  validate(getServiceReminderByIdSchema, 'params'),
  getServiceReminderById
);

// Update reminder
router.patch(
  '/:id',
  validate(updateServiceReminderSchema),
  updateServiceReminder
);

// Delete reminder
router.delete(
  '/:id',
  validate(deleteServiceReminderSchema, 'params'),
  deleteServiceReminder
);

// Snooze reminder
router.post(
  '/:id/snooze',
  validate(snoozeReminderSchema),
  snoozeReminder
);

// Pause reminder
router.post(
  '/:id/pause',
  validate(pauseReminderSchema, 'params'),
  pauseReminder
);

// Resume paused reminder
router.post(
  '/:id/resume',
  validate(pauseReminderSchema, 'params'),
  resumeReminder
);

// Mark service as completed
router.post(
  '/:id/complete',
  validate(completeReminderSchema),
  completeReminder
);

// Convert to quote request
router.post(
  '/:id/request-quote',
  validate(convertToQuoteSchema),
  convertToQuote
);

export default router;
