import { CreditBalance, CreditTransaction, CreditPurchase } from '../models/Credit.model';
import { BadRequestError, NotFoundError } from '../middleware/errorHandler.middleware';
import { logger } from '../utils/logger';
import { transformLeanDocs } from '../utils/mongoose.utils';
import mongoose from 'mongoose';

/**
 * Credit Service
 * Handles all credit-related operations with FIFO deduction strategy
 */

interface CreditCostParams {
  budgetBracket: 'under-3k' | '3k-5k' | '5k-20k' | '20k-50k' | '50k-100k' | '100k-250k' | 'over-250k';
  urgency: 'flexible' | 'within-month' | 'within-week' | 'emergency';
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

interface AddCreditsParams {
  professionalId: string;
  amount: number;
  creditType: 'free' | 'paid';
  description: string;
  expiresAt?: Date;
  metadata?: {
    leadId?: string;
    packageId?: string;
    purchaseId?: string;
    originalTransactionId?: string;
    stripePaymentIntentId?: string;
    priceAED?: number;
  };
}

interface SpendCreditsParams {
  professionalId: string;
  amount: number;
  description: string;
  metadata?: {
    leadId?: string;
    budgetBracket?: string;
    urgency?: string;
  };
}

/**
 * Credit cost calculation matrix
 * Base costs by budget bracket, multiplied by urgency, adjusted by verification discount
 */
const CREDIT_COST_MATRIX = {
  'under-3k': 3,
  '3k-5k': 4,
  '5k-20k': 6,
  '20k-50k': 8,
  '50k-100k': 12,
  '100k-250k': 16,
  'over-250k': 20,
} as const;

const URGENCY_MULTIPLIERS = {
  'flexible': 1.0,
  'within-month': 1.2,
  'within-week': 1.3,
  'emergency': 1.5,
} as const;

const VERIFICATION_DISCOUNTS = {
  'pending': 0,
  'approved': 0.1, // 10% discount for approved professionals
  'rejected': 0,
} as const;

/**
 * Calculate credit cost for a lead based on budget, urgency, and verification
 */
export const calculateCreditCost = (params: CreditCostParams): number => {
  const { budgetBracket, urgency, verificationStatus } = params;

  const baseCost = CREDIT_COST_MATRIX[budgetBracket];
  const urgencyMultiplier = URGENCY_MULTIPLIERS[urgency];
  const verificationDiscount = VERIFICATION_DISCOUNTS[verificationStatus];

  const costBeforeDiscount = Math.ceil(baseCost * urgencyMultiplier);
  const finalCost = Math.ceil(costBeforeDiscount * (1 - verificationDiscount));

  logger.debug('Credit cost calculated', {
    budgetBracket,
    urgency,
    verificationStatus,
    baseCost,
    urgencyMultiplier,
    verificationDiscount,
    costBeforeDiscount,
    finalCost,
  });

  return Math.max(1, finalCost); // Minimum 1 credit
};

/**
 * Get credit balance for a professional
 * Creates balance record if it doesn't exist (with 20 free credits welcome bonus)
 */
export const getBalance = async (professionalId: string) => {
  let balance = await CreditBalance.findOne({ professionalId });

  if (!balance) {
    const INITIAL_FREE_CREDITS = 20;

    // Create initial balance record with 20 free credits
    balance = await CreditBalance.create({
      professionalId,
      totalBalance: INITIAL_FREE_CREDITS,
      freeCredits: INITIAL_FREE_CREDITS,
      paidCredits: 0,
      lifetimeEarned: INITIAL_FREE_CREDITS,
      lifetimeSpent: 0,
      lastResetDate: new Date(),
    });

    // Create initial credit transaction for welcome bonus
    await CreditTransaction.create({
      professionalId,
      type: 'bonus',
      amount: INITIAL_FREE_CREDITS,
      creditType: 'free',
      balanceBefore: 0,
      balanceAfter: INITIAL_FREE_CREDITS,
      description: 'Welcome bonus - 20 free credits',
      remainingAmount: INITIAL_FREE_CREDITS,
      metadata: {},
    });

    logger.info('Credit balance created with welcome bonus', {
      professionalId,
      initialCredits: INITIAL_FREE_CREDITS
    });
  }

  return balance;
};

/**
 * Add credits to a professional's account
 * Used for purchases, refunds, and bonuses
 */
export const addCredits = async (params: AddCreditsParams) => {
  const { professionalId, amount, creditType, description, expiresAt, metadata } = params;

  if (amount <= 0) {
    throw new BadRequestError('Credit amount must be positive');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get current balance
    const balance = await getBalance(professionalId);
    const balanceBefore = balance.totalBalance;

    // Update balance
    const balanceAfter = balanceBefore + amount;
    balance.totalBalance = balanceAfter;
    balance.lifetimeEarned += amount;

    if (creditType === 'free') {
      balance.freeCredits += amount;
    } else {
      balance.paidCredits += amount;
      balance.lastPurchaseAt = new Date();
    }

    await balance.save({ session });

    // Create transaction record
    const transaction = await CreditTransaction.create(
      [
        {
          professionalId,
          type: creditType === 'free' ? 'bonus' : 'purchase',
          amount,
          creditType,
          balanceBefore,
          balanceAfter,
          description,
          expiresAt,
          remainingAmount: amount, // All credits initially available for FIFO
          metadata,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    logger.info('Credits added', {
      professionalId,
      amount,
      creditType,
      balanceAfter,
      transactionId: transaction[0]._id,
    });

    return {
      balance,
      transaction: transaction[0],
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to add credits', error, { professionalId, amount });
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Spend credits using FIFO strategy
 * Deducts free credits first, then paid credits (oldest first)
 */
export const spendCredits = async (params: SpendCreditsParams) => {
  const { professionalId, amount, description, metadata } = params;

  if (amount <= 0) {
    throw new BadRequestError('Credit amount must be positive');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get current balance
    const balance = await getBalance(professionalId);

    if (balance.totalBalance < amount) {
      throw new BadRequestError(
        `Insufficient credits. You have ${balance.totalBalance} credits but need ${amount}.`
      );
    }

    const balanceBefore = balance.totalBalance;
    let remainingToSpend = amount;
    const now = new Date();

    // FIFO Strategy: Deduct free credits first, then paid credits (oldest first)
    // Get all transactions with remaining credits, sorted by priority

    // 1. Free credits first (oldest first)
    const freeTransactions = await CreditTransaction.find({
      professionalId,
      creditType: 'free',
      remainingAmount: { $gt: 0 },
    })
      .sort({ createdAt: 1 })
      .session(session);

    for (const txn of freeTransactions) {
      if (remainingToSpend <= 0) break;

      const toDeduct = Math.min(txn.remainingAmount, remainingToSpend);
      txn.remainingAmount -= toDeduct;
      remainingToSpend -= toDeduct;
      balance.freeCredits -= toDeduct;

      await txn.save({ session });

      logger.debug('Deducted from free credit transaction', {
        transactionId: txn._id,
        deducted: toDeduct,
        remaining: txn.remainingAmount,
      });
    }

    // 2. Paid credits (oldest first, exclude expired)
    if (remainingToSpend > 0) {
      const paidTransactions = await CreditTransaction.find({
        professionalId,
        creditType: 'paid',
        remainingAmount: { $gt: 0 },
        $or: [
          { expiresAt: { $gt: now } }, // Not expired
          { expiresAt: { $exists: false } }, // No expiry
        ],
      })
        .sort({ createdAt: 1 })
        .session(session);

      for (const txn of paidTransactions) {
        if (remainingToSpend <= 0) break;

        const toDeduct = Math.min(txn.remainingAmount, remainingToSpend);
        txn.remainingAmount -= toDeduct;
        remainingToSpend -= toDeduct;
        balance.paidCredits -= toDeduct;

        await txn.save({ session });

        logger.debug('Deducted from paid credit transaction', {
          transactionId: txn._id,
          deducted: toDeduct,
          remaining: txn.remainingAmount,
        });
      }
    }

    // Should never happen due to initial balance check, but safety check
    if (remainingToSpend > 0) {
      throw new BadRequestError(
        'Failed to deduct credits. Some credits may have expired.'
      );
    }

    // Update balance
    const balanceAfter = balanceBefore - amount;
    balance.totalBalance = balanceAfter;
    balance.lifetimeSpent += amount;
    balance.lastSpendAt = new Date();

    await balance.save({ session });

    // Create spend transaction record
    const transaction = await CreditTransaction.create(
      [
        {
          professionalId,
          type: 'spend',
          amount: -amount, // Negative for spend
          creditType: 'paid', // Mark as paid for record keeping
          balanceBefore,
          balanceAfter,
          description,
          remainingAmount: 0, // Spent transactions don't have remaining
          metadata,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    logger.info('Credits spent', {
      professionalId,
      amount,
      balanceAfter,
      transactionId: transaction[0]._id,
      metadata,
    });

    return {
      balance,
      transaction: transaction[0],
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to spend credits', error, { professionalId, amount });
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Refund credits (e.g., if lead claim fails after deduction)
 * Adds credits back as paid credits with same expiry as original
 */
export const refundCredits = async (
  professionalId: string,
  amount: number,
  reason: string,
  metadata?: {
    leadId?: string;
    originalTransactionId?: string;
  }
) => {
  if (amount <= 0) {
    throw new BadRequestError('Refund amount must be positive');
  }

  // Add as paid credits (since these were originally paid)
  // Use 6 months from now as default expiry
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  const result = await addCredits({
    professionalId,
    amount,
    creditType: 'paid',
    description: `Refund: ${reason}`,
    expiresAt,
    metadata,
  });

  logger.info('Credits refunded', {
    professionalId,
    amount,
    reason,
    metadata,
  });

  return result;
};

/**
 * Get transaction history for a professional
 */
export const getTransactions = async (
  professionalId: string,
  options?: {
    limit?: number;
    offset?: number;
    type?: 'purchase' | 'spend' | 'refund' | 'bonus';
  }
) => {
  const query: any = { professionalId };

  if (options?.type) {
    query.type = options.type;
  }

  const limit = options?.limit || 50;
  const offset = options?.offset || 0;

  const [transactions, total] = await Promise.all([
    CreditTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    CreditTransaction.countDocuments(query),
  ]);

  return {
    transactions: transformLeanDocs(transactions),
    total,
    limit,
    offset,
  };
};

/**
 * Get credit purchase by Stripe payment intent ID
 */
export const getPurchaseByPaymentIntent = async (paymentIntentId: string) => {
  const purchase = await CreditPurchase.findOne({
    stripePaymentIntentId: paymentIntentId,
  });

  return purchase;
};

/**
 * Create a credit purchase record
 */
export const createPurchase = async (params: {
  professionalId: string;
  packageId: string;
  credits: number;
  priceAED: number;
  stripePaymentIntentId: string;
  stripeSessionId?: string;
}) => {
  // Credits expire 6 months from purchase
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 6);

  const purchase = await CreditPurchase.create({
    ...params,
    expiresAt,
    status: 'pending',
  });

  logger.info('Credit purchase created', {
    purchaseId: purchase._id,
    professionalId: params.professionalId,
    credits: params.credits,
    priceAED: params.priceAED,
  });

  return purchase;
};

/**
 * Complete a credit purchase (called after Stripe webhook confirms payment)
 */
export const completePurchase = async (paymentIntentId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchase = await CreditPurchase.findOne({
      stripePaymentIntentId: paymentIntentId,
    }).session(session);

    if (!purchase) {
      throw new NotFoundError('Purchase not found');
    }

    if (purchase.status === 'completed') {
      logger.warn('Purchase already completed', { paymentIntentId });
      return purchase;
    }

    // Update purchase status
    purchase.status = 'completed';
    await purchase.save({ session });

    // Add credits to balance
    await addCredits({
      professionalId: purchase.professionalId,
      amount: purchase.credits,
      creditType: 'paid',
      description: `Credit purchase - ${purchase.packageId}`,
      expiresAt: purchase.expiresAt,
      metadata: {
        packageId: purchase.packageId,
        purchaseId: (purchase._id as any).toString(),
        stripePaymentIntentId: paymentIntentId,
        priceAED: purchase.priceAED,
      },
    });

    await session.commitTransaction();

    logger.info('Credit purchase completed', {
      purchaseId: purchase._id,
      professionalId: purchase.professionalId,
      credits: purchase.credits,
    });

    return purchase;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to complete purchase', error, { paymentIntentId });
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Expire old credits (to be called by background job)
 */
export const expireOldCredits = async () => {
  const now = new Date();

  // Find all expired transactions with remaining credits
  const expiredTransactions = await CreditTransaction.find({
    creditType: 'paid',
    remainingAmount: { $gt: 0 },
    expiresAt: { $lte: now },
  });

  let totalExpired = 0;

  for (const txn of expiredTransactions) {
    const expiredAmount = txn.remainingAmount;
    totalExpired += expiredAmount;

    // Update the transaction
    txn.remainingAmount = 0;
    await txn.save();

    // Update the balance
    const balance = await getBalance(txn.professionalId);
    balance.paidCredits -= expiredAmount;
    balance.totalBalance -= expiredAmount;
    await balance.save();

    // Create expiry transaction record
    await CreditTransaction.create({
      professionalId: txn.professionalId,
      type: 'spend',
      amount: -expiredAmount,
      creditType: 'paid',
      balanceBefore: balance.totalBalance + expiredAmount,
      balanceAfter: balance.totalBalance,
      description: 'Credits expired',
      remainingAmount: 0,
      metadata: {
        purchaseId: txn.metadata?.purchaseId,
      },
    });

    logger.info('Credits expired', {
      professionalId: txn.professionalId,
      amount: expiredAmount,
      transactionId: txn._id,
    });
  }

  logger.info('Credit expiry job completed', {
    expiredTransactions: expiredTransactions.length,
    totalExpired,
  });

  return {
    expiredTransactions: expiredTransactions.length,
    totalExpired,
  };
};

/**
 * Reset monthly free credits for a professional
 * Sets free credits to 20 every month (on 1st of month)
 */
export const resetMonthlyCredits = async (professionalId: string) => {
  const MONTHLY_FREE_CREDITS = 20;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const balance = await getBalance(professionalId);
    const previousFreeCredits = balance.freeCredits;

    // Calculate the credit adjustment
    const creditAdjustment = MONTHLY_FREE_CREDITS - previousFreeCredits;
    const balanceBefore = balance.totalBalance;

    // Set free credits to 20
    balance.freeCredits = MONTHLY_FREE_CREDITS;
    balance.totalBalance = balance.freeCredits + balance.paidCredits;
    balance.lastResetDate = new Date();

    // Update lifetime earned only if we're adding credits
    if (creditAdjustment > 0) {
      balance.lifetimeEarned += creditAdjustment;
    }

    await balance.save({ session });

    // Create transaction record
    await CreditTransaction.create(
      [
        {
          professionalId,
          type: 'monthly_reset',
          amount: creditAdjustment,
          creditType: 'free',
          balanceBefore,
          balanceAfter: balance.totalBalance,
          description: `Monthly free credits reset to ${MONTHLY_FREE_CREDITS}`,
          remainingAmount: MONTHLY_FREE_CREDITS, // All free credits are available
          metadata: {
            previousFreeCredits,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();

    logger.info('Monthly credits reset', {
      professionalId,
      previousFreeCredits,
      newFreeCredits: MONTHLY_FREE_CREDITS,
      creditAdjustment,
      newBalance: balance.totalBalance,
    });

    return balance;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to reset monthly credits', error, { professionalId });
    throw error;
  } finally {
    session.endSession();
  }
};

export default {
  calculateCreditCost,
  getBalance,
  addCredits,
  spendCredits,
  refundCredits,
  getTransactions,
  getPurchaseByPaymentIntent,
  createPurchase,
  completePurchase,
  expireOldCredits,
  resetMonthlyCredits,
};
