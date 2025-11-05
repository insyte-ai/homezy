import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICreditTransaction extends Document {
  professionalId: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  amount: number;
  creditType: 'free' | 'paid'; // Track if free or paid credits
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  expiresAt?: Date; // For purchased credits (6 months from purchase)
  remainingAmount: number; // For FIFO tracking - how many credits from this transaction are left
  metadata?: {
    leadId?: string;
    packageId?: string;
    purchaseId?: string;
    stripePaymentIntentId?: string;
    priceAED?: number;
    budgetBracket?: string;
    urgency?: string;
  };
}

export interface ICreditBalance extends Document {
  professionalId: string;
  totalBalance: number; // Total available credits
  freeCredits: number; // Free credits (welcome bonus, promos)
  paidCredits: number; // Purchased credits
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastPurchaseAt?: Date;
  lastSpendAt?: Date;
}

export interface ICreditPurchase extends Document {
  professionalId: string;
  packageId: string;
  credits: number;
  priceAED: number;
  stripePaymentIntentId: string;
  stripeSessionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  expiresAt: Date; // Credits expire 6 months from purchase
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    professionalId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['purchase', 'spend', 'refund', 'bonus'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    creditType: {
      type: String,
      enum: ['free', 'paid'],
      required: true,
      index: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      index: true, // For querying expired credits
    },
    remainingAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    metadata: {
      leadId: String,
      packageId: String,
      purchaseId: String,
      stripePaymentIntentId: String,
      priceAED: Number,
      budgetBracket: String,
      urgency: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const CreditBalanceSchema = new Schema<ICreditBalance>(
  {
    professionalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalBalance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    freeCredits: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    paidCredits: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    lifetimeEarned: {
      type: Number,
      default: 0,
    },
    lifetimeSpent: {
      type: Number,
      default: 0,
    },
    lastPurchaseAt: Date,
    lastSpendAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const CreditPurchaseSchema = new Schema<ICreditPurchase>(
  {
    professionalId: {
      type: String,
      required: true,
      index: true,
    },
    packageId: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    priceAED: {
      type: Number,
      required: true,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripeSessionId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
CreditTransactionSchema.index({ professionalId: 1, createdAt: -1 });
CreditTransactionSchema.index({ type: 1, createdAt: -1 });
CreditTransactionSchema.index({ creditType: 1, expiresAt: 1 }); // For FIFO deduction
CreditTransactionSchema.index({ professionalId: 1, remainingAmount: 1 }); // For finding available credits
CreditBalanceSchema.index({ professionalId: 1 }, { unique: true });
CreditPurchaseSchema.index({ professionalId: 1, createdAt: -1 });
CreditPurchaseSchema.index({ status: 1, expiresAt: 1 }); // For expiry jobs

export const CreditTransaction: Model<ICreditTransaction> = mongoose.model<ICreditTransaction>(
  'CreditTransaction',
  CreditTransactionSchema
);

export const CreditBalance: Model<ICreditBalance> = mongoose.model<ICreditBalance>(
  'CreditBalance',
  CreditBalanceSchema
);

export const CreditPurchase: Model<ICreditPurchase> = mongoose.model<ICreditPurchase>(
  'CreditPurchase',
  CreditPurchaseSchema
);

export default { CreditTransaction, CreditBalance, CreditPurchase };
