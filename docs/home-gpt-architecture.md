# Home GPT - Agentic AI Architecture

**Last Updated:** November 10, 2024
**Status:** In Development
**Version:** 1.0

## Executive Summary

Home GPT is an **Agentic AI system** using Claude Sonnet 4.5's function calling to create a scalable, tool-using home improvement assistant for UAE homeowners. The agent autonomously decides which tools to use, executes calculations, fetches real data, and takes actions on behalf of users.

## Key Decisions

- **Architecture Type:** Agentic AI (not simple generative AI)
- **Streaming:** Socket.io (already configured)
- **Location:** Full-page landing experience (homepage replacement)
- **Guest Access:** Limited to 3-5 messages, then require signup
- **Phase 1 Tools:** Budget estimation, timeline estimation, knowledge base search

---

## System Architecture Overview

```
User Message
    ↓
Frontend (Socket.io) → Backend Chat Controller
    ↓
AI Service (Agent Orchestrator)
    ↓
Claude Sonnet 4.5 + Function Definitions
    ↓
[Claude decides to call functions]
    ↓
Tool Executor Routes to:
    - Budget Calculator Service
    - Timeline Estimator Service
    - Knowledge Base Search Service
    - [Future: Lead Creator, Pro Search, Photo Analyzer]
    ↓
Tool Returns Result → Back to Claude → Claude generates natural response
    ↓
Stream tokens via Socket.io → Frontend displays
```

---

## Backend Architecture

### 1. Database Models

#### Conversation Model (`server/src/models/Conversation.model.ts`)
```typescript
interface IConversation {
  conversationId: string;        // UUID
  userId?: ObjectId;             // null for guests
  guestId?: string;              // UUID for anonymous users
  title: string;                 // Auto-generated from first message
  messageCount: number;          // Track for guest limits (max 5)
  status: 'active' | 'archived' | 'guest_limited';
  context: {
    emirate?: string;            // If user mentioned location
    projectTypes?: string[];     // Detected project interests
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
}
```

**Key Methods:**
- `incrementMessageCount()` - Updates count and lastMessageAt
- `updateContext(updates)` - Merges context updates
- `findOrCreate(userId, guestId)` - Gets or creates active conversation

**Indexes:**
- `{ userId: 1, status: 1, 'metadata.lastMessageAt': -1 }`
- `{ guestId: 1, status: 1, 'metadata.lastMessageAt': -1 }`
- `{ createdAt: -1 }`

#### ChatMessage Model (`server/src/models/ChatMessage.model.ts`)
```typescript
interface IChatMessage {
  messageId: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: IToolCall[];       // Function calls made by Claude
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
}

interface IToolCall {
  id: string;
  name: string;                   // e.g., "estimate_budget"
  input: Record<string, any>;     // Function arguments
  output?: Record<string, any>;   // Function result
  status: 'pending' | 'success' | 'error';
  executionTimeMs?: number;
  error?: string;
}
```

**Static Methods:**
- `getConversationHistory(conversationId, limit)` - Gets last N messages for context
- `getTokenUsage(conversationId)` - Aggregates total tokens used

**Indexes:**
- `{ conversationId: 1, createdAt: 1 }`
- `{ 'toolCalls.name': 1 }`

---

### 2. AI Service Layer

#### File Structure
```
server/src/services/ai/
├── ai.service.ts           # Main agent orchestrator
├── tools.registry.ts       # Function definitions for Claude
└── system-prompts.ts       # System prompts with UAE context

server/src/services/tools/
├── budget-estimator.service.ts
├── timeline-estimator.service.ts
├── knowledge-base.service.ts
└── [future: lead-creator.service.ts, pro-search.service.ts, photo-analyzer.service.ts]
```

#### AI Service (`ai.service.ts`)

**Core Responsibilities:**
- Initialize Anthropic SDK client
- Manage streaming responses with function calling
- Execute tool calls via router
- Maintain conversation context
- Handle errors and fallbacks

**Key Methods:**

```typescript
class AIService {
  private anthropic: Anthropic;

  // Main agent loop with streaming
  async streamChatWithSocket(
    conversationId: string,
    userMessage: string,
    userId: string | undefined,
    socket: Socket
  ): Promise<void>

  // Execute tool based on name
  async executeToolCall(toolName: string, args: any): Promise<any>

  // Continue conversation after tool result
  async continueWithToolResult(
    conversationId: string,
    toolCall: any,
    result: any,
    socket: Socket
  ): Promise<void>

  // Build context-aware system prompt
  buildSystemPrompt(userId?: string): Promise<string>

  // Get conversation history for context
  async getConversationHistory(conversationId: string): Promise<Array<{role: string, content: string}>>

  // Save message to database
  async saveMessage(
    conversationId: string,
    role: string,
    content: string,
    toolCalls?: IToolCall[]
  ): Promise<void>
}
```

#### Tools Registry (`tools.registry.ts`)

Centralized function definitions that Claude sees:

```typescript
export const TOOLS = [
  {
    name: "estimate_budget",
    description: "Calculate accurate budget estimates for home improvement projects in UAE with AED breakdown",
    input_schema: {
      type: "object",
      properties: {
        projectType: {
          type: "string",
          enum: ["kitchen_remodel", "bathroom_remodel", "painting", "flooring", "hvac", "plumbing", "electrical", "roofing", "landscaping", "general_renovation"],
          description: "Type of home improvement project"
        },
        scopeDescription: {
          type: "string",
          description: "Detailed description of project scope and requirements"
        },
        materialsQuality: {
          type: "string",
          enum: ["economy", "standard", "premium"],
          description: "Quality level of materials (affects pricing)"
        },
        emirate: {
          type: "string",
          enum: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"],
          description: "Emirate location (affects labor and material costs)"
        },
        projectSize: {
          type: "string",
          enum: ["small", "medium", "large"],
          description: "Relative size of the project"
        }
      },
      required: ["projectType", "scopeDescription", "materialsQuality"]
    }
  },
  {
    name: "estimate_timeline",
    description: "Estimate realistic project timelines considering UAE factors (weather, permits, labor availability)",
    input_schema: {
      type: "object",
      properties: {
        projectType: { type: "string" },
        scopeDescription: { type: "string" },
        urgency: {
          type: "string",
          enum: ["emergency", "urgent", "normal", "flexible"],
          description: "How quickly the project needs to be completed"
        },
        seasonalConsiderations: {
          type: "boolean",
          description: "Whether to account for UAE summer heat affecting outdoor work"
        },
        requiresPermits: {
          type: "boolean",
          description: "Whether project requires government permits"
        }
      },
      required: ["projectType", "scopeDescription"]
    }
  },
  {
    name: "search_knowledge_base",
    description: "Search curated UAE home improvement guides, regulations, and best practices",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for home improvement knowledge"
        },
        category: {
          type: "string",
          enum: ["regulations", "best_practices", "materials", "maintenance", "general"],
          description: "Category to focus search on"
        }
      },
      required: ["query"]
    }
  }
];
```

