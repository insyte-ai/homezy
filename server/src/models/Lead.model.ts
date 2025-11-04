import mongoose, { Schema, Document, Model } from 'mongoose';
import type {
  Lead as LeadType,
  Location,
  Attachment,
  LeadPreferences,
  LeadClaim,
} from '@homezy/shared';

export interface ILead extends Omit<LeadType, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>, Document {
  expiresAt: Date;
}

export interface ILeadClaim extends Omit<LeadClaim, 'id' | 'claimedAt' | 'quoteSubmittedAt'>, Document {
  claimedAt: Date;
  quoteSubmittedAt?: Date;
}

const LocationSchema = new Schema<Location>({
  emirate: { type: String, required: true },
  neighborhood: String,
  fullAddress: String, // Hidden until claimed
  coordinates: {
    lat: Number,
    lng: Number,
  },
}, { _id: false });

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

const LeadPreferencesSchema = new Schema<LeadPreferences>({
  requiredVerification: {
    type: String,
    enum: ['any', 'basic', 'comprehensive'],
    default: 'any',
  },
  minRating: Number,
  maxResponseTime: Number,
  preferredStartDate: Date,
  additionalRequirements: String,
}, { _id: false });

const LeadSchema = new Schema<ILead>(
  {
    homeownerId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    budgetBracket: {
      type: String,
      required: true,
      enum: ['500-1k', '1k-5k', '5k-15k', '15k-50k', '50k-150k', '150k+'],
      index: true,
    },
    urgency: {
      type: String,
      required: true,
      enum: ['emergency', 'urgent', 'flexible', 'planning'],
      index: true,
    },
    timeline: String,
    attachments: [AttachmentSchema],
    preferences: {
      type: LeadPreferencesSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['open', 'full', 'quoted', 'accepted', 'expired', 'cancelled'],
      default: 'open',
      index: true,
    },
    claimCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    maxClaims: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
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
    toObject: {
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
LeadSchema.index({ status: 1, category: 1, 'location.emirate': 1, createdAt: -1 });
LeadSchema.index({ homeownerId: 1, createdAt: -1 });
LeadSchema.index({ expiresAt: 1 }); // For TTL cleanup
LeadSchema.index({ budgetBracket: 1 });
LeadSchema.index({ urgency: 1 });

// Virtual for checking if lead is full
LeadSchema.virtual('isFull').get(function () {
  return this.claimCount >= this.maxClaims;
});

// Virtual for checking if lead is expired
LeadSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt && this.status !== 'accepted';
});

// Pre-save middleware to update status
LeadSchema.pre('save', function (next) {
  // Update status to 'full' if max claims reached
  if (this.claimCount >= this.maxClaims && this.status === 'open') {
    this.status = 'full';
  }

  // Update status to 'expired' if past expiry date
  if (new Date() > this.expiresAt && this.status !== 'accepted') {
    this.status = 'expired';
  }

  next();
});

// LeadClaim Schema (for tracking who claimed what)
const LeadClaimSchema = new Schema<ILeadClaim>(
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
    creditsCost: {
      type: Number,
      required: true,
    },
    claimedAt: {
      type: Date,
      default: Date.now,
    },
    quoteSubmitted: {
      type: Boolean,
      default: false,
    },
    quoteSubmittedAt: Date,
  },
  {
    timestamps: false,
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

// Compound index for unique claims (one professional per lead)
LeadClaimSchema.index({ leadId: 1, professionalId: 1 }, { unique: true });
LeadClaimSchema.index({ professionalId: 1, claimedAt: -1 });

// Create and export models
export const Lead: Model<ILead> = mongoose.model<ILead>('Lead', LeadSchema);
export const LeadClaim: Model<ILeadClaim> = mongoose.model<ILeadClaim>('LeadClaim', LeadClaimSchema);

export default Lead;
