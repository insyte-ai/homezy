import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  senderId: string;
  recipientId: string;
  conversationId: string;
  content: string;
  type: 'text' | 'file' | 'system';
  attachments?: IMessageAttachment[];
  isRead: boolean;
  readAt?: Date;
}

export interface IMessageAttachment {
  id: string;
  type: 'image' | 'document';
  url: string;
  filename: string;
  size: number;
}

const MessageAttachmentSchema = new Schema<IMessageAttachment>({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['image', 'document'],
    required: true,
  },
  url: { type: String, required: true },
  filename: { type: String, required: true },
  size: { type: Number, required: true },
});

const MessageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: String,
      required: true,
      index: true,
    },
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'file', 'system'],
      default: 'text',
    },
    attachments: [MessageAttachmentSchema],
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: Date,
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
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ recipientId: 1, isRead: 1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });

export const Message: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
