import Anthropic from '@anthropic-ai/sdk';
import { Socket } from 'socket.io';
import { env } from '../../config/env';
import { Conversation, IConversation } from '../../models/Conversation.model';
import { ChatMessage, IChatMessage, IToolCall } from '../../models/ChatMessage.model';
import { TOOLS } from './tools.registry';
import { buildSystemPrompt } from './system-prompts';
import { BudgetEstimatorService } from '../tools/budget-estimator.service';
import { TimelineEstimatorService } from '../tools/timeline-estimator.service';
import { KnowledgeBaseService } from '../tools/knowledge-base.service';
import { createLeadFromAI } from '../tools/lead-creator.service';
import { logger } from '../../utils/logger';

/**
 * AI Service - Agent Orchestrator for Home GPT
 *
 * This service manages the complete agentic AI loop:
 * 1. Receives user message
 * 2. Builds conversation context
 * 3. Calls Claude with streaming + function calling
 * 4. Executes tools when Claude requests them
 * 5. Continues conversation with tool results
 * 6. Streams final response back to user via Socket.io
 */
export class AIService {
  private anthropic: Anthropic;
  private budgetEstimator: BudgetEstimatorService;
  private timelineEstimator: TimelineEstimatorService;
  private knowledgeBase: KnowledgeBaseService;

