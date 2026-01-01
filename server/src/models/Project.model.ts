import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { ROOM_CATEGORIES, type RoomCategory } from '@homezy/shared';

// ============================================================================
// Interfaces
// ============================================================================

export interface IProjectPhoto {
  _id: Types.ObjectId;
  imageUrl: string;
  thumbnailUrl?: string;
  photoType: 'main' | 'before' | 'after';
  caption?: string;
  roomCategories: RoomCategory[];
  displayOrder: number;

  // Ideas Publishing
  isPublishedToIdeas: boolean;
  publishedAt?: Date;

  // Admin Moderation
  adminStatus: 'active' | 'removed' | 'flagged';
  adminRemovedAt?: Date;
  adminRemovedBy?: Types.ObjectId;
  adminRemovalReason?: string;

  // Engagement metrics
  saveCount: number;
  viewCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  professionalId: Types.ObjectId;

  // Project Details
  name: string;
  description: string;
  serviceCategory: string;
  completionDate: Date;

  // Denormalized pro info for Ideas page
  businessName: string;
  proSlug?: string;
  proProfilePhoto?: string;
  proVerificationStatus: 'pending' | 'approved' | 'rejected';

  // Photos
  photos: IProjectPhoto[];

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Schemas
// ============================================================================

const ProjectPhotoSchema = new Schema<IProjectPhoto>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: String,
    photoType: {
      type: String,
      enum: ['main', 'before', 'after'],
      default: 'main',
    },
    caption: {
      type: String,
      maxlength: 500,
    },
    roomCategories: {
      type: [String],
      enum: ROOM_CATEGORIES,
      default: [],
    },
    displayOrder: {
      type: Number,
      default: 0,
    },

    // Ideas Publishing (admin must explicitly publish to Ideas page)
    isPublishedToIdeas: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,

    // Admin Moderation
    adminStatus: {
      type: String,
      enum: ['active', 'removed', 'flagged'],
      default: 'active',
    },
    adminRemovedAt: Date,
    adminRemovedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    adminRemovalReason: String,

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
  },
  {
    timestamps: true,
    _id: true,
  }
);

const ProjectSchema = new Schema<IProject>(
  {
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Project Details
    name: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    serviceCategory: {
      type: String,
      required: true,
      index: true,
    },
    completionDate: {
      type: Date,
      required: true,
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

    // Photos
    photos: [ProjectPhotoSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        // Transform photo _ids to id
        if (ret.photos) {
          ret.photos = ret.photos.map((photo: any) => {
            const transformed = { ...photo };
            transformed.id = photo._id?.toString();
            delete transformed._id;
            return transformed;
          });
        }
        return ret;
      },
    },
  }
);

// ============================================================================
// Indexes
// ============================================================================

// Pro's projects
ProjectSchema.index({ professionalId: 1, createdAt: -1 });

// Ideas page - published photos that are active
ProjectSchema.index({
  'photos.isPublishedToIdeas': 1,
  'photos.adminStatus': 1,
  'photos.publishedAt': -1,
});

// Ideas page - by room category
ProjectSchema.index({
  'photos.roomCategories': 1,
  'photos.isPublishedToIdeas': 1,
  'photos.adminStatus': 1,
});

// Ideas page - popular photos
ProjectSchema.index({
  'photos.isPublishedToIdeas': 1,
  'photos.adminStatus': 1,
  'photos.saveCount': -1,
});

// Admin moderation
ProjectSchema.index({ 'photos.adminStatus': 1, 'photos.createdAt': -1 });

// Service category filtering
ProjectSchema.index({ serviceCategory: 1, createdAt: -1 });

// ============================================================================
// Virtuals
// ============================================================================

ProjectSchema.virtual('photoCount').get(function () {
  return this.photos?.length || 0;
});

ProjectSchema.virtual('publishedPhotoCount').get(function () {
  return (
    this.photos?.filter(
      (p) => p.isPublishedToIdeas && p.adminStatus === 'active'
    ).length || 0
  );
});

// ============================================================================
// Export
// ============================================================================

export const Project: Model<IProject> = mongoose.model<IProject>(
  'Project',
  ProjectSchema
);

export default Project;
