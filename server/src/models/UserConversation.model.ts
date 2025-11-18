import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * UserConversation Model
 * For direct messaging between homeowners and professionals
 * (Different from AI Chat Conversation)
 */

export interface IUserConversation extends Document {
  participants: {
    homeownerId: mongoose.Types.ObjectId;
    professionalId: mongoose.Types.ObjectId;
  };
  relatedLead?: mongoose.Types.ObjectId;
  relatedProject?: mongoose.Types.ObjectId;
  lastMessage?: {
    content: string;
    senderId: string;
    sentAt: Date;
  };
  unreadCount: {
    homeowner: number;
    professional: number;
  };
  status: 'active' | 'archived' | 'blocked';
  createdAt: Date;
  updatedAt: Date;

  // Methods
  updateLastMessage(content: string, senderId: string): Promise<void>;
  incrementUnread(role: 'homeowner' | 'professional'): Promise<void>;
  markAsRead(role: 'homeowner' | 'professional'): Promise<void>;
}

const UserConversationSchema = new Schema<IUserConversation>(
  {
    participants: {
      homeownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      professionalId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
    },
    relatedLead: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      index: true,
    },
    relatedProject: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    lastMessage: {
      content: { type: String },
      senderId: { type: String },
      sentAt: { type: Date },
    },
    unreadCount: {
      homeowner: {
        type: Number,
        default: 0,
        min: 0,
      },
      professional: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'blocked'],
      default: 'active',
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

// Compound indexes for efficient queries
UserConversationSchema.index({ 'participants.homeownerId': 1, status: 1, updatedAt: -1 });
UserConversationSchema.index({ 'participants.professionalId': 1, status: 1, updatedAt: -1 });
UserConversationSchema.index(
  { 'participants.homeownerId': 1, 'participants.professionalId': 1 },
  { unique: true }
);

// Method to update last message
UserConversationSchema.methods.updateLastMessage = async function (
  content: string,
  senderId: string
) {
  this.lastMessage = {
    content: content.substring(0, 100), // Store preview
    senderId,
    sentAt: new Date(),
  };
  await this.save();
};

// Method to increment unread count
UserConversationSchema.methods.incrementUnread = async function (recipientRole: 'homeowner' | 'professional') {
  this.unreadCount[recipientRole] += 1;
  await this.save();
};

// Method to mark as read
UserConversationSchema.methods.markAsRead = async function (userRole: 'homeowner' | 'professional') {
  this.unreadCount[userRole] = 0;
  await this.save();
};

export const UserConversation: Model<IUserConversation> = mongoose.model<IUserConversation>(
  'UserConversation',
  UserConversationSchema
);
export default UserConversation;
