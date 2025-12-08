import mongoose, { Document, Schema } from 'mongoose';

export interface IToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: 'pending' | 'success' | 'error';
  executionTimeMs?: number;
  error?: string;
}

export interface IChatMessage extends Document {
  messageId: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: IToolCall[];
  tokens: {
    input: number;
    output: number;
  };
  status: 'sending' | 'sent' | 'error';
  error?: string;
  attachments?: {
    type: 'image' | 'document';
    url: string;
    filename: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ToolCallSchema = new Schema<IToolCall>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    input: {
      type: Schema.Types.Mixed,
      required: true,
    },
    output: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'error'],
      default: 'pending',
    },
    executionTimeMs: {
      type: Number,
    },
    error: {
      type: String,
    },
  },
  { _id: false }
);

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    toolCalls: [ToolCallSchema],
    tokens: {
      input: {
        type: Number,
        default: 0,
      },
      output: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ['sending', 'sent', 'error'],
      default: 'sent',
    },
    error: {
      type: String,
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ['image', 'document'],
        },
        url: String,
        filename: String,
      },
    ],
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
ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });
ChatMessageSchema.index({ createdAt: -1 });
ChatMessageSchema.index({ 'toolCalls.name': 1 });

// Virtual for total tokens
ChatMessageSchema.virtual('totalTokens').get(function () {
  return this.tokens.input + this.tokens.output;
});

// Static method to get conversation history for AI context
ChatMessageSchema.statics.getConversationHistory = async function (
  conversationId: string,
  limit: number = 10
): Promise<Array<{ role: string; content: string }>> {
  const messages = await this.find({ conversationId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('role content')
    .lean();

  // Reverse to get chronological order
  return messages.reverse().map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
};

// Static method to calculate token usage for conversation
ChatMessageSchema.statics.getTokenUsage = async function (conversationId: string) {
  const result = await this.aggregate([
    { $match: { conversationId } },
    {
      $group: {
        _id: null,
        totalInputTokens: { $sum: '$tokens.input' },
        totalOutputTokens: { $sum: '$tokens.output' },
        totalMessages: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalInputTokens: 0, totalOutputTokens: 0, totalMessages: 0 };
};

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
