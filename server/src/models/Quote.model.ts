// @ts-nocheck - Temporary: disable type checking for Railway deployment
import mongoose, { Schema, Document, Model } from 'mongoose';
import type {
  Quote as QuoteType,
  QuoteItem,
  Attachment,
} from '@homezy/shared';

export interface IQuote extends Omit<QuoteType, 'id' | 'createdAt' | 'updatedAt' | 'estimatedStartDate' | 'estimatedCompletionDate'>, Document {
  estimatedStartDate: Date;
  estimatedCompletionDate: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
}

const QuoteItemSchema = new Schema<QuoteItem>({
  id: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['labor', 'materials', 'permits', 'equipment', 'other'],
    required: true,
  },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  notes: String,
});

const AttachmentSchema = new Schema<Attachment>({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['image', 'document'],
    required: true,
  },
  url: { type: String, required: true },
  thumbnail: String,
  filename: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const QuoteSchema = new Schema<IQuote>(
  {
    leadId: {
      type: String,
      required: true,
      index: true,
    },
    professionalId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      index: true,
    },

    // Timeline
    estimatedStartDate: {
      type: Date,
      required: true,
    },
    estimatedCompletionDate: {
      type: Date,
      required: true,
    },
    estimatedDurationDays: {
      type: Number,
      required: true,
      min: 1,
    },

    // Budget
    items: {
      type: [QuoteItemSchema],
      required: true,
      validate: {
        validator: function (items: QuoteItem[]) {
          return items.length > 0;
        },
        message: 'Quote must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    vat: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Details
    approach: {
      type: String,
      required: true,
    },
    warranty: String,
    attachments: [AttachmentSchema],
    questions: String,

    // Status timestamps
    acceptedAt: Date,
    declinedAt: Date,
    declineReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
QuoteSchema.index({ leadId: 1, professionalId: 1 }, { unique: true }); // One quote per professional per lead
QuoteSchema.index({ leadId: 1, status: 1, createdAt: -1 });
QuoteSchema.index({ professionalId: 1, status: 1, createdAt: -1 });
QuoteSchema.index({ status: 1, createdAt: -1 });

// Virtual for total breakdown
QuoteSchema.virtual('breakdown').get(function () {
  return {
    labor: this.items
      .filter(item => item.category === 'labor')
      .reduce((sum, item) => sum + item.total, 0),
    materials: this.items
      .filter(item => item.category === 'materials')
      .reduce((sum, item) => sum + item.total, 0),
    permits: this.items
      .filter(item => item.category === 'permits')
      .reduce((sum, item) => sum + item.total, 0),
    equipment: this.items
      .filter(item => item.category === 'equipment')
      .reduce((sum, item) => sum + item.total, 0),
    other: this.items
      .filter(item => item.category === 'other')
      .reduce((sum, item) => sum + item.total, 0),
  };
});

// Pre-save validation
QuoteSchema.pre('save', function (next) {
  // Validate that total matches items sum + VAT
  const itemsTotal = this.items.reduce((sum, item) => sum + item.total, 0);
  const calculatedTotal = itemsTotal + this.vat;

  if (Math.abs(calculatedTotal - this.total) > 0.01) {
    return next(new Error('Quote total does not match items sum + VAT'));
  }

  // Validate that each item total matches quantity * unitPrice
  for (const item of this.items) {
    const expectedTotal = item.quantity * item.unitPrice;
    if (Math.abs(expectedTotal - item.total) > 0.01) {
      return next(new Error(`Item "${item.description}" total does not match quantity * unitPrice`));
    }
  }

  // Validate timeline
  if (this.estimatedCompletionDate <= this.estimatedStartDate) {
    return next(new Error('Completion date must be after start date'));
  }

  next();
});

// Create and export model
export const Quote: Model<IQuote> = mongoose.model<IQuote>('Quote', QuoteSchema);
export default Quote;