**Scalability Note:** To add a new tool, simply add an object to this array with name, description, and input_schema. Claude learns to use it automatically!

---

### 3. Tool Implementation Services

#### Budget Estimator Service (`budget-estimator.service.ts`)

```typescript
interface BudgetEstimate {
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

class BudgetEstimatorService {
  // UAE market pricing data
  private pricingData = {
    labor_rates: {
      Dubai: { skilled: 80, standard: 50, helper: 30 },
      'Abu Dhabi': { skilled: 75, standard: 45, helper: 28 },
      // ... other emirates
    },
    material_multipliers: {
      economy: 0.7,
      standard: 1.0,
      premium: 1.5,
    },
    project_base_costs: {
      kitchen_remodel: { small: 30000, medium: 70000, large: 150000 },
      bathroom_remodel: { small: 15000, medium: 35000, large: 70000 },
      painting: { small: 2000, medium: 5000, large: 12000 },
      // ... other project types
    },
    permit_costs: {
      structural: 2000,
      electrical: 500,
      plumbing: 500,
      none: 0,
    },
    vat_rate: 0.05, // 5% VAT in UAE
  };

  async calculateBudget(args: BudgetEstimateInput): Promise<BudgetEstimate> {
    const { projectType, scopeDescription, materialsQuality, emirate, projectSize } = args;

    // Get base cost
    const baseCost = this.getBaseCost(projectType, projectSize || 'medium');

    // Apply material quality multiplier
    const materialMultiplier = this.pricingData.material_multipliers[materialsQuality];
    const materialCost = baseCost * materialMultiplier;

    // Calculate labor cost
    const laborRate = emirate
      ? this.pricingData.labor_rates[emirate]?.standard || 50
      : 50;
    const estimatedDays = this.estimateDays(projectType, projectSize);
    const laborCost = laborRate * estimatedDays * 8; // 8 hours per day

    // Permit costs
    const permitCost = this.estimatePermitCost(projectType);

    // Contingency (15% buffer)
    const subtotal = laborCost + materialCost + permitCost;
    const contingency = subtotal * 0.15;

    // VAT
    const vat = subtotal * this.pricingData.vat_rate;

    // Total
    const total = Math.round(subtotal + contingency + vat);

    return {
      total,
      breakdown: {
        labor: Math.round(laborCost),
        materials: Math.round(materialCost),
        permits: permitCost,
        contingency: Math.round(contingency),
        vat: Math.round(vat),
      },
      currency: 'AED',
      confidence: this.assessConfidence(scopeDescription),
      notes: [
        'Includes 5% UAE VAT',
        'Prices valid for 30 days',
        '15% contingency included for unexpected costs',
        `Based on ${emirate || 'UAE'} market rates`,
      ],
      projectSize: projectSize || 'medium',
      estimatedDuration: `${estimatedDays} days`,
    };
  }

  private getBaseCost(projectType: string, size: string): number {
    return this.pricingData.project_base_costs[projectType]?.[size] || 10000;
  }

  private estimateDays(projectType: string, size: string): number {
    const dayEstimates = {
      kitchen_remodel: { small: 7, medium: 14, large: 30 },
      bathroom_remodel: { small: 5, medium: 10, large: 21 },
      painting: { small: 2, medium: 5, large: 10 },
      // ... other project types
    };
    return dayEstimates[projectType]?.[size] || 7;
  }

  private estimatePermitCost(projectType: string): number {
    const permitRequired = ['kitchen_remodel', 'bathroom_remodel', 'electrical', 'plumbing'];
    return permitRequired.includes(projectType)
      ? this.pricingData.permit_costs.structural
      : 0;
  }

  private assessConfidence(description: string): 'low' | 'medium' | 'high' {
    const wordCount = description.split(' ').length;
    if (wordCount < 10) return 'low';
    if (wordCount < 30) return 'medium';
    return 'high';
  }
}
```

#### Timeline Estimator Service (`timeline-estimator.service.ts`)

