import express from 'express';
import {
  getBalance,
  getTransactions,
  getPackages,
  createCheckout,
  handleWebhook,
  calculateCost,
  addCreditsManually,
  refundCreditsManually,
  getPurchases,
} from '../controllers/credit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createCheckoutSessionSchema,
  getTransactionsSchema,
  calculateCreditCostSchema,
  addCreditsManuallySchema,
  refundCreditsSchema,
} from '../schemas/credit.schema';

const router = express.Router();

/**
 * Public Routes
 */

// Get available credit packages (anyone can view)
router.get('/packages', getPackages);

// Stripe webhook (called by Stripe, no auth needed)
// Note: This route needs raw body, configured in app.ts
router.post('/webhook', handleWebhook);

/**
 * Private Routes (Pro only)
 */

// Get current balance
router.get('/balance', authenticate, authorize('pro'), getBalance);

// Get transaction history
router.get(
  '/transactions',
  authenticate,
  authorize('pro'),
  validate(getTransactionsSchema, 'query'),
  getTransactions
);

// Get purchase history
router.get('/purchases', authenticate, authorize('pro'), getPurchases);

// Create Stripe checkout session
router.post(
  '/checkout',
  authenticate,
  authorize('pro'),
  validate(createCheckoutSessionSchema),
  createCheckout
);

// Calculate credit cost (preview)
router.post(
  '/calculate-cost',
  authenticate,
  authorize('pro'),
  validate(calculateCreditCostSchema),
  calculateCost
);

/**
 * Admin Routes
 */

// Manually add credits
router.post(
  '/admin/add',
  authenticate,
  authorize('admin'),
  validate(addCreditsManuallySchema),
  addCreditsManually
);

// Manually refund credits
router.post(
  '/admin/refund',
  authenticate,
  authorize('admin'),
  validate(refundCreditsSchema),
  refundCreditsManually
);

export default router;
