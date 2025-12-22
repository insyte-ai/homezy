import mongoose, { Schema, Document } from 'mongoose';

// Notification types for different events
export enum NotificationType {
  // Admin notifications
  VERIFICATION_DOC_UPLOADED = 'verification_doc_uploaded',
  NEW_PRO_REGISTRATION = 'new_pro_registration',
  NEW_LEAD_SUBMITTED = 'new_lead_submitted',

  // Pro notifications
  LEAD_ASSIGNED = 'lead_assigned',
  LEAD_CLAIMED = 'lead_claimed',
  QUOTE_ACCEPTED = 'quote_accepted',
  QUOTE_REJECTED = 'quote_rejected',
  VERIFICATION_APPROVED = 'verification_approved',
  VERIFICATION_REJECTED = 'verification_rejected',
  TRADE_LICENSE_EXPIRING = 'trade_license_expiring',
  TRADE_LICENSE_EXPIRED = 'trade_license_expired',

  // Homeowner notifications
  QUOTE_RECEIVED = 'quote_received',
  PRO_MESSAGED = 'pro_messaged',
  LEAD_MATCHED = 'lead_matched',

  // System notifications
  SYSTEM_ALERT = 'system_alert',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum NotificationCategory {
  VERIFICATION = 'verification',
  LEAD = 'lead',
  QUOTE = 'quote',
  MESSAGE = 'message',
  SYSTEM = 'system',
}

export type RecipientRole = 'admin' | 'pro' | 'homeowner';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  recipientRole: RecipientRole;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  actionUrl?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  markAsRead(): Promise<INotification>;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'pro', 'homeowner'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(NotificationCategory),
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.MEDIUM,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    actionUrl: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, category: 1, createdAt: -1 });

// TTL index for automatic deletion after expiry
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method to mark notification as read
NotificationSchema.methods.markAsRead = async function (): Promise<INotification> {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

export default mongoose.model<INotification>('Notification', NotificationSchema);
