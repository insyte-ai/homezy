import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * UserMessage Model
 * For messages between homeowners and professionals
 */

export interface IUserMessageAttachment {
  type: 'image' | 'document' | 'pdf';
  url: string;
  filename: string;
  size: number; // in bytes
  publicId?: string; // Cloudinary public ID
}

export interface IUserMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  content: string;
  attachments?: IUserMessageAttachment[];
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  deletedFor?: string[]; // User IDs who deleted this message
  createdAt: Date;
  updatedAt: Date;

  // Methods
  markAsRead(): Promise<void>;
  editContent(newContent: string): Promise<void>;
  deleteForUser(userId: string): Promise<void>;
}

const UserMessageAttachmentSchema = new Schema<IUserMessageAttachment>({
  type: {
    type: String,
    enum: ['image', 'document', 'pdf'],
    required: true,
  },
  url: { type: String, required: true },
  filename: { type: String, required: true },
  size: { type: Number, required: true },
  publicId: { type: String }, // For Cloudinary deletion
});

const UserMessageSchema = new Schema<IUserMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'UserConversation',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    attachments: [UserMessageAttachmentSchema],
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    deletedFor: {
      type: [String],
      default: [],
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
UserMessageSchema.index({ conversationId: 1, createdAt: -1 });
UserMessageSchema.index({ recipientId: 1, isRead: 1 });
UserMessageSchema.index({ senderId: 1, createdAt: -1 });

// Method to mark as read
UserMessageSchema.methods.markAsRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  await this.save();
};

// Method to edit message
UserMessageSchema.methods.editContent = async function (newContent: string) {
  this.content = newContent;
  this.isEdited = true;
  this.editedAt = new Date();
  await this.save();
};

// Method to soft delete for a user
UserMessageSchema.methods.deleteForUser = async function (userId: string) {
  if (!this.deletedFor.includes(userId)) {
    this.deletedFor.push(userId);
    await this.save();
  }
};

export const UserMessage: Model<IUserMessage> = mongoose.model<IUserMessage>(
  'UserMessage',
  UserMessageSchema
);
export default UserMessage;