  constructor() {
    // Initialize Anthropic client
    this.anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });

    // Initialize tool services
    this.budgetEstimator = new BudgetEstimatorService();
    this.timelineEstimator = new TimelineEstimatorService();
    this.knowledgeBase = new KnowledgeBaseService();

    logger.info('AIService initialized with Claude Sonnet 4.5');
  }

  /**
   * Main streaming chat method with Socket.io
   * This orchestrates the entire agent loop with function calling
   */
  async streamChatWithSocket(
    conversationId: string,
    userMessage: string,
    userId: string | undefined,
    socket: Socket
  ): Promise<void> {
    try {
      // Get conversation
      const conversation = await Conversation.findOne({ conversationId });
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Save user message first
      const userMessageId = await this.saveMessage(
        conversationId,
        'user',
        userMessage,
        undefined,
        0,
        0
      );

      logger.info(`Processing message for conversation ${conversationId}`, {
        userId,
        messageLength: userMessage.length,
      });

      // Get conversation history
      const history = await this.getConversationHistory(conversationId);

      // Build system prompt
      const systemPrompt = await this.buildSystemPromptForUser(userId);

      // Add user message to history
      const messages = [...history, { role: 'user', content: userMessage }];

      // Call Claude with streaming and function calling
      const stream = await (this.anthropic.messages as any).stream({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages,
        tools: TOOLS,
      });

      let fullResponse = '';
      let toolCalls: IToolCall[] = [];
      let currentToolCall: any = null;
      let inputTokens = 0;
      let outputTokens = 0;

      // Process streaming events
      for await (const event of stream) {
        // Capture token usage
        if (event.type === 'message_start') {
          inputTokens = event.message.usage.input_tokens;
        }

        if (event.type === 'message_delta') {
          outputTokens = event.usage.output_tokens;
        }

        // Handle content blocks
        if (event.type === 'content_block_start') {
          const block = event.content_block as any;

          if (block.type === 'tool_use') {
            // Claude decided to call a function!
            currentToolCall = {
              id: block.id,
              name: block.name,
              input: {},
              status: 'pending' as const,
            };

            logger.info(`Function call started: ${block.name}`, { toolId: block.id });

            // Notify frontend that function is being called
            socket.emit('chat:function_call_start', {
              toolName: block.name,
              toolId: block.id,
            });
          }
        }

        if (event.type === 'content_block_delta') {
          const delta = event.delta as any;

          if (delta.type === 'text_delta') {
            // Stream text tokens to frontend
            fullResponse += delta.text;
            socket.emit('chat:token', { token: delta.text });
          }

          if (delta.type === 'input_json_delta') {
            // Accumulate function call arguments
            if (currentToolCall) {
              currentToolCall.inputJson = (currentToolCall.inputJson || '') + delta.partial_json;
            }
          }
        }

        if (event.type === 'content_block_stop') {
          if (currentToolCall) {
            // Function call complete - execute it!
            try {
              // Parse accumulated JSON
              currentToolCall.input = JSON.parse(currentToolCall.inputJson);

              logger.info(`Executing function: ${currentToolCall.name}`, {
                input: currentToolCall.input,
              });

              const startTime = Date.now();

              // Execute the tool
              const result = await this.executeToolCall(currentToolCall.name, currentToolCall.input, userId);

              const executionTime = Date.now() - startTime;

              currentToolCall.output = result;
              currentToolCall.status = 'success';
              currentToolCall.executionTimeMs = executionTime;

              logger.info(`Function executed successfully: ${currentToolCall.name}`, {
                executionTimeMs: executionTime,
              });

              // Notify frontend
              socket.emit('chat:function_call_complete', {
                toolName: currentToolCall.name,
                result: result,
              });

              toolCalls.push(currentToolCall);

              // Continue conversation with tool result
              // Claude needs to see the tool result to generate a natural language response
              const toolResultMessage = {
                role: 'user' as const,
                content: [
                  {
                    type: 'tool_result' as const,
                    tool_use_id: currentToolCall.id,
                    content: JSON.stringify(result),
                  },
                ],
              };

              // Continue the conversation with tool result
              await this.continueStreamingWithToolResult(
                [...messages, toolResultMessage],
                systemPrompt,
                socket,
                (text) => {
                  fullResponse += text;
                }
              );
            } catch (error: any) {
              logger.error(`Function execution failed: ${currentToolCall.name}`, {
                error: error.message,
              });

              currentToolCall.status = 'error';
              currentToolCall.error = error.message;

              // Notify frontend of error
              socket.emit('chat:function_call_error', {
                toolName: currentToolCall.name,
                error: error.message,
              });

              toolCalls.push(currentToolCall);
            }

            currentToolCall = null;
          }
        }
      }

      // Save assistant message
      await this.saveMessage(
        conversationId,
        'assistant',
        fullResponse,
        toolCalls.length > 0 ? toolCalls : undefined,
        inputTokens,
        outputTokens
      );

      // Update conversation metadata
      await this.updateConversationMetadata(conversation, toolCalls.length, inputTokens + outputTokens);

      // Notify frontend that streaming is complete
      socket.emit('chat:complete', { conversationId });

      logger.info(`Chat completed for conversation ${conversationId}`, {
        responseLength: fullResponse.length,
        toolCallsCount: toolCalls.length,
        totalTokens: inputTokens + outputTokens,
      });
    } catch (error: any) {
      logger.error('Chat streaming error', { error: error.message, stack: error.stack });

      // Notify frontend of error
      socket.emit('chat:error', {
        error: error.message || 'An error occurred while processing your message',
      });

      throw error;
    }
  }

  /**
   * Continue streaming after tool result
   * Claude generates natural language response using the tool result
   */
  private async continueStreamingWithToolResult(
    messages: any[],
    systemPrompt: string,
    socket: Socket,
    onToken: (text: string) => void
  ): Promise<void> {
    const stream = await (this.anthropic.messages as any).stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages,
      tools: TOOLS,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta as any;

        if (delta.type === 'text_delta') {
          onToken(delta.text);
          socket.emit('chat:token', { token: delta.text });
        }
      }
    }
  }

  /**
   * Execute tool based on name - router to specific tool services
   */
  private async executeToolCall(toolName: string, args: any, userId?: string): Promise<any> {
    switch (toolName) {
      case 'estimate_budget':
        return await this.budgetEstimator.calculateBudget(args);

      case 'estimate_timeline':
        return await this.timelineEstimator.estimateTimeline(args);

      case 'search_knowledge_base':
        return await this.knowledgeBase.searchKnowledge(args.query, args.category);

      case 'create_lead':
        if (!userId) {
          return 'I apologize, but you need to be signed in to create a lead. Please [sign in](/auth/login) or [create an account](/auth/register) to post your project and get quotes from professionals.';
        }
        return await createLeadFromAI(args, userId);

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Get conversation history for context (last 10 messages)
   */
  private async getConversationHistory(
    conversationId: string
  ): Promise<Array<{ role: string; content: string }>> {
    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('role content')
      .lean();

    // Reverse to get chronological order
    return messages.reverse().map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Build system prompt with user context
   */
  private async buildSystemPromptForUser(userId?: string): Promise<string> {
    if (!userId) {
      return buildSystemPrompt(null); // Guest user
    }

    // Get user profile from database (future enhancement)
    // For now, just return base prompt for authenticated users
    const userProfile = {
      name: undefined,
      role: 'homeowner',
      emirate: undefined,
    };

    return buildSystemPrompt(userProfile);
  }

  /**
   * Save message to database
   */
  private async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    toolCalls?: IToolCall[],
    inputTokens: number = 0,
    outputTokens: number = 0
  ): Promise<string> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await ChatMessage.create({
      messageId,
      conversationId,
      role,
      content,
      toolCalls,
      tokens: {
        input: inputTokens,
        output: outputTokens,
      },
      status: 'sent',
    });

    return messageId;
  }

  /**
   * Update conversation metadata after message
   */
  private async updateConversationMetadata(
    conversation: IConversation,
    functionCallsCount: number,
    tokens: number
  ): Promise<void> {
    conversation.metadata.lastMessageAt = new Date();
    conversation.metadata.functionCallsCount += functionCallsCount;
    conversation.metadata.totalTokens += tokens;

    await conversation.save();
  }
}
