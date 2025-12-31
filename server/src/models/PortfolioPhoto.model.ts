import mongoose, { Schema, Document, Model } from 'mongoose';
import { ROOM_CATEGORIES, type RoomCategory } from '@homezy/shared';

export interface IPortfolioPhoto extends Document {
  professionalId: mongoose.Types.ObjectId;
  portfolioItemId?: string;

  // Image data
  imageUrl: string;
  thumbnailUrl?: string;

  // Categorization
  roomCategories: RoomCategory[];
  serviceCategory?: string;

  // Photo metadata
  photoType: 'main' | 'before' | 'after';
  caption?: string;

  // Project info
  projectTitle?: string;
  projectDescription?: string;

  // Denormalized pro info
  businessName: string;
  proSlug?: string;
  proProfilePhoto?: string;
  proVerificationStatus: 'pending' | 'approved' | 'rejected';

  // Engagement metrics
  saveCount: number;
  viewCount: number;

  // Status
  isPublished: boolean;
  publishedAt?: Date;
}

const PortfolioPhotoSchema = new Schema<IPortfolioPhoto>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    portfolioItemId: {
      type: String,
      index: true,
    },

    // Image data
    imageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: String,

    // Categorization
    roomCategories: {
      type: [String],
      enum: ROOM_CATEGORIES,
      default: [],
      index: true,
    },
    serviceCategory: {
      type: String,
      index: true,
    },

    // Photo metadata
    photoType: {
      type: String,
      enum: ['main', 'before', 'after'],
      default: 'main',
    },
    caption: {
      type: String,
      maxlength: 500,
    },

    // Project info
    projectTitle: {
      type: String,
      maxlength: 200,
    },
    projectDescription: {
      type: String,
      maxlength: 2000,
    },

    // Denormalized pro info
    businessName: {
      type: String,
      required: true,
    },
    proSlug: String,
    proProfilePhoto: String,
    proVerificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // Engagement metrics
    saveCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Status
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: Date,
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

// Indexes for Ideas page queries
PortfolioPhotoSchema.index({ roomCategories: 1, isPublished: 1, publishedAt: -1 });
PortfolioPhotoSchema.index({ isPublished: 1, publishedAt: -1 }); // Newest published
PortfolioPhotoSchema.index({ isPublished: 1, saveCount: -1 }); // Most popular
PortfolioPhotoSchema.index({ professionalId: 1, isPublished: 1 }); // Pro's photos
PortfolioPhotoSchema.index({ portfolioItemId: 1 }); // Project photos

// Text search on caption and project info
PortfolioPhotoSchema.index(
  { caption: 'text', projectTitle: 'text', projectDescription: 'text' },
  { weights: { projectTitle: 3, caption: 2, projectDescription: 1 } }
);

export const PortfolioPhoto: Model<IPortfolioPhoto> = mongoose.model<IPortfolioPhoto>(
  'PortfolioPhoto',
  PortfolioPhotoSchema
);

export default PortfolioPhoto;
