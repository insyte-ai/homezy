/**
 * AI-Powered Lead Content Generator
 * Generates professional titles and descriptions based on questionnaire answers
 */

import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface QuestionAnswer {
  questionId: string;
  question: string;
  answer: string | string[];
  type: 'single-choice' | 'multiple-choice' | 'text' | 'number';
}

interface GenerateContentRequest {
  serviceId: string;
  serviceName: string;
  answers: QuestionAnswer[];
  emirate?: string;
}

interface GeneratedContent {
  title: string;
  description: string;
}

export class LeadContentGeneratorService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate professional title and description from questionnaire answers
   */
  async generateContent(request: GenerateContentRequest): Promise<GeneratedContent> {
    try {
      logger.info('Generating lead content with AI', {
        serviceId: request.serviceId,
        answerCount: request.answers.length,
      });

      const prompt = this.buildPrompt(request);

      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text response
      const responseText = message.content
        .filter((block) => block.type === 'text')
        .map((block: any) => block.text)
        .join('');

      // Parse JSON response
      const generated = JSON.parse(responseText);

      logger.info('Lead content generated successfully', {
        titleLength: generated.title.length,
        descriptionLength: generated.description.length,
      });

      return {
        title: generated.title,
        description: generated.description,
      };
    } catch (error: any) {
      logger.error('Failed to generate lead content', {
        error: error.message,
        serviceId: request.serviceId,
      });

      // Fallback to basic generation
      return this.generateFallbackContent(request);
    }
  }

  /**
   * Build the AI prompt from questionnaire answers
   */
  private buildPrompt(request: GenerateContentRequest): string {
    const { serviceId, serviceName, answers, emirate } = request;

    // Format answers for the prompt
    const formattedAnswers = answers
      .map((qa) => {
        const answerText = Array.isArray(qa.answer) ? qa.answer.join(', ') : qa.answer;
        return `Q: ${qa.question}\nA: ${answerText}`;
      })
      .join('\n\n');

    const locationContext = emirate ? `\nLocation: ${emirate}` : '';

    return `You are an expert at writing clear, professional service request titles and descriptions for homeowners in the UAE.

Based on the following questionnaire answers for a ${serviceName} service request, generate:
1. A concise, descriptive title (40-80 characters)
2. A detailed description (100-300 characters) that professionals can use to provide accurate quotes

**Questionnaire Answers:**
${formattedAnswers}${locationContext}

**Guidelines:**
- Title: Be specific about what's needed (e.g., "Fix Leaking Kitchen Sink in Dubai Marina")
- Title: Include the most important detail from the answers
- Title: Keep it under 80 characters
- Description: Expand on all relevant details from the questionnaire
- Description: Be specific about the scope of work
- Description: Include urgency or special requirements if mentioned
- Description: Write in a professional, clear tone
- Description: Keep it between 100-300 characters
- Use natural language, not bullet points
- Don't include pricing or budget information

**Output Format:**
Return ONLY a JSON object with this exact structure:
{
  "title": "The generated title here",
  "description": "The generated description here"
}`;
  }

  /**
   * Fallback content generation if AI fails
   */
  private generateFallbackContent(request: GenerateContentRequest): GeneratedContent {
    const { serviceName, answers, emirate } = request;

    // Extract key information from first answer
    const firstAnswer = answers[0];
    let titleDetail = '';

    if (firstAnswer && firstAnswer.answer) {
      if (Array.isArray(firstAnswer.answer)) {
        titleDetail = firstAnswer.answer[0] || '';
      } else {
        titleDetail = firstAnswer.answer;
      }
      // Clean up and capitalize
      titleDetail = titleDetail.replace(/_/g, ' ');
      titleDetail = titleDetail.charAt(0).toUpperCase() + titleDetail.slice(1);
    }

    const location = emirate ? ` in ${emirate}` : '';
    const title = `${serviceName} Service Request${titleDetail ? `: ${titleDetail}` : ''}${location}`;

    // Build description from all answers
    const descriptionParts = answers
      .slice(0, 3) // First 3 answers
      .map((qa) => {
        const answerText = Array.isArray(qa.answer)
          ? qa.answer.join(', ').replace(/_/g, ' ')
          : String(qa.answer).replace(/_/g, ' ');
        return answerText;
      })
      .filter((text) => text && text !== 'not_sure' && text !== 'unknown');

    const description = descriptionParts.length > 0
      ? `I need ${serviceName.toLowerCase()} services for: ${descriptionParts.join('. ')}. Please provide a detailed quote.`
      : `I need professional ${serviceName.toLowerCase()} services. Please provide a detailed quote based on the project details.`;

    return { title, description };
  }
}

// Export singleton instance
export const leadContentGenerator = new LeadContentGeneratorService();
