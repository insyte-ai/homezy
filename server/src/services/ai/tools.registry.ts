/**
 * Tool Registry for Claude Sonnet 4.5 Function Calling
 *
 * This file defines all tools/functions that the AI agent can use.
 * To add a new tool:
 * 1. Add tool definition to TOOLS array
 * 2. Implement the tool service in services/tools/
 * 3. Add case in ai.service.ts executeToolCall()
 *
 * Claude learns to use tools automatically based on their descriptions!
 */

// Tool definition type for Claude Sonnet 4.5 function calling
export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const TOOLS: Tool[] = [
  {
    name: 'estimate_budget',
    description: `Calculate accurate budget estimates for home improvement projects in UAE with detailed AED breakdown.
    Use this when the user asks about costs, pricing, or budget for their project.
    Provides labor costs, material costs, permits, contingency, and VAT breakdown.`,
    input_schema: {
      type: 'object',
      properties: {
        projectType: {
          type: 'string',
          enum: [
            'kitchen_remodel',
            'bathroom_remodel',
            'painting',
            'flooring',
            'hvac',
            'plumbing',
            'electrical',
            'roofing',
            'landscaping',
            'general_renovation',
            'carpentry',
            'tiling',
            'waterproofing',
          ],
          description: 'Type of home improvement project',
        },
        scopeDescription: {
          type: 'string',
          description:
            'Detailed description of project scope, requirements, and specific work to be done',
        },
        materialsQuality: {
          type: 'string',
          enum: ['economy', 'standard', 'premium'],
          description:
            'Quality level of materials: economy (70% of standard), standard (baseline), premium (150% of standard)',
        },
        emirate: {
          type: 'string',
          enum: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ'],
          description: 'Emirate location - affects labor rates and material costs',
        },
        projectSize: {
          type: 'string',
          enum: ['small', 'medium', 'large'],
          description:
            'Relative size of the project: small (single room/area), medium (multiple rooms), large (whole house/extensive work)',
        },
      },
      required: ['projectType', 'scopeDescription', 'materialsQuality'],
    },
  },
  {
    name: 'estimate_timeline',
    description: `Estimate realistic project timelines considering UAE-specific factors like weather, permits, and labor availability.
    Use this when the user asks about duration, how long something takes, or project scheduling.
    Provides phase-by-phase breakdown with durations and UAE-specific considerations.`,
    input_schema: {
      type: 'object',
      properties: {
        projectType: {
          type: 'string',
          description: 'Type of home improvement project (e.g., kitchen remodel, painting, etc.)',
        },
        scopeDescription: {
          type: 'string',
          description: 'Detailed description of what work needs to be done',
        },
        urgency: {
          type: 'string',
          enum: ['emergency', 'urgent', 'normal', 'flexible'],
          description:
            'How quickly the project needs to be completed: emergency (<24h), urgent (<1 week), normal (standard timeline), flexible (can wait for best schedule)',
        },
        seasonalConsiderations: {
          type: 'boolean',
          description:
            'Whether to account for UAE summer heat (June-September) affecting outdoor work schedules',
        },
        requiresPermits: {
          type: 'boolean',
          description:
            'Whether the project requires government permits (adds 5-10 days for approval)',
        },
      },
      required: ['projectType', 'scopeDescription'],
    },
  },
  {
    name: 'search_knowledge_base',
    description: `Search the curated UAE home improvement knowledge base for regulations, best practices, materials info, and maintenance tips.
    Use this when the user has questions about:
    - UAE building codes, permits, or regulations
    - Best practices for renovations
    - Material selection and recommendations
    - Home maintenance advice
    - General home improvement information
    Returns relevant articles from the knowledge base.`,
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search query describing what information the user needs (e.g., "Dubai building permits", "AC maintenance", "waterproofing materials")',
        },
        category: {
          type: 'string',
          enum: ['regulations', 'best_practices', 'materials', 'maintenance', 'general'],
          description:
            'Category to focus the search on: regulations (permits, codes), best_practices (how-to guides), materials (product selection), maintenance (upkeep tips), general (any topic)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_lead',
    description: `Create a new lead (service request) in the marketplace when an AUTHENTICATED user expresses clear intent to get quotes or hire professionals.
    Use this when the user:
    - Is logged in (authenticated)
    - Explicitly wants to post a project or get quotes
    - Has provided enough project details (what they need, location, budget, urgency)
    - Is ready to connect with professionals

    ONLY use this tool for authenticated users. For guest users, use create_guest_lead instead.
    Do NOT use if they're just asking questions or exploring options.

    This creates a public marketplace lead that up to 5 verified professionals can claim.`,
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Clear, descriptive title for the project (e.g., "Kitchen Renovation in Dubai Marina")',
        },
        description: {
          type: 'string',
          description: 'Detailed description of what work needs to be done, including specifics from the conversation',
        },
        category: {
          type: 'string',
          enum: [
            'plumbing',
            'electrical',
            'painting',
            'carpentry',
            'hvac',
            'flooring',
            'roofing',
            'landscaping',
            'home-cleaning',
            'pest-control',
            'handyman',
            'interior-design',
            'tiling',
            'waterproofing',
            'masonry',
            'glass-aluminum',
            'renovation',
          ],
          description: 'Service category that best matches the project type',
        },
        emirate: {
          type: 'string',
          enum: ['dubai', 'abu-dhabi', 'sharjah', 'ajman', 'rak', 'fujairah', 'uaq'],
          description: 'Emirate where the work needs to be done',
        },
        budgetBracket: {
          type: 'string',
          enum: ['500-1k', '1k-5k', '5k-15k', '15k-50k', '50k-150k', '150k+'],
          description: 'Budget range in AED for the project',
        },
        urgency: {
          type: 'string',
          enum: ['emergency', 'urgent', 'flexible', 'planning'],
          description: 'How quickly the work needs to be done: emergency (24-48h), urgent (this week), flexible (within month), planning (future project)',
        },
        timeline: {
          type: 'string',
          description: 'Optional: When the user wants the project completed (e.g., "Within 2 weeks", "Before summer")',
        },
      },
      required: ['title', 'description', 'category', 'emirate', 'budgetBracket', 'urgency'],
    },
  },
  {
    name: 'create_guest_lead',
    description: `Create a new lead for GUEST (unauthenticated) users. This tool handles user creation, lead posting, and sends a magic link email.
    Use this when:
    - The user is NOT logged in (guest/anonymous)
    - User wants to post a project and has provided their email
    - User has provided enough project details

    IMPORTANT: You must collect the user's email address BEFORE calling this tool.
    Ask naturally: "To post your project and receive quotes, I just need your email address."

    This creates:
    1. A guest user account (if email is new)
    2. A marketplace lead visible to professionals
    3. Sends a magic link email for the user to access their account`,
    input_schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'User email address (required for guest leads)',
        },
        firstName: {
          type: 'string',
          description: 'User first name (optional but helps personalization)',
        },
        phone: {
          type: 'string',
          description: 'User phone number (optional)',
        },
        title: {
          type: 'string',
          description: 'Clear, descriptive title for the project',
        },
        description: {
          type: 'string',
          description: 'Detailed description of what work needs to be done',
        },
        category: {
          type: 'string',
          enum: [
            'plumbing',
            'electrical',
            'painting',
            'carpentry',
            'hvac',
            'flooring',
            'roofing',
            'landscaping',
            'home-cleaning',
            'pest-control',
            'handyman',
            'interior-design',
            'tiling',
            'waterproofing',
            'masonry',
            'glass-aluminum',
            'renovation',
          ],
          description: 'Service category that best matches the project type',
        },
        emirate: {
          type: 'string',
          enum: ['dubai', 'abu-dhabi', 'sharjah', 'ajman', 'rak', 'fujairah', 'uaq'],
          description: 'Emirate where the work needs to be done',
        },
        budgetBracket: {
          type: 'string',
          enum: ['500-1k', '1k-5k', '5k-15k', '15k-50k', '50k-150k', '150k+'],
          description: 'Budget range in AED for the project',
        },
        urgency: {
          type: 'string',
          enum: ['emergency', 'urgent', 'flexible', 'planning'],
          description: 'How quickly the work needs to be done',
        },
        timeline: {
          type: 'string',
          description: 'Optional: When the user wants the project completed',
        },
      },
      required: ['email', 'title', 'description', 'category', 'emirate', 'budgetBracket', 'urgency'],
    },
  },
  {
    name: 'search_professionals',
    description: `Search for verified professionals on Homezy based on service category, location, and other criteria.
    Use this when the user:
    - Asks for professional recommendations
    - Wants to know who can help with their project
    - Asks about available contractors/plumbers/electricians/etc.

    Returns a list of verified professionals with ratings, response times, and profiles.
    After showing results, offer to help the user post a lead to get quotes.`,
    input_schema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: [
            'plumbing',
            'electrical',
            'painting',
            'carpentry',
            'hvac',
            'flooring',
            'roofing',
            'landscaping',
            'home-cleaning',
            'pest-control',
            'handyman',
            'interior-design',
            'tiling',
            'waterproofing',
            'masonry',
            'glass-aluminum',
            'renovation',
          ],
          description: 'Service category to search for',
        },
        emirate: {
          type: 'string',
          enum: ['dubai', 'abu-dhabi', 'sharjah', 'ajman', 'rak', 'fujairah', 'uaq'],
          description: 'Emirate where the professional should operate',
        },
        minRating: {
          type: 'number',
          description: 'Minimum rating (1-5). Default is 4.0',
        },
        urgency: {
          type: 'string',
          enum: ['emergency', 'urgent', 'normal'],
          description: 'For emergency/urgent, prioritize professionals with fast response times',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return. Default is 5',
        },
      },
      required: ['category', 'emirate'],
    },
  },
];

