/**
 * Shared chat types for frontend and backend
 */

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: IToolCall[];
  tokens?: {
    input: number;
    output: number;
  };
  status?: 'sending' | 'sent' | 'error';
  error?: string;
  createdAt: Date;
}

export interface IToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  status: 'pending' | 'success' | 'error';
  executionTimeMs?: number;
  error?: string;
}

export interface Conversation {
  conversationId: string;
  userId?: string;
  guestId?: string;
  title: string;
  messageCount: number;
  status: 'active' | 'archived' | 'guest_limited';
  context?: {
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
}

export interface BudgetEstimate {
  total: number;
  breakdown: {
    labor: number;
    materials: number;
    permits: number;
    contingency: number;
    vat: number;
  };
  currency: 'AED';
  confidence: 'low' | 'medium' | 'high';
  notes: string[];
  projectSize: string;
  estimatedDuration: string;
}

export interface TimelineEstimate {
  estimatedDays: number;
  startDateRecommendation: string;
  phases: {
    name: string;
    duration: number;
    startOffset: number;
    description: string;
  }[];
  considerations: string[];
  criticalPath: string[];
}

export interface KnowledgeArticle {
  id: string;
  category: 'regulations' | 'best_practices' | 'materials' | 'maintenance' | 'general';
  topic: string;
  content: string;
  tags: string[];
  relevance?: number;
}

export interface KnowledgeSearchResult {
  articles: KnowledgeArticle[];
  totalFound: number;
}

// Socket.io event types
export interface ChatTokenEvent {
  token: string;
}

export interface ChatFunctionCallStartEvent {
  toolName: string;
  toolId: string;
}

export interface ChatFunctionCallCompleteEvent {
  toolName: string;
  result: any;
}

export interface ChatCompleteEvent {
  conversationId: string;
}

export interface ChatErrorEvent {
  error: string;
  code?: string;
}

// API Request/Response types
export interface CreateConversationResponse {
  success: boolean;
  data: Conversation;
}

export interface GetConversationResponse {
  success: boolean;
  data: {
    conversation: Conversation;
    messages: ChatMessage[];
  };
}

export interface GetConversationsResponse {
  success: boolean;
  data: Conversation[];
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  conversationId: string;
}
