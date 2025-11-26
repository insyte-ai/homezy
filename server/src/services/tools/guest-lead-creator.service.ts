/**
 * Guest Lead Creator Tool Service
 * Allows the AI assistant to create marketplace leads for guest (unauthenticated) users
 * Handles user creation + lead creation + magic link email
 */

import { createGuestLead } from '../guestLead.service';
import { logger } from '../../utils/logger';
import type { CreateGuestLeadArgs } from '../ai/tools.registry';

/**
 * Create a marketplace lead from AI conversation for guest users
 * @param args Lead details extracted from conversation including email
 * @returns Success message with lead details
 */
export async function createGuestLeadFromAI(args: CreateGuestLeadArgs): Promise<string> {
  try {
    logger.info('AI creating guest lead from conversation', {
      email: args.email,
      category: args.category,
      emirate: args.emirate,
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      return `❌ The email address "${args.email}" doesn't appear to be valid. Could you please provide a valid email address?`;
    }

    // Create the guest lead using the existing service
    const { lead, user, isNewUser } = await createGuestLead({
      email: args.email,
      firstName: args.firstName,
      phone: args.phone,
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

    logger.info('Guest lead created successfully by AI', {
      leadId: lead._id,
      userId: user._id,
      isNewUser,
      category: args.category,
    });

    // Return a user-friendly success message
    const accountMessage = isNewUser
      ? `I've also created an account for you with ${args.email}.`
      : `I found your existing account with ${args.email}.`;

    return `✅ **Lead Posted Successfully!**

Your project "${args.title}" is now live on the Homezy marketplace.

**Project Details:**
- **Category**: ${formatCategory(args.category)}
- **Location**: ${formatEmirate(args.emirate)}
- **Budget Range**: AED ${args.budgetBracket}
- **Urgency**: ${formatUrgency(args.urgency)}

**What happens next:**
1. ${accountMessage}
2. **Check your email** - I've sent you a magic link to access your account
3. Up to **5 verified professionals** can claim your lead
4. You'll receive detailed quotes with pricing and timelines
5. Compare quotes and choose the best professional for your project

**💡 Pro tip:** Professionals respond faster to leads with photos! You can add project photos after logging in.

Click the link in your email to manage your lead and view incoming quotes.`;
  } catch (error: any) {
    logger.error('Failed to create guest lead from AI', {
      error: error.message,
      args: { ...args, email: '***' }, // Don't log email
    });

    // Handle specific errors
    if (error.message?.includes('professional account')) {
      return `❌ This email is registered as a professional account on Homezy. Please use a different email address for posting leads, or sign in to your homeowner account if you have one.`;
    }

    // Return user-friendly error message
    return `❌ I apologize, but I encountered an error while creating your lead: ${error.message}

Please try again or contact support if the issue persists.`;
  }
}

/**
 * Format category for display
 */
function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    painting: 'Painting',
    carpentry: 'Carpentry',
    hvac: 'HVAC / Air Conditioning',
    flooring: 'Flooring',
    roofing: 'Roofing',
    landscaping: 'Landscaping',
    'home-cleaning': 'Home Cleaning',
    'pest-control': 'Pest Control',
    handyman: 'Handyman',
    'interior-design': 'Interior Design',
    tiling: 'Tiling',
    waterproofing: 'Waterproofing',
    masonry: 'Masonry',
    'glass-aluminum': 'Glass & Aluminum',
    renovation: 'Renovation',
  };
  return categoryMap[category] || category;
}

/**
 * Format emirate for display
 */
function formatEmirate(emirate: string): string {
  const emirateMap: Record<string, string> = {
    dubai: 'Dubai',
    'abu-dhabi': 'Abu Dhabi',
    sharjah: 'Sharjah',
    ajman: 'Ajman',
    rak: 'Ras Al Khaimah',
    fujairah: 'Fujairah',
    uaq: 'Umm Al Quwain',
  };
  return emirateMap[emirate] || emirate;
}

/**
 * Format urgency for display
 */
function formatUrgency(urgency: string): string {
  const urgencyMap: Record<string, string> = {
    emergency: '🚨 Emergency (24-48 hours)',
    urgent: '⚡ Urgent (This week)',
    flexible: '📅 Flexible (Within a month)',
    planning: '🗓️ Planning (Future project)',
  };
  return urgencyMap[urgency] || urgency;
}