```typescript
interface TimelineEstimate {
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

class TimelineEstimatorService {
  private timelineData = {
    base_durations: {
      kitchen_remodel: { small: 14, medium: 21, large: 45 },
      bathroom_remodel: { small: 7, medium: 14, large: 21 },
      painting: { small: 2, medium: 5, large: 10 },
      // ... other project types
    },
    permit_delays: {
      Dubai: { structural: 7, standard: 3 },
      'Abu Dhabi': { structural: 10, standard: 5 },
    },
    seasonal_factors: {
      summer_outdoor: 1.3, // 30% longer June-September
      winter_ideal: 1.0,
    },
    urgency_multipliers: {
      emergency: 0.5,  // Rush job, higher costs
      urgent: 0.7,
      normal: 1.0,
      flexible: 1.2,   // Can optimize schedule
    },
  };

  async estimateTimeline(args: TimelineEstimateInput): Promise<TimelineEstimate> {
    const { projectType, scopeDescription, urgency, seasonalConsiderations, requiresPermits } = args;

    // Get base duration
    let baseDays = this.getBaseDuration(projectType);

    // Apply urgency multiplier
    const urgencyMultiplier = this.timelineData.urgency_multipliers[urgency || 'normal'];
    baseDays = Math.round(baseDays * urgencyMultiplier);

    // Add permit time
    const permitDays = requiresPermits ? 7 : 0;

    // Seasonal adjustment
    let seasonalMultiplier = 1.0;
    if (seasonalConsiderations && this.isOutdoorWork(projectType)) {
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 5 && currentMonth <= 8) { // Jun-Sep
        seasonalMultiplier = this.timelineData.seasonal_factors.summer_outdoor;
      }
    }

    const adjustedDays = Math.round(baseDays * seasonalMultiplier);
    const totalDays = adjustedDays + permitDays;

    // Generate phases
    const phases = this.generatePhases(projectType, adjustedDays, permitDays);

    // Considerations
    const considerations = this.buildConsiderations(
      projectType,
      urgency,
      seasonalConsiderations,
      requiresPermits
    );

    return {
      estimatedDays: totalDays,
      startDateRecommendation: this.recommendStartDate(seasonalConsiderations, projectType),
      phases,
      considerations,
      criticalPath: this.identifyCriticalPath(projectType),
    };
  }

  private getBaseDuration(projectType: string): number {
    return this.timelineData.base_durations[projectType]?.medium || 7;
  }

  private generatePhases(projectType: string, baseDays: number, permitDays: number): any[] {
    const phases = [];

    if (permitDays > 0) {
      phases.push({
        name: 'Permits & Approvals',
        duration: permitDays,
        startOffset: 0,
        description: 'Obtain necessary permits from local authorities',
      });
    }

    phases.push(
      {
        name: 'Preparation',
        duration: Math.ceil(baseDays * 0.15),
        startOffset: permitDays,
        description: 'Site preparation, material procurement',
      },
      {
        name: 'Execution',
        duration: Math.ceil(baseDays * 0.70),
        startOffset: permitDays + Math.ceil(baseDays * 0.15),
        description: 'Main construction/installation work',
      },
      {
        name: 'Finishing',
        duration: Math.ceil(baseDays * 0.15),
        startOffset: permitDays + Math.ceil(baseDays * 0.85),
        description: 'Final touches, cleanup, inspection',
      }
    );

    return phases;
  }

  private isOutdoorWork(projectType: string): boolean {
    return ['roofing', 'landscaping', 'painting_exterior'].includes(projectType);
  }

  private recommendStartDate(seasonal: boolean, projectType: string): string {
    if (seasonal && this.isOutdoorWork(projectType)) {
      const month = new Date().getMonth();
      if (month >= 5 && month <= 8) {
        return 'Consider starting in October-April for outdoor work (ideal weather)';
      }
    }
    return 'Can start immediately upon permit approval';
  }

  private buildConsiderations(
    projectType: string,
    urgency: string,
    seasonal: boolean,
    permits: boolean
  ): string[] {
    const considerations = [];

    if (permits) {
      considerations.push('Dubai Municipality permits typically take 5-7 days');
    }

    if (seasonal && this.isOutdoorWork(projectType)) {
      considerations.push('UAE summer heat (Jun-Sep) may extend outdoor work by 30%');
    }

    if (urgency === 'emergency') {
      considerations.push('Rush job may incur 50-100% premium on labor costs');
    }

    considerations.push('Material availability may affect timeline');
    considerations.push('Multiple tradespeople required - scheduling coordination critical');

    return considerations;
  }

  private identifyCriticalPath(projectType: string): string[] {
    const criticalPaths = {
      kitchen_remodel: [
        'Demolition of old fixtures',
        'Plumbing rough-in',
        'Electrical rough-in',
        'Cabinet installation',
        'Countertop installation',
      ],
      bathroom_remodel: [
        'Demolition',
        'Waterproofing',
        'Plumbing installation',
        'Tiling',
        'Fixture installation',
      ],
    };

    return criticalPaths[projectType] || ['Planning', 'Execution', 'Completion'];
  }
}
```

#### Knowledge Base Service (`knowledge-base.service.ts`)

