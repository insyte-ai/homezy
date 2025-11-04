import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  professionalId: string;
  homeownerId: string;
  projectId: string;
  overallRating: number;
  categoryRatings: ICategoryRatings;
  reviewText: string;
  photos?: string[];
  wouldRecommend: boolean;
  projectCompleted: boolean;
  completionNotes?: string;
  professionalResponse?: IProfessionalResponse;
  isVerified: boolean;
  helpfulCount: number;
}

export interface ICategoryRatings {
  professionalism: number;
  quality: number;
  timeliness: number;
  value: number;
  communication: number;
}

export interface IProfessionalResponse {
  text: string;
  respondedAt: Date;
}

const CategoryRatingsSchema = new Schema<ICategoryRatings>({
  professionalism: { type: Number, required: true, min: 1, max: 5 },
  quality: { type: Number, required: true, min: 1, max: 5 },
  timeliness: { type: Number, required: true, min: 1, max: 5 },
  value: { type: Number, required: true, min: 1, max: 5 },
  communication: { type: Number, required: true, min: 1, max: 5 },
}, { _id: false });

const ProfessionalResponseSchema = new Schema<IProfessionalResponse>({
  text: { type: String, required: true },
  respondedAt: { type: Date, default: Date.now },
}, { _id: false });

const ReviewSchema = new Schema<IReview>(
  {
    professionalId: {
      type: String,
      required: true,
      index: true,
    },
    homeownerId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: {
      type: String,
      required: true,
      unique: true, // One review per project
    },
    overallRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    categoryRatings: {
      type: CategoryRatingsSchema,
      required: true,
    },
    reviewText: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 500,
    },
    photos: [{ type: String }],
    wouldRecommend: {
      type: Boolean,
      required: true,
    },
    projectCompleted: {
      type: Boolean,
      required: true,
    },
    completionNotes: String,
    professionalResponse: ProfessionalResponseSchema,
    isVerified: {
      type: Boolean,
      default: true, // Auto-verified if from accepted quote
    },
    helpfulCount: {
      type: Number,
      default: 0,
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
ReviewSchema.index({ professionalId: 1, createdAt: -1 });
ReviewSchema.index({ homeownerId: 1, createdAt: -1 });
ReviewSchema.index({ overallRating: -1 });
ReviewSchema.index({ projectId: 1 }, { unique: true });

export const Review: Model<IReview> = mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
