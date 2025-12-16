import express from 'express';
import {
  createExpense,
  getMyExpenses,
  getExpenseById,
  getExpenseSummary,
  getExpensesByCategory,
  getExpensesByMonth,
  getExpenseTrends,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createExpenseSchema,
  updateExpenseSchema,
  getExpenseByIdSchema,
  deleteExpenseSchema,
  listExpensesSchema,
  getExpenseSummarySchema,
  getExpensesByCategorySchema,
  getExpensesByMonthSchema,
  getExpenseTrendsSchema,
} from '../schemas/expense.schema';

const router = express.Router();

// All routes require authentication and homeowner role
router.use(authenticate);
router.use(authorize('homeowner'));

// Create expense
router.post(
  '/',
  validate(createExpenseSchema),
  createExpense
);

// Get all expenses for the authenticated user
router.get(
  '/',
  validate(listExpensesSchema, 'query'),
  getMyExpenses
);

// Get expense summary (must be before /:id route)
router.get(
  '/summary',
  validate(getExpenseSummarySchema, 'query'),
  getExpenseSummary
);

// Get expenses grouped by category (must be before /:id route)
router.get(
  '/by-category',
  validate(getExpensesByCategorySchema, 'query'),
  getExpensesByCategory
);

// Get expenses grouped by month (must be before /:id route)
router.get(
  '/by-month',
  validate(getExpensesByMonthSchema, 'query'),
  getExpensesByMonth
);

// Get expense trends (must be before /:id route)
router.get(
  '/trends',
  validate(getExpenseTrendsSchema, 'query'),
  getExpenseTrends
);

// Get expense by ID
router.get(
  '/:id',
  validate(getExpenseByIdSchema, 'params'),
  getExpenseById
);

// Update expense
router.patch(
  '/:id',
  validate(updateExpenseSchema),
  updateExpense
);

// Delete expense
router.delete(
  '/:id',
  validate(deleteExpenseSchema, 'params'),
  deleteExpense
);

export default router;
