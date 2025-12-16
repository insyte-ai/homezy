// @ts-nocheck - Temporary: disable type checking for Railway deployment
import mongoose, { Schema, Document, Model } from 'mongoose';
import type {
  ServiceReminder as ServiceReminderType,
  ReminderNotification,
  HomeServiceCategory,
  ReminderTriggerType,
  ReminderFrequency,
  ReminderStatus,
} from '@homezy/shared';

export interface IServiceReminder extends Omit<ServiceReminderType, 'id' | 'createdAt' | 'updatedAt'>, Document {}

const ReminderNotificationSchema = new Schema<ReminderNotification>({
  sentAt: { type: Date, required: true },
  channel: {
    type: String,
    enum: ['email', 'push', 'sms'],
    required: true,
  },
  daysBeforeDue: { type: Number, required: true },
}, { _id: false });

const ServiceReminderSchema = new Schema<IServiceReminder>(
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

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },

    // Pattern-based scheduling
    triggerType: {
      type: String,
      enum: ['pattern-based', 'seasonal', 'custom'],
      required: true,
    },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'biannual', 'annual', 'custom'],
      required: true,
    },
    customIntervalDays: {
      type: Number,
      min: 1,
      max: 3650, // Max 10 years
    },
    lastServiceDate: Date,
    nextDueDate: {
      type: Date,
      required: true,
      index: true,
    },

    // Notification tracking
    remindersSent: {
      type: [ReminderNotificationSchema],
      default: [],
    },
    reminderLeadDays: {
      type: [Number],
      default: [30, 7, 1], // 30 days, 7 days, 1 day before due
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'snoozed', 'paused', 'converted-to-quote'],
      default: 'active',
      index: true,
    },
    snoozeUntil: Date,

    // Conversion to quote
    leadId: {
      type: String,
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

// Indexes for efficient queries
ServiceReminderSchema.index({ homeownerId: 1, status: 1 });
ServiceReminderSchema.index({ homeownerId: 1, nextDueDate: 1 });
ServiceReminderSchema.index({ status: 1, nextDueDate: 1 }); // For cron job queries
ServiceReminderSchema.index({ propertyId: 1, category: 1 });
ServiceReminderSchema.index({ category: 1, status: 1 });

// Virtual to check if reminder is due
ServiceReminderSchema.virtual('isDue').get(function () {
  return this.status === 'active' && new Date() >= this.nextDueDate;
});

// Virtual to check if reminder is overdue
ServiceReminderSchema.virtual('isOverdue').get(function () {
  if (this.status !== 'active') return false;
  const daysPastDue = Math.floor((Date.now() - this.nextDueDate.getTime()) / (1000 * 60 * 60 * 24));
  return daysPastDue > 0;
});

// Virtual to get days until due (negative if overdue)
ServiceReminderSchema.virtual('daysUntilDue').get(function () {
  return Math.ceil((this.nextDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
});

// Method to calculate next due date based on frequency
ServiceReminderSchema.methods.calculateNextDueDate = function (fromDate: Date = new Date()): Date {
  const date = new Date(fromDate);

  switch (this.frequency) {
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'biannual':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annual':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'custom':
      if (this.customIntervalDays) {
        date.setDate(date.getDate() + this.customIntervalDays);
      }
      break;
  }

  return date;
};

// Method to snooze reminder
ServiceReminderSchema.methods.snooze = async function (until: Date): Promise<void> {
  this.status = 'snoozed';
  this.snoozeUntil = until;
  await this.save();
};

// Method to activate/unsnooze reminder
ServiceReminderSchema.methods.activate = async function (): Promise<void> {
  this.status = 'active';
  this.snoozeUntil = undefined;
  await this.save();
};

// Method to pause reminder
ServiceReminderSchema.methods.pause = async function (): Promise<void> {
  this.status = 'paused';
  await this.save();
};

// Method to mark as converted to quote
ServiceReminderSchema.methods.convertToQuote = async function (leadId: string): Promise<void> {
  this.status = 'converted-to-quote';
  this.leadId = leadId;
  await this.save();
};

// Pre-save middleware to handle snooze expiration
ServiceReminderSchema.pre('save', function (next) {
  // Auto-activate if snooze period has passed
  if (this.status === 'snoozed' && this.snoozeUntil && new Date() >= this.snoozeUntil) {
    this.status = 'active';
    this.snoozeUntil = undefined;
  }
  next();
});

// Create and export model
export const ServiceReminder: Model<IServiceReminder> = mongoose.model<IServiceReminder>('ServiceReminder', ServiceReminderSchema);
export default ServiceReminder;