```typescript
interface KnowledgeArticle {
  id: string;
  category: 'regulations' | 'best_practices' | 'materials' | 'maintenance' | 'general';
  topic: string;
  content: string;
  tags: string[];
  relevance?: number; // Calculated during search
}

interface KnowledgeSearchResult {
  articles: KnowledgeArticle[];
  totalFound: number;
}

class KnowledgeBaseService {
  // Static knowledge base (can be enhanced with vector DB later)
  private knowledgeBase: KnowledgeArticle[] = [
    {
      id: 'kb_001',
      category: 'regulations',
      topic: 'Building Permits in Dubai',
      content: `Dubai Municipality requires building permits for any structural modifications,
      plumbing changes, electrical work, or significant renovations. The process typically takes
      5-7 business days and requires architectural drawings, NOC from landlord (if renting),
      and contractor license. Fees range from AED 500-2000 depending on project scope.`,
      tags: ['permits', 'dubai', 'municipality', 'regulations', 'structural'],
    },
    {
      id: 'kb_002',
      category: 'best_practices',
      topic: 'AC Maintenance in UAE Climate',
      content: `In UAE's extreme heat, air conditioning maintenance is critical. Best practices include:
      1) Quarterly filter cleaning/replacement, 2) Annual professional servicing before summer,
      3) Check for refrigerant leaks, 4) Clean condenser coils monthly, 5) Ensure proper drainage.
      Neglecting AC maintenance can increase electricity bills by 30% and reduce unit lifespan by 50%.`,
      tags: ['hvac', 'maintenance', 'ac', 'climate', 'energy-efficiency'],
    },
    {
      id: 'kb_003',
      category: 'materials',
      topic: 'Waterproofing Materials for UAE',
      content: `UAE's humidity and occasional heavy rains require robust waterproofing.
      Recommended materials: 1) Polyurethane coatings for bathrooms and balconies,
      2) Bituminous membranes for roofs, 3) Cementitious waterproofing for basements,
      4) Silicone sealants for joints. Always use materials rated for extreme temperatures (up to 50°C).`,
      tags: ['waterproofing', 'materials', 'humidity', 'roofing', 'bathroom'],
    },
    {
      id: 'kb_004',
      category: 'regulations',
      topic: 'Electrical Safety Standards UAE',
      content: `All electrical work in UAE must comply with IEC standards. Only licensed electricians
      can perform installations. Requirements include: proper earthing/grounding, RCD protection,
      load calculations for circuits, fire-resistant cables in specified areas. Residential circuits
      typically use 15A for lighting, 20A for outlets, 30A for AC units.`,
      tags: ['electrical', 'safety', 'regulations', 'standards', 'iec'],
    },
    {
      id: 'kb_005',
      category: 'best_practices',
      topic: 'Kitchen Renovation Tips UAE',
      content: `UAE kitchen renovation considerations: 1) Choose moisture-resistant materials due to humidity,
      2) Invest in quality ventilation/exhaust, 3) Opt for heat-resistant countertops (granite, quartz),
      4) Plan for large appliances (common in UAE villas), 5) Consider open-plan designs popular in modern UAE homes,
      6) Use tile or waterproof flooring. Budget: Economy AED 30-50K, Standard AED 70-100K, Premium AED 150K+.`,
      tags: ['kitchen', 'renovation', 'planning', 'design', 'budget'],
    },
    {
      id: 'kb_006',
      category: 'maintenance',
      topic: 'Pool Maintenance in UAE Heat',
      content: `UAE's intense sun and heat create unique pool maintenance challenges: 1) Test water chemistry twice weekly
      (evaporation increases chemical concentration), 2) Run filtration 8-12 hours daily in summer,
      3) Use pool covers to reduce evaporation by 95%, 4) Shock treat weekly, 5) Monitor calcium hardness (high in UAE tap water).
      Professional service recommended monthly. Cost: AED 200-400/month.`,
      tags: ['pool', 'maintenance', 'water', 'summer', 'heat'],
    },
    {
      id: 'kb_007',
      category: 'regulations',
      topic: 'Landlord Approval for Renovations',
      content: `If renting in UAE, you MUST obtain written NOC (No Objection Certificate) from landlord before any renovation.
      This includes: painting (if changing colors), flooring replacement, fixture changes, any structural work.
      Failure to get approval may result in: 1) Losing security deposit, 2) Repair costs, 3) Legal action.
      Always document approvals and condition with photos before/after.`,
      tags: ['rental', 'landlord', 'approval', 'noc', 'legal'],
    },
    {
      id: 'kb_008',
      category: 'materials',
      topic: 'Flooring Options for UAE Climate',
      content: `Best flooring for UAE homes: 1) Porcelain/Ceramic Tiles (most popular - cool, durable, easy to clean),
      2) Vinyl Plank (affordable, water-resistant), 3) Engineered Hardwood (better than solid wood in humidity),
      4) Marble (luxury, stays cool but expensive). AVOID: Solid hardwood (warps in humidity), carpet in bathrooms/kitchens.
      Cost per sqm: Tiles AED 30-150, Vinyl AED 40-80, Engineered Wood AED 100-300, Marble AED 200-800.`,
      tags: ['flooring', 'materials', 'tiles', 'wood', 'marble', 'climate'],
    },
    {
      id: 'kb_009',
      category: 'best_practices',
      topic: 'Choosing Paint Colors UAE Homes',
      content: `Paint selection tips for UAE: 1) Use light colors to reflect heat and keep rooms cool,
      2) Choose washable, moisture-resistant paints (high humidity), 3) Accent walls popular in modern UAE design,
      4) Consider Vastu/Feng Shui principles (important to many UAE residents), 5) Test samples in natural light.
      Popular: Off-white, beige, soft gray. Interior paint: AED 30-80/liter (quality brands: Jotun, Dulux, Berger).`,
      tags: ['painting', 'colors', 'design', 'interior', 'climate'],
    },
    {
      id: 'kb_010',
      category: 'maintenance',
      topic: 'Preventing Mold in UAE Humidity',
      content: `UAE's humidity (70-90% in summer) causes mold issues. Prevention: 1) Use dehumidifiers in bathrooms/closets,
      2) Ensure proper ventilation (exhaust fans in bathrooms), 3) Fix leaks immediately, 4) Clean AC units regularly,
      5) Wipe down tiles/glass after showers, 6) Use anti-mold paint in bathrooms. Treat existing mold with vinegar solution
      or commercial mold remover. Severe cases require professional remediation.`,
      tags: ['mold', 'humidity', 'maintenance', 'prevention', 'health'],
    },
  ];

  async searchKnowledge(query: string, category?: string): Promise<KnowledgeSearchResult> {
    const queryLower = query.toLowerCase();
    const searchTerms = queryLower.split(' ').filter(term => term.length > 2);

    // Filter by category if specified
    let articles = category
      ? this.knowledgeBase.filter(article => article.category === category)
      : this.knowledgeBase;

    // Calculate relevance scores
    articles = articles.map(article => {
      let relevance = 0;

      // Check topic match (highest weight)
      if (article.topic.toLowerCase().includes(queryLower)) {
        relevance += 10;
      }

      // Check tag matches (medium weight)
      const matchingTags = article.tags.filter(tag =>
        searchTerms.some(term => tag.includes(term))
      );
      relevance += matchingTags.length * 3;

      // Check content matches (lower weight)
      const contentMatches = searchTerms.filter(term =>
        article.content.toLowerCase().includes(term)
      );
      relevance += contentMatches.length;

      return { ...article, relevance };
    });

    // Filter out articles with no relevance
    articles = articles.filter(article => article.relevance! > 0);

    // Sort by relevance
    articles.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    // Return top 3 results
    const topResults = articles.slice(0, 3);

    return {
      articles: topResults,
      totalFound: articles.length,
    };
  }

  async getArticleById(id: string): Promise<KnowledgeArticle | null> {
    return this.knowledgeBase.find(article => article.id === id) || null;
  }

  async getArticlesByCategory(category: string): Promise<KnowledgeArticle[]> {
    return this.knowledgeBase.filter(article => article.category === category);
  }
}
```

