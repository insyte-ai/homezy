import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IConversation extends Document {
  conversationId: string;
  userId?: mongoose.Types.ObjectId;
  guestId?: string;
  title: string;
  messageCount: number;
  status: 'active' | 'archived' | 'guest_limited';
  context: {
    emirate?: string;
    projectTypes?: string[];
    userProfile?: {
      name?: string;
      role: 'homeowner' | 'professional';
    };
  };
  metadata: {
    firstMessageAt: Date;
    lastMessageAt: Date;
    totalTokens: number;
    functionCallsCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
  // Methods
  incrementMessageCount(): Promise<void>;
  updateContext(updates: Partial<IConversation['context']>): Promise<void>;
}

export interface IConversationModel extends Model<IConversation> {
  findOrCreate(userId?: string, guestId?: string): Promise<IConversation>;
}

const ConversationSchema = new Schema<IConversation>(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    guestId: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'New Conversation',
      maxlength: 200,
    },
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'guest_limited'],
      default: 'active',
      index: true,
    },
    context: {
      emirate: {
        type: String,
        enum: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ'],
      },
      projectTypes: [{ type: String }],
      userProfile: {
        name: String,
        role: {
          type: String,
          enum: ['homeowner', 'professional'],
        },
      },
    },
    metadata: {
      firstMessageAt: {
        type: Date,
        default: Date.now,
      },
      lastMessageAt: {
        type: Date,
        default: Date.now,
      },
      totalTokens: {
        type: Number,
        default: 0,
      },
      functionCallsCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ConversationSchema.index({ userId: 1, status: 1, 'metadata.lastMessageAt': -1 });
ConversationSchema.index({ guestId: 1, status: 1, 'metadata.lastMessageAt': -1 });
ConversationSchema.index({ createdAt: -1 });

// Virtual for checking if guest limit reached
ConversationSchema.virtual('isGuestLimitReached').get(function () {
  return !this.userId && this.messageCount >= 5;
});

// Method to increment message count
ConversationSchema.methods.incrementMessageCount = async function () {
  this.messageCount += 1;
  this.metadata.lastMessageAt = new Date();
  await this.save();
};

// Method to update context
ConversationSchema.methods.updateContext = async function (updates: Partial<IConversation['context']>) {
  this.context = { ...this.context, ...updates };
  await this.save();
};

// Static method to find or create conversation
ConversationSchema.statics.findOrCreate = async function (
  userId?: string,
  guestId?: string
): Promise<IConversation> {
  let conversation: IConversation | null = null;

  if (userId) {
    conversation = await this.findOne({ userId, status: 'active' })
      .sort({ 'metadata.lastMessageAt': -1 })
      .limit(1);
  } else if (guestId) {
    conversation = await this.findOne({ guestId, status: 'active' })
      .sort({ 'metadata.lastMessageAt': -1 })
      .limit(1);
  }

  if (!conversation) {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    conversation = await this.create({
      conversationId,
      userId,
      guestId,
      title: 'New Conversation',
    });
  }

  return conversation;
};

export const Conversation = mongoose.model<IConversation, IConversationModel>('Conversation', ConversationSchema);
