// @ts-nocheck - Temporary: disable type checking for Railway deployment
import mongoose, { Schema, Document, Model } from 'mongoose';
import type {
  ServiceHistory as ServiceHistoryType,
  ServiceDocument,
  HomeServiceCategory,
  HomeServiceType,
  ProviderType,
} from '@homezy/shared';

export interface IServiceHistory extends Omit<ServiceHistoryType, 'id' | 'createdAt' | 'updatedAt'>, Document {}

const ServiceDocumentSchema = new Schema<ServiceDocument>({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['invoice', 'receipt', 'report', 'warranty', 'other'],
    required: true,
  },
  url: { type: String, required: true },
  filename: { type: String, required: true, maxlength: 255 },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const ServiceHistorySchema = new Schema<IServiceHistory>(
  {
    homeownerId: {
      type: String,
      required: true,
      index: true,
    },
    propertyId: {
      type: String,
      required: true,
      index: true,
    },
    homeProjectId: {
      type: String,
      index: true,
    },

    // Link to Homezy marketplace project (if applicable)
    projectId: {
      type: String,
      index: true,
    },
    quoteId: {
      type: String,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: [
        'hvac', 'plumbing', 'electrical', 'painting', 'flooring',
        'carpentry', 'roofing', 'landscaping', 'pool', 'pest-control',
        'cleaning', 'security', 'appliance-repair', 'general-maintenance',
        'renovation', 'other',
      ],
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      enum: ['maintenance', 'repair', 'installation', 'renovation', 'inspection'],
      required: true,
      index: true,
    },

    providerType: {
      type: String,
      enum: ['homezy', 'external'],
      required: true,
    },
    providerName: {
      type: String,
      maxlength: 200,
    },
    professionalId: {
      type: String,
      index: true,
    },

    cost: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['AED'],
      default: 'AED',
    },
    completedAt: {
      type: Date,
      required: true,
      index: true,
    },

    documents: {
      type: [ServiceDocumentSchema],
      default: [],
    },
    photos: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
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

// Indexes for efficient queries
ServiceHistorySchema.index({ homeownerId: 1, category: 1 });
ServiceHistorySchema.index({ homeownerId: 1, completedAt: -1 });
ServiceHistorySchema.index({ propertyId: 1, category: 1 });
ServiceHistorySchema.index({ propertyId: 1, completedAt: -1 });
ServiceHistorySchema.index({ category: 1, completedAt: -1 });

// Create and export model
export const ServiceHistory: Model<IServiceHistory> = mongoose.model<IServiceHistory>('ServiceHistory', ServiceHistorySchema);
export default ServiceHistory;