---

### 4. Chat Controller & Routes

#### Chat Controller (`server/src/controllers/chat.controller.ts`)

```typescript
class ChatController {
  // Create new conversation
  async createConversation(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const guestId = req.cookies.guestId || generateGuestId();

    const conversation = await Conversation.findOrCreate(userId, guestId);

    // Set guest cookie if not authenticated
    if (!userId) {
      res.cookie('guestId', guestId, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict',
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  }

  // Get user's conversations
  async getConversations(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const guestId = req.cookies.guestId;

    if (!userId && !guestId) {
      throw new AppError('No user or guest ID found', 401, 'UNAUTHORIZED');
    }

    const query = userId ? { userId } : { guestId };
    const conversations = await Conversation.find(query)
      .sort({ 'metadata.lastMessageAt': -1 })
      .limit(20);

    res.json({
      success: true,
      data: conversations,
    });
  }

  // Get conversation with messages
  async getConversation(req: AuthRequest, res: Response) {
    const { conversationId } = req.params;
    const userId = req.user?.id;
    const guestId = req.cookies.guestId;

    // Find conversation
    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND');
    }

    // Verify ownership
    if (conversation.userId?.toString() !== userId && conversation.guestId !== guestId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    // Get messages
    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({
      success: true,
      data: {
        conversation,
        messages,
      },
    });
  }

  // Send message (triggers AI via Socket.io)
  async sendMessage(req: AuthRequest, res: Response) {
    const { conversationId, content } = req.body;
    const userId = req.user?.id;
    const guestId = req.cookies.guestId;

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new AppError('Message content is required', 400, 'VALIDATION_ERROR');
    }

    // Find conversation
    const conversation = await Conversation.findOne({ conversationId });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND');
    }

    // Check guest limits
    if (!userId && conversation.messageCount >= 5) {
      throw new AppError(
        'Guest message limit reached. Please sign up to continue.',
        403,
        'GUEST_LIMIT_REACHED'
      );
    }

    // Increment message count
    await conversation.incrementMessageCount();

    // Respond immediately (actual processing happens via Socket.io)
    res.json({
      success: true,
      message: 'Message received, processing...',
    });

    // Note: Actual AI processing happens in Socket.io handler
  }

  // Archive conversation
  async archiveConversation(req: AuthRequest, res: Response) {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    const conversation = await Conversation.findOne({ conversationId, userId });

    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'NOT_FOUND');
    }

    conversation.status = 'archived';
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation archived',
    });
  }
}
```

#### Chat Routes (`server/src/routes/chat.routes.ts`)

```typescript
import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { sendMessageSchema, createConversationSchema } from '../schemas/chat.schema';

const router = Router();
const chatController = new ChatController();

// Public routes (guest + auth)
router.post(
  '/conversations',
  optionalAuth, // Allows both guests and authenticated users
  chatController.createConversation
);

router.post(
  '/conversations/:conversationId/messages',
  optionalAuth,
  validate(sendMessageSchema),
  chatController.sendMessage
);

router.get(
  '/conversations/:conversationId',
  optionalAuth,
  chatController.getConversation
);

// Authenticated routes
router.get(
  '/conversations',
  authenticate,
  chatController.getConversations
);

router.delete(
  '/conversations/:conversationId',
  authenticate,
  chatController.archiveConversation
);

export default router;
```

---

### 5. Socket.io Integration

#### Socket Handlers (`server/src/sockets/chat.socket.ts`)

```typescript
import { Server, Socket } from 'socket.io';
import { AIService } from '../services/ai/ai.service';
import { Conversation } from '../models/Conversation.model';
import { verify } from 'jsonwebtoken';
import { config } from '../config/env';

export const setupChatSockets = (io: Server) => {
  const aiService = new AIService();

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    const guestId = socket.handshake.auth.guestId;

    if (token) {
      try {
        const decoded = verify(token, config.jwt.accessSecret) as any;
        socket.data.userId = decoded.userId;
      } catch (error) {
        // Invalid token, treat as guest
      }
    }

    if (guestId) {
      socket.data.guestId = guestId;
    }

    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join conversation room
    socket.on('chat:join_conversation', async (data) => {
      const { conversationId } = data;
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // User sends message
    socket.on('chat:send_message', async (data) => {
      const { conversationId, content } = data;
      const userId = socket.data.userId;
      const guestId = socket.data.guestId;

      try {
        // Validate conversation access
        const conversation = await Conversation.findOne({ conversationId });

        if (!conversation) {
          socket.emit('chat:error', { error: 'Conversation not found' });
          return;
        }

        // Check guest limits
        if (!userId && conversation.messageCount >= 5) {
          socket.emit('chat:error', {
            error: 'Guest message limit reached. Please sign up to continue.',
            code: 'GUEST_LIMIT_REACHED',
          });
          return;
        }

        // Start AI streaming
        await aiService.streamChatWithSocket(conversationId, content, userId, socket);
      } catch (error: any) {
        console.error('Chat error:', error);
        socket.emit('chat:error', { error: error.message || 'An error occurred' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
```

#### Update Server Index (`server/src/index.ts`)

```typescript
// Add chat socket setup
import { setupChatSockets } from './sockets/chat.socket';

// ... existing code ...

// Set up Socket.io
setupChatSockets(io);

// ... rest of server code ...
```

---

## Frontend Architecture

### 1. Homepage with Chat Interface

#### Homepage (`client/app/page.tsx`)

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Header } from '@/components/Header';

export default function HomePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'professional') {
        router.push('/pro/dashboard');
      } else {
        router.push('/dashboard'); // Homeowner dashboard (future)
      }
    }
  }, [user, router]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
```

### 2. Chat Components

#### Chat Interface (`client/components/chat/ChatInterface.tsx`)

```tsx
'use client';

import { useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { WelcomeSection } from './WelcomeSection';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { GuestLimitBanner } from './GuestLimitBanner';
import { StreamingIndicator } from './StreamingIndicator';

export const ChatInterface = () => {
  const {
    messages,
    isStreaming,
    streamingMessage,
    guestMessageCount,
    isGuestLimitReached,
    initializeConversation,
    sendMessage,
  } = useChatStore();

  const { user } = useAuthStore();
  const { isConnected } = useSocket();

  // Initialize conversation on mount
  useEffect(() => {
    initializeConversation();
  }, [initializeConversation]);

  const handleSendMessage = async (content: string) => {
    if (!isConnected) {
      console.error('Socket not connected');
      return;
    }

    await sendMessage(content);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto px-4">
      {/* Welcome Section (shown if empty) */}
      {messages.length === 0 && <WelcomeSection />}

      {/* Message List */}
      <MessageList
        messages={messages}
        streamingMessage={streamingMessage}
        isStreaming={isStreaming}
      />

      {/* Streaming Indicator */}
      {isStreaming && <StreamingIndicator />}

      {/* Guest Limit Banner */}
      {!user && guestMessageCount >= 3 && (
        <GuestLimitBanner remaining={5 - guestMessageCount} />
      )}

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isStreaming || isGuestLimitReached}
        placeholder={
          isGuestLimitReached
            ? 'Sign up to continue chatting...'
            : 'Ask about your home improvement project...'
        }
      />

      {/* Connection Status */}
      {!isConnected && (
        <div className="text-center text-sm text-red-600 py-2">
          Reconnecting to chat...
        </div>
      )}
    </div>
  );
};
```

#### Message List (`client/components/chat/MessageList.tsx`)

```tsx
import { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatMessage } from '@/shared/types/chat.types';

interface MessageListProps {
  messages: ChatMessage[];
  streamingMessage: string;
  isStreaming: boolean;
}

export const MessageList = ({ messages, streamingMessage, isStreaming }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  return (
    <div className="flex-1 overflow-y-auto py-6 space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Streaming message */}
      {isStreaming && streamingMessage && (
        <MessageBubble
          message={{
            id: 'streaming',
            conversationId: '',
            role: 'assistant',
            content: streamingMessage,
            createdAt: new Date(),
          }}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
```

#### Message Bubble (`client/components/chat/MessageBubble.tsx`)

```tsx
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/shared/types/chat.types';
import ReactMarkdown from 'react-markdown';
import { FunctionCallBadge } from './FunctionCallBadge';
import { BotAvatar, UserAvatar } from './Avatars';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        'flex gap-3 items-start',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'assistant' && <BotAvatar />}

      <div
        className={cn(
          'max-w-2xl rounded-2xl px-4 py-3 shadow-sm',
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        )}
      >
        {/* Show function calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mb-2 space-y-1">
            {message.toolCalls.map((tool) => (
              <FunctionCallBadge key={tool.id} toolCall={tool} />
            ))}
          </div>
        )}

        {/* Message content with markdown */}
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Timestamp */}
        <div className={cn(
          "text-xs mt-2",
          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
        )}>
          {format(new Date(message.createdAt), 'HH:mm')}
        </div>
      </div>

      {message.role === 'user' && <UserAvatar />}
    </div>
  );
};
```

#### Function Call Badge (`client/components/chat/FunctionCallBadge.tsx`)

```tsx
import { IToolCall } from '@/shared/types/chat.types';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface FunctionCallBadgeProps {
  toolCall: IToolCall;
}

