/**
 * Lead Creator Tool Service
 * Allows the AI assistant to create marketplace leads when users want to get professional quotes
 */

import { createLead } from '../lead.service';
import { logger } from '../../utils/logger';
import type { CreateLeadArgs } from '../ai/tools.registry';

/**
 * Create a marketplace lead from AI conversation
 * @param args Lead details extracted from conversation
 * @param userId The authenticated user's ID (required)
 * @returns Success message with lead ID
 */
export async function createLeadFromAI(
  args: CreateLeadArgs,
  userId: string
): Promise<string> {
  try {
    logger.info('AI creating lead from conversation', {
      userId,
      category: args.category,
      emirate: args.emirate,
    });

    // Create the lead using the existing lead service
    const lead = await createLead(userId, {
      title: args.title,
      description: args.description,
      category: args.category,
      location: {
        emirate: args.emirate,
      },
      budgetBracket: args.budgetBracket,
      urgency: args.urgency,
      timeline: args.timeline,
      attachments: [],
      preferences: {
        requiredVerification: 'any',
      },
    });

    logger.info('Lead created successfully by AI', {
      leadId: lead._id,
      userId,
      category: args.category,
    });

    // Return a user-friendly success message
    return `✅ **Lead Created Successfully!**

Your project "${args.title}" has been posted to the marketplace.

**Lead ID**: ${lead._id}
**Category**: ${args.category}
**Location**: ${args.emirate}
**Budget Range**: AED ${args.budgetBracket}
**Urgency**: ${args.urgency}

**What happens next:**
- Up to 5 verified professionals can claim your lead
- You'll receive detailed quotes with pricing and timelines
- Check your email and dashboard to view incoming quotes
- Compare quotes and hire the best professional for your project

You can view and manage your lead in your [dashboard](/dashboard).`;
  } catch (error: any) {
    logger.error('Failed to create lead from AI', {
      error: error.message,
      userId,
      args,
    });

    // Return user-friendly error message
    return `❌ I apologize, but I encountered an error while creating your lead: ${error.message}

Please try again or contact support if the issue persists.`;
  }
}
