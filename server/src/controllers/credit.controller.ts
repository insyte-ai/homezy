import { Request, Response } from 'express';
import * as creditService from '../services/credit.service';
import * as stripeService from '../services/stripe.service';
import { logger } from '../utils/logger';
import type {
  CreateCheckoutSessionInput,
  GetTransactionsInput,
  CalculateCreditCostInput,
  AddCreditsManuallyInput,
  RefundCreditsInput,
} from '../schemas/credit.schema';

/**
 * Get credit balance for the current professional
 * @route GET /api/v1/credits/balance
 * @access Private (Pro only)
 */
export const getBalance = async (req: Request, res: Response): Promise<void> => {
  const professionalId = (req.user!._id as any).toString();

  const balance = await creditService.getBalance(professionalId);

  res.status(200).json({
    success: true,
    data: {
      balance: balance.toJSON(),
    },
  });
};

/**
 * Get transaction history for the current professional
 * @route GET /api/v1/credits/transactions
 * @access Private (Pro only)
 */
export const getTransactions = async (
  req: Request<{}, {}, {}, GetTransactionsInput>,
  res: Response
): Promise<void> => {
  const professionalId = (req.user!._id as any).toString();
  const { limit, offset, type } = req.query;

  const result = await creditService.getTransactions(professionalId, {
    limit,
    offset,
    type,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * Get available credit packages
 * @route GET /api/v1/credits/packages
 * @access Public (anyone can view packages)
 */
export const getPackages = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      packages: Object.values(stripeService.CREDIT_PACKAGES),
    },
  });
};

/**
 * Create Stripe checkout session for credit purchase
 * @route POST /api/v1/credits/checkout
 * @access Private (Pro only)
 */
export const createCheckout = async (
  req: Request<{}, {}, CreateCheckoutSessionInput>,
  res: Response
): Promise<void> => {
  const professionalId = (req.user!._id as any).toString();
  const { packageId, successUrl, cancelUrl } = req.body;

  const user = req.user!;
  const customerEmail = user.email;

  const result = await stripeService.createCheckoutSession({
    professionalId,
    packageId,
    successUrl,
    cancelUrl,
    customerEmail,
  });

  logger.info('Checkout session created', {
    professionalId,
    packageId,
    sessionId: result.sessionId,
  });

  res.status(200).json({
    success: true,
    message: 'Checkout session created',
    data: result,
  });
};

/**
 * Handle Stripe webhook events
 * @route POST /api/v1/credits/webhook
 * @access Public (called by Stripe)
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).json({
      success: false,
      message: 'Missing stripe-signature header',
    });
    return;
  }

  try {
    // req.body should be raw buffer for webhook verification
    await stripeService.handleWebhookEvent(req.body, req.body, signature);

    res.status(200).json({
      success: true,
      message: 'Webhook processed',
    });
  } catch (error: any) {
    logger.error('Webhook processing failed', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Webhook processing failed',
    });
  }
};

/**
 * Calculate credit cost (for preview/testing)
 * @route POST /api/v1/credits/calculate-cost
 * @access Private (Pro only)
 */
export const calculateCost = async (
  req: Request<{}, {}, CalculateCreditCostInput>,
  res: Response
): Promise<void> => {
  const { budgetBracket, urgency } = req.body;

  const cost = creditService.calculateCreditCost({
    budgetBracket,
    urgency,
  });

  res.status(200).json({
    success: true,
    data: {
      cost,
      budgetBracket,
      urgency,
    },
  });
};

/**
 * Admin: Manually add credits to a professional's account
 * @route POST /api/v1/credits/admin/add
 * @access Private (Admin only)
 */
export const addCreditsManually = async (
  req: Request<{}, {}, AddCreditsManuallyInput>,
  res: Response
): Promise<void> => {
  const { professionalId, amount, creditType, description, expiresInMonths } = req.body;

  let expiresAt: Date | undefined;
  if (expiresInMonths) {
    expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + expiresInMonths);
  }

  const result = await creditService.addCredits({
    professionalId,
    amount,
    creditType,
    description,
    expiresAt,
    metadata: {
      packageId: 'manual-admin',
    },
  });

  logger.info('Credits added manually by admin', {
    adminId: (req.user!._id as any).toString(),
    professionalId,
    amount,
    creditType,
  });

  res.status(200).json({
    success: true,
    message: 'Credits added successfully',
    data: {
      balance: result.balance.toJSON(),
      transaction: result.transaction.toJSON(),
    },
  });
};

/**
 * Admin: Refund credits to a professional
 * @route POST /api/v1/credits/admin/refund
 * @access Private (Admin only)
 */
export const refundCreditsManually = async (
  req: Request<{}, {}, RefundCreditsInput>,
  res: Response
): Promise<void> => {
  const { professionalId, amount, reason, metadata } = req.body;

  const result = await creditService.refundCredits(professionalId, amount, reason, metadata);

  logger.info('Credits refunded by admin', {
    adminId: (req.user!._id as any).toString(),
    professionalId,
    amount,
    reason,
  });

  res.status(200).json({
    success: true,
    message: 'Credits refunded successfully',
    data: {
      balance: result.balance.toJSON(),
      transaction: result.transaction.toJSON(),
    },
  });
};

/**
 * Get purchase history for the current professional
 * @route GET /api/v1/credits/purchases
 * @access Private (Pro only)
 */
export const getPurchases = async (req: Request, res: Response): Promise<void> => {
  const professionalId = (req.user!._id as any).toString();
  const { limit = 50, offset = 0 } = req.query;

  // Get only purchase transactions
  const result = await creditService.getTransactions(professionalId, {
    limit: Number(limit),
    offset: Number(offset),
    type: 'purchase',
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};

export default {
  getBalance,
  getTransactions,
  getPackages,
  createCheckout,
  handleWebhook,
  calculateCost,
  addCreditsManually,
  refundCreditsManually,
  getPurchases,
};