export const FunctionCallBadge = ({ toolCall }: FunctionCallBadgeProps) => {
  const icons = {
    estimate_budget: '💰',
    estimate_timeline: '📅',
    search_knowledge_base: '📚',
    create_lead_form: '📝',
    search_professionals: '👷',
  };

  const labels = {
    estimate_budget: 'Calculating budget',
    estimate_timeline: 'Estimating timeline',
    search_knowledge_base: 'Searching knowledge base',
    create_lead_form: 'Creating lead form',
    search_professionals: 'Finding professionals',
  };

  return (
    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
      <span className="text-base">{icons[toolCall.name as keyof typeof icons] || '🔧'}</span>
      <span>{labels[toolCall.name as keyof typeof labels] || toolCall.name}</span>

      {toolCall.status === 'pending' && <LoadingSpinner size="sm" />}
      {toolCall.status === 'success' && <CheckCircleIcon className="w-4 h-4 text-green-600" />}
      {toolCall.status === 'error' && <XCircleIcon className="w-4 h-4 text-red-600" />}

      {toolCall.executionTimeMs && (
        <span className="text-xs text-blue-500">({toolCall.executionTimeMs}ms)</span>
      )}
    </div>
  );
};
```

#### Message Input (`client/components/chat/MessageInput.tsx`)

```tsx
import { useState, useRef, KeyboardEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({ onSend, disabled, placeholder }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!content.trim() || disabled) return;

    onSend(content.trim());
    setContent('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white py-4">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type your message...'}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed max-h-32"
        />

        <button
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className="bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};
```

#### Welcome Section (`client/components/chat/WelcomeSection.tsx`)

```tsx
import { SparklesIcon } from '@heroicons/react/24/solid';

export const WelcomeSection = () => {
  const suggestedPrompts = [
    'Estimate budget for kitchen renovation',
    'How long does bathroom remodeling take?',
    'What permits do I need in Dubai?',
    'Best flooring for UAE climate',
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl text-center space-y-6">
        {/* Logo/Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
          <SparklesIcon className="w-8 h-8 text-blue-600" />
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Home GPT
          </h1>
          <p className="text-lg text-gray-600">
            Your AI-powered home improvement assistant for UAE
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-600">
          Get instant budget estimates, timeline planning, and expert advice for your home improvement projects.
          Ask me anything about renovations, repairs, or home maintenance in the UAE.
        </p>

        {/* Suggested Prompts */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Try asking:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                className="text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                onClick={() => {
                  // TODO: Pre-fill message input with this prompt
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-xs text-gray-600">Budget Estimates</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📅</div>
            <p className="text-xs text-gray-600">Timeline Planning</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📚</div>
            <p className="text-xs text-gray-600">Expert Knowledge</p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### Guest Limit Banner (`client/components/chat/GuestLimitBanner.tsx`)

```tsx
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface GuestLimitBannerProps {
  remaining: number;
}

export const GuestLimitBanner = ({ remaining }: GuestLimitBannerProps) => {
  const router = useRouter();

  if (remaining <= 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900 mb-1">
              Message Limit Reached
            </h3>
            <p className="text-sm text-red-700 mb-3">
              You've used all your free messages. Sign up to continue chatting with Home GPT.
            </p>
            <button
              onClick={() => router.push('/auth/register')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ExclamationCircleIcon className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <span className="font-medium">{remaining} messages remaining</span> as a guest
          </p>
        </div>
        <button
          onClick={() => router.push('/auth/register')}
          className="bg-yellow-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-yellow-700 transition-colors whitespace-nowrap"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};
```

### 3. Chat Store

#### Chat Zustand Store (`client/store/chatStore.ts`)

```typescript
import { create } from 'zustand';
import { ChatMessage } from '@/shared/types/chat.types';
import axios from 'axios';

interface ChatState {
  conversationId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingMessage: string;
  currentToolCall: { name: string; id: string } | null;
  guestMessageCount: number;
  isGuestLimitReached: boolean;

  // Actions
  initializeConversation: () => Promise<void>;
  sendMessage: (content: string) => void;
  appendStreamingToken: (token: string) => void;
  setStreamingMessage: (message: string) => void;
  startFunctionCall: (toolName: string, toolId: string) => void;
  completeFunctionCall: (toolName: string, result: any) => void;
  completeStreaming: () => void;
  loadHistory: (conversationId: string) => Promise<void>;
  incrementGuestCount: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversationId: null,
  messages: [],
  isStreaming: false,
  streamingMessage: '',
  currentToolCall: null,
  guestMessageCount: 0,
  isGuestLimitReached: false,

  initializeConversation: async () => {
    try {
      const response = await axios.post('/api/v1/chat/conversations');
      const { data } = response.data;

      set({
        conversationId: data.conversationId,
        guestMessageCount: data.messageCount,
        isGuestLimitReached: data.messageCount >= 5,
      });

      // Load existing messages if any
      if (data.messageCount > 0) {
        await get().loadHistory(data.conversationId);
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  },

  sendMessage: (content: string) => {
    const { conversationId, incrementGuestCount } = get();
    const { user } = useAuthStore.getState();
    const { socket } = useSocket.getState();

    if (!conversationId || !socket) {
      console.error('No conversation or socket available');
      return;
    }

    // Create user message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add user message immediately
    set(state => ({
      messages: [
        ...state.messages,
        {
          id: messageId,
          conversationId,
          role: 'user',
          content,
          createdAt: new Date(),
          tokens: { input: 0, output: 0 },
          status: 'sent',
        },
      ],
      isStreaming: true,
      streamingMessage: '',
    }));

    // Send via Socket.io
    socket.emit('chat:send_message', {
      conversationId,
      content,
    });

    // Increment guest count if not authenticated
    if (!user) {
      incrementGuestCount();
    }
  },

  appendStreamingToken: (token: string) => {
    set(state => ({
      streamingMessage: state.streamingMessage + token,
    }));
  },

  setStreamingMessage: (message: string) => {
    set({ streamingMessage: message });
  },

  startFunctionCall: (toolName: string, toolId: string) => {
    set({
      currentToolCall: { name: toolName, id: toolId },
    });
  },

  completeFunctionCall: (toolName: string, result: any) => {
    console.log(`Function ${toolName} completed:`, result);
    set({ currentToolCall: null });
  },

  completeStreaming: () => {
    const { streamingMessage, messages, conversationId } = get();

    if (!streamingMessage.trim()) {
      set({ isStreaming: false, streamingMessage: '' });
      return;
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    set({
      messages: [
        ...messages,
        {
          id: messageId,
          conversationId: conversationId!,
          role: 'assistant',
          content: streamingMessage,
          createdAt: new Date(),
          tokens: { input: 0, output: 0 },
          status: 'sent',
        },
      ],
      isStreaming: false,
      streamingMessage: '',
    });
  },

  loadHistory: async (conversationId: string) => {
    try {
      const response = await axios.get(`/api/v1/chat/conversations/${conversationId}`);
      const { data } = response.data;

      set({
        conversationId: data.conversation.conversationId,
        messages: data.messages,
        guestMessageCount: data.conversation.messageCount,
        isGuestLimitReached: data.conversation.messageCount >= 5,
      });
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  },

  incrementGuestCount: () => {
    set(state => {
      const newCount = state.guestMessageCount + 1;
      return {
        guestMessageCount: newCount,
        isGuestLimitReached: newCount >= 5,
      };
    });
  },

  reset: () => {
    set({
      conversationId: null,
      messages: [],
      isStreaming: false,
      streamingMessage: '',
      currentToolCall: null,
      guestMessageCount: 0,
      isGuestLimitReached: false,
    });
  },
}));
```

### 4. Socket.io Hook

#### Socket Hook (`client/hooks/useSocket.ts`)

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const {
    appendStreamingToken,
    startFunctionCall,
    completeFunctionCall,
    completeStreaming,
    conversationId,
  } = useChatStore();

  const { user } = useAuthStore();

  useEffect(() => {
    // Reuse existing socket instance
    if (socketInstance?.connected) {
      setSocket(socketInstance);
      setIsConnected(true);
      return;
    }

    // Get guest ID from cookie or create new one
    const getGuestId = () => {
      const match = document.cookie.match(/guestId=([^;]+)/);
      return match ? match[1] : `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    // Get auth token
    const getAuthToken = () => {
      return localStorage.getItem('accessToken');
    };

    // Create new socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: {
        token: getAuthToken(),
        guestId: getGuestId(),
      },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);

      // Join conversation room if we have one
      if (conversationId) {
        newSocket.emit('chat:join_conversation', { conversationId });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection error. Retrying...');
    });

    // Listen for streaming tokens
    newSocket.on('chat:token', ({ token }) => {
      appendStreamingToken(token);
    });

    // Listen for function call start
    newSocket.on('chat:function_call_start', ({ toolName, toolId }) => {
      startFunctionCall(toolName, toolId);
    });

    // Listen for function call completion
    newSocket.on('chat:function_call_complete', ({ toolName, result }) => {
      completeFunctionCall(toolName, result);
    });

    // Listen for message completion
    newSocket.on('chat:complete', () => {
      completeStreaming();
    });

    // Listen for errors
    newSocket.on('chat:error', ({ error, code }) => {
      console.error('Chat error:', error);

      if (code === 'GUEST_LIMIT_REACHED') {
        toast.error('Message limit reached. Please sign up to continue.');
      } else {
        toast.error(error || 'An error occurred');
      }

      completeStreaming();
    });

    socketInstance = newSocket;
    setSocket(newSocket);

    return () => {
      // Don't disconnect on unmount (keep connection alive)
      // newSocket.disconnect();
    };
  }, [conversationId, user]);

  // Join conversation when ID changes
  useEffect(() => {
    if (socket && conversationId) {
      socket.emit('chat:join_conversation', { conversationId });
    }
  }, [socket, conversationId]);

  return { socket, isConnected };
};
```

---

## Shared Package

### Types (`shared/src/types/chat.types.ts`)

```typescript
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
```

### Schemas (`shared/src/schemas/chat.schema.ts`)

```typescript
import { z } from 'zod';

export const sendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  content: z.string().min(1, 'Message content is required').max(2000, 'Message too long'),
});

export const createConversationSchema = z.object({
  title: z.string().optional(),
});

export const budgetEstimateInputSchema = z.object({
  projectType: z.enum([
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
  ]),
  scopeDescription: z.string().min(10, 'Please provide more details about your project'),
  materialsQuality: z.enum(['economy', 'standard', 'premium']),
  emirate: z
    .enum(['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK', 'Fujairah', 'UAQ'])
    .optional(),
  projectSize: z.enum(['small', 'medium', 'large']).optional(),
});

export const timelineEstimateInputSchema = z.object({
  projectType: z.string().min(1),
  scopeDescription: z.string().min(10),
  urgency: z.enum(['emergency', 'urgent', 'normal', 'flexible']).optional(),
  seasonalConsiderations: z.boolean().optional(),
  requiresPermits: z.boolean().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type BudgetEstimateInput = z.infer<typeof budgetEstimateInputSchema>;
export type TimelineEstimateInput = z.infer<typeof timelineEstimateInputSchema>;
```

---

## Implementation Timeline

### Week 1: Backend Foundation ✅
- [x] Database models (Conversation, ChatMessage)
- [ ] AI service architecture + tool registry
- [ ] Budget estimator service
- [ ] Timeline estimator service
- [ ] Knowledge base service

### Week 2: Backend Integration
- [ ] Chat controller + routes
- [ ] Socket.io streaming + function calling
- [ ] Guest session middleware
- [ ] Testing agent loop end-to-end

### Week 3: Frontend Core
- [ ] Chat UI components
- [ ] Chat Zustand store
- [ ] Socket.io client hook
- [ ] Homepage redesign with ChatInterface

### Week 4: Polish & Scale
- [ ] Guest limit enforcement + CTA
- [ ] Error handling + edge cases
- [ ] Performance optimization
- [ ] Add 1-2 more tools (validate scalability)
- [ ] Documentation

**Total: 4 weeks for production-ready Agentic AI**

---

## Scalability: Adding New Tools

### Example: Adding Lead Creator Tool

**Step 1: Define in Registry** (`tools.registry.ts`)
```typescript
{
  name: "create_lead_form",
  description: "Generate optimized lead request for marketplace posting",
  input_schema: {
    type: "object",
    properties: {
      projectDetails: { type: "string" },
      budget: { type: "number" },
      timeline: { type: "string" },
      emirate: { type: "string" },
    },
    required: ["projectDetails", "emirate"]
  }
}
```

**Step 2: Implement Service** (`lead-creator.service.ts`)
```typescript
class LeadCreatorService {
  async createLead(args: CreateLeadInput): Promise<Lead> {
    return await Lead.create({ ...args });
  }
}
```

**Step 3: Add to Executor** (`ai.service.ts`)
```typescript
case 'create_lead_form':
  return await leadCreatorService.createLead(args);
```

**That's it!** Claude automatically learns to use the new tool.

---

## Success Metrics

### Technical
- Tool execution latency < 500ms per call
- Streaming latency < 100ms per token
- 95%+ tool call success rate
- Socket.io uptime > 99%

### User Experience
- Guest-to-signup conversion > 30%
- Average 3+ tool calls per conversation
- User satisfaction with estimates > 85%

### Scalability
- Can add new tool in < 1 hour
- No architecture changes needed for new tools

---

## Future Enhancements (Phase 2+)

1. **Lead Generation Tool** - Creates marketplace leads from conversation
2. **Professional Search** - Recommends pros based on chat context
3. **Photo Analysis** - Claude Vision for damage assessment
4. **Project Creator** - Auto-creates projects from conversation
5. **Appointment Scheduler** - Books consultations with pros
6. **Progress Tracker** - Updates project milestones
7. **Document Generator** - Creates contracts, invoices
8. **Price Negotiator** - Helps negotiate with professionals

---

## References

- **Anthropic Docs:** https://docs.anthropic.com/en/docs/build-with-claude/tool-use
- **Socket.io Docs:** https://socket.io/docs/v4/
- **Claude Sonnet 4.5:** Best model for function calling, released Jan 2025

---

**Version History:**
- v1.0 (Nov 10, 2024) - Initial architecture plan
