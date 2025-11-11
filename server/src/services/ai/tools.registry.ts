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
