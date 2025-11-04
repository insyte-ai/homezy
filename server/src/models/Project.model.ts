import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  homeownerId: string;
  professionalId: string;
  leadId: string;
  quoteId: string;
  title: string;
  description: string;
  category: string;
  status: 'planning' | 'in-progress' | 'completed' | 'cancelled';
  budgetEstimated: number;
  budgetActual: number;
  startDate?: Date;
  endDate?: Date;
  completedAt?: Date;
  milestones: IMilestone[];
  documents: IDocument[];
  photos: IPhoto[];
}

export interface IMilestone {
  id: string;
  name: string;
  description?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  targetDate?: Date;
  completedDate?: Date;
  order: number;
}

export interface IDocument {
  id: string;
  name: string;
  url: string;
  category: 'contract' | 'invoice' | 'permit' | 'receipt' | 'other';
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
}

export interface IPhoto {
  id: string;
  url: string;
  thumbnail?: string;
  caption?: string;
  category: 'before' | 'progress' | 'after';
  uploadedBy: string;
  uploadedAt: Date;
  milestoneId?: string;
}

const MilestoneSchema = new Schema<IMilestone>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'delayed'],
    default: 'not-started',
  },
  targetDate: Date,
  completedDate: Date,
  order: { type: Number, required: true },
});

const DocumentSchema = new Schema<IDocument>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  category: {
    type: String,
    enum: ['contract', 'invoice', 'permit', 'receipt', 'other'],
    required: true,
  },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  size: { type: Number, required: true },
});

const PhotoSchema = new Schema<IPhoto>({
  id: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: String,
  caption: String,
  category: {
    type: String,
    enum: ['before', 'progress', 'after'],
    required: true,
  },
  uploadedBy: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  milestoneId: String,
});

const ProjectSchema = new Schema<IProject>(
  {
    homeownerId: {
      type: String,
      required: true,
      index: true,
    },
    professionalId: {
      type: String,
      required: true,
      index: true,
    },
    leadId: {
      type: String,
      required: true,
    },
    quoteId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'completed', 'cancelled'],
      default: 'planning',
      index: true,
    },
    budgetEstimated: {
      type: Number,
      required: true,
      min: 0,
    },
    budgetActual: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: Date,
    endDate: Date,
    completedAt: Date,
    milestones: [MilestoneSchema],
    documents: [DocumentSchema],
    photos: [PhotoSchema],
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
ProjectSchema.index({ homeownerId: 1, status: 1, createdAt: -1 });
ProjectSchema.index({ professionalId: 1, status: 1, createdAt: -1 });
ProjectSchema.index({ status: 1 });

export const Project: Model<IProject> = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