// Helper function to get tool by name
export const getToolByName = (name: string): Tool | undefined => {
  return TOOLS.find((tool) => tool.name === name);
};

// Helper function to get all tool names
export const getToolNames = (): string[] => {
  return TOOLS.map((tool) => tool.name);
};

// Type for tool arguments (for type safety)
export type BudgetEstimateArgs = {
  projectType: string;
  scopeDescription: string;
  materialsQuality: 'economy' | 'standard' | 'premium';
  emirate?: string;
  projectSize?: 'small' | 'medium' | 'large';
};

export type TimelineEstimateArgs = {
  projectType: string;
  scopeDescription: string;
  urgency?: 'emergency' | 'urgent' | 'normal' | 'flexible';
  seasonalConsiderations?: boolean;
  requiresPermits?: boolean;
};

export type KnowledgeSearchArgs = {
  query: string;
  category?: 'regulations' | 'best_practices' | 'materials' | 'maintenance' | 'general';
};

export type CreateLeadArgs = {
  title: string;
  description: string;
  category: string;
  emirate: string;
  budgetBracket: string;
  urgency: 'emergency' | 'urgent' | 'flexible' | 'planning';
  timeline?: string;
};

export type CreateGuestLeadArgs = {
  email: string;
  firstName?: string;
  phone?: string;
  title: string;
  description: string;
  category: string;
  emirate: string;
  budgetBracket: string;
  urgency: 'emergency' | 'urgent' | 'flexible' | 'planning';
  timeline?: string;
};

export type SearchProfessionalsArgs = {
  category: string;
  emirate: string;
  minRating?: number;
  urgency?: 'emergency' | 'urgent' | 'normal';
  limit?: number;
};
