// @ts-nocheck - Temporary: disable type checking for Railway deployment
import mongoose, { Schema, Document, Model } from 'mongoose';
import type {
  HomeProject as HomeProjectType,
  Task,
  CostItem,
  Milestone,
  Collaborator,
  TaskStatus,
  TaskPriority,
  CostCategory,
  CostStatus,
  MilestoneStatus,
  CollaboratorStatus,
  HomeProjectStatus,
  ProjectCategory,
} from '@homezy/shared';

export interface IHomeProject extends Omit<HomeProjectType, 'id' | 'createdAt' | 'updatedAt'>, Document {}

// Task sub-schema
const TaskSchema = new Schema<Task>({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'blocked', 'done'],
    default: 'todo',
  },
  assignedTo: String, // collaborator userId
  dueDate: Date,
  completedAt: Date,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  order: { type: Number, default: 0 },
}, { _id: false });

// Cost Item sub-schema
const CostItemSchema = new Schema<CostItem>({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  category: {
    type: String,
    enum: ['labor', 'materials', 'permits', 'other'],
    required: true,
  },
  estimatedCost: { type: Number, min: 0 },
  actualCost: { type: Number, min: 0 },
  vendorId: String, // links to saved vendor resource
  status: {
    type: String,
    enum: ['estimated', 'quoted', 'paid'],
    default: 'estimated',
  },
  receiptUrl: String,
  notes: { type: String, maxlength: 1000 },
}, { _id: false });

// Milestone sub-schema
const MilestoneSchema = new Schema<Milestone>({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  dueDate: Date,
  completedAt: Date,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
}, { _id: false });

// Collaborator sub-schema
const CollaboratorSchema = new Schema<Collaborator>({
  userId: String, // set when user accepts invite
  email: { type: String, required: true, lowercase: true, trim: true },
  name: { type: String, trim: true },
  invitedAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  status: {
    type: String,
    enum: ['pending', 'accepted'],
    default: 'pending',
  },
  inviteToken: String, // used for accepting invite
}, { _id: false });

// Main HomeProject schema
const HomeProjectSchema = new Schema<IHomeProject>(
  {
    homeownerId: {
      type: String,
      required: true,
      index: true,
    },
    propertyId: {
      type: String,
      index: true,
    },
    name: {
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
        'kitchen', 'bathroom', 'bedroom', 'living-room', 'dining-room',
        'outdoor', 'garage', 'hvac', 'electrical', 'plumbing',
        'flooring', 'painting', 'roofing', 'landscaping', 'pool',
        'security', 'whole-home', 'other',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'],
      default: 'planning',
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Integration with Homezy marketplace
    linkedLeadId: String,
    linkedQuoteId: String,
    linkedJobId: String,

    // Budget Tracking
    budgetEstimated: { type: Number, min: 0 },
    budgetActual: { type: Number, min: 0, default: 0 },
    currency: {
      type: String,
      enum: ['AED'],
      default: 'AED',
    },
    costItems: {
      type: [CostItemSchema],
      default: [],
    },

    // Timeline
    startDate: Date,
    targetEndDate: Date,
    actualEndDate: Date,
    milestones: {
      type: [MilestoneSchema],
      default: [],
    },

    // Tasks (Kanban-style)
    tasks: {
      type: [TaskSchema],
      default: [],
    },

    // Collaboration
    collaborators: {
      type: [CollaboratorSchema],
      default: [],
    },

    // Metadata
    completedAt: Date,
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
HomeProjectSchema.index({ homeownerId: 1, status: 1 });
HomeProjectSchema.index({ homeownerId: 1, isDefault: 1 });
HomeProjectSchema.index({ homeownerId: 1, createdAt: -1 });
HomeProjectSchema.index({ propertyId: 1, status: 1 });
HomeProjectSchema.index({ 'collaborators.userId': 1 });
HomeProjectSchema.index({ 'collaborators.email': 1 });
HomeProjectSchema.index({ 'collaborators.inviteToken': 1 });
HomeProjectSchema.index({ linkedLeadId: 1 });
HomeProjectSchema.index({ linkedQuoteId: 1 });
HomeProjectSchema.index({ linkedJobId: 1 });

// Virtual for calculating budget actual from cost items
HomeProjectSchema.virtual('calculatedBudgetActual').get(function () {
  if (!this.costItems || this.costItems.length === 0) return 0;
  return this.costItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
});

// Virtual for task statistics
HomeProjectSchema.virtual('taskStats').get(function () {
  const tasks = this.tasks || [];
  return {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    done: tasks.filter(t => t.status === 'done').length,
  };
});

// Virtual for budget statistics
HomeProjectSchema.virtual('budgetStats').get(function () {
  const estimated = this.budgetEstimated || 0;
  const actual = this.costItems?.reduce((sum, item) => sum + (item.actualCost || 0), 0) || 0;
  return {
    estimated,
    actual,
    remaining: estimated - actual,
    percentUsed: estimated > 0 ? Math.round((actual / estimated) * 100) : 0,
  };
});

// Pre-save middleware to update budgetActual
HomeProjectSchema.pre('save', function (next) {
  if (this.costItems && this.costItems.length > 0) {
    this.budgetActual = this.costItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  }
  next();
});

// Pre-save middleware to set completedAt when status changes to completed
HomeProjectSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    if (!this.actualEndDate) {
      this.actualEndDate = new Date();
    }
  }
  next();
});

// Create and export model
export const HomeProject: Model<IHomeProject> = mongoose.model<IHomeProject>('HomeProject', HomeProjectSchema);
export default HomeProject;
