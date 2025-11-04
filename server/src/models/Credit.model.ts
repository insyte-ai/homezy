import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICreditTransaction extends Document {
  professionalId: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata?: {
    leadId?: string;
    packageId?: string;
    stripePaymentIntentId?: string;
    priceAED?: number;
  };
}

export interface ICreditBalance extends Document {
  professionalId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  lastPurchaseAt?: Date;
  lastSpendAt?: Date;
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
    metadata: {
      leadId: String,
      packageId: String,
      stripePaymentIntentId: String,
      priceAED: Number,
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
    balance: {
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

// Indexes
CreditTransactionSchema.index({ professionalId: 1, createdAt: -1 });
CreditTransactionSchema.index({ type: 1, createdAt: -1 });
CreditBalanceSchema.index({ professionalId: 1 }, { unique: true });

export const CreditTransaction: Model<ICreditTransaction> = mongoose.model<ICreditTransaction>(
  'CreditTransaction',
  CreditTransactionSchema
);

export const CreditBalance: Model<ICreditBalance> = mongoose.model<ICreditBalance>(
  'CreditBalance',
  CreditBalanceSchema
);

export default { CreditTransaction, CreditBalance };
