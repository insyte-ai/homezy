# HomeGPT AI Enhancement Plan (v2)

**Last Updated:** November 26, 2024
**Status:** Planning Complete
**Version:** 2.0
**Previous Version:** See `docs/home-gpt-architecture.md` for v1.0 (Nov 10, 2024)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              HOMEGPT AGENTIC AI SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         CLIENT LAYER (Next.js)                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │   │
│  │  │ ChatPanel   │  │ MessageList │  │ImageUpload  │  │ ProResults   │   │   │
│  │  │ Component   │  │ + Streaming │  │ Component   │  │ Display      │   │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘   │   │
│  │         └────────────────┴────────────────┴────────────────┘           │   │
│  │                                   │                                     │   │
│  │                        ┌──────────▼──────────┐                         │   │
│  │                        │   Zustand Store     │                         │   │
│  │                        │  (chatStore.ts)     │                         │   │
│  │                        │  - messages         │                         │   │
│  │                        │  - guestContext     │                         │   │
│  │                        │  - projectContext   │                         │   │
│  │                        │  - streamingState   │                         │   │
│  │                        └──────────┬──────────┘                         │   │
│  └───────────────────────────────────┼─────────────────────────────────────┘   │
│                                      │                                         │
│                           Socket.IO  │  WebSocket                              │
│                                      ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         SERVER LAYER (Express)                          │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    SOCKET HANDLERS                               │   │   │
│  │  │  chat.socket.ts                                                  │   │   │
│  │  │  ├── chat:send_message      → Text messages                     │   │   │
│  │  │  ├── chat:send_image        → Image + vision analysis           │   │   │
│  │  │  └── chat:join/leave        → Room management                   │   │   │
│  │  └─────────────────────────────────┬───────────────────────────────┘   │   │
│  │                                    │                                   │   │
│  │                                    ▼                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    AI ORCHESTRATION LAYER                        │   │   │
│  │  │                      (ai.service.ts)                             │   │   │
│  │  │                                                                  │   │   │
│  │  │  ┌────────────────────────────────────────────────────────────┐ │   │   │
│  │  │  │                   AGENTIC LOOP                             │ │   │   │
│  │  │  │                                                            │ │   │   │
│  │  │  │  1. Receive User Message                                   │ │   │   │
│  │  │  │           │                                                │ │   │   │
│  │  │  │           ▼                                                │ │   │   │
│  │  │  │  2. Build Context (history + user profile + project)       │ │   │   │
│  │  │  │           │                                                │ │   │   │
│  │  │  │           ▼                                                │ │   │   │
│  │  │  │  3. Call Claude API (streaming + tools)                    │ │   │   │
│  │  │  │           │                                                │ │   │   │
│  │  │  │           ▼                                                │ │   │   │
│  │  │  │  4. Stream Response ──────────────────► Socket: chat:token │ │   │   │
│  │  │  │           │                                                │ │   │   │
│  │  │  │           ▼                                                │ │   │   │
│  │  │  │  5. If Tool Call Detected:                                 │ │   │   │
│  │  │  │     ├── Parse tool name + args                             │ │   │   │
│  │  │  │     ├── Execute tool ──────────────► Tool Services         │ │   │   │
│  │  │  │     ├── Emit: chat:function_call_complete                  │ │   │   │
│  │  │  │     └── Continue with tool result                          │ │   │   │
│  │  │  │           │                                                │ │   │   │
│  │  │  │           ▼                                                │ │   │   │
│  │  │  │  6. Save to DB + Update Context                            │ │   │   │
│  │  │  │           │                                                │ │   │   │
│  │  │  │           ▼                                                │ │   │   │
│  │  │  │  7. Emit: chat:complete                                    │ │   │   │
│  │  │  │                                                            │ │   │   │
│  │  │  └────────────────────────────────────────────────────────────┘ │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                    │                                   │   │
│  │                                    ▼                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    TOOLS LAYER                                   │   │   │
│  │  │                                                                  │   │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │   │   │
│  │  │  │  EXISTING    │  │  NEW TOOLS   │  │  KNOWLEDGE LAYER     │   │   │   │
│  │  │  │              │  │              │  │                      │   │   │   │
│  │  │  │ estimate_    │  │ search_      │  │ ┌──────────────────┐ │   │   │   │
│  │  │  │ budget       │  │ professionals│  │ │ knowledge-base   │ │   │   │   │
│  │  │  │              │  │              │  │ │ .service.ts      │ │   │   │   │
│  │  │  │ estimate_    │  │ create_      │  │ │                  │ │   │   │   │
│  │  │  │ timeline     │  │ guest_lead   │  │ │ 50+ Articles:    │ │   │   │   │
│  │  │  │              │  │              │  │ │ - Regulations    │ │   │   │   │
│  │  │  │ create_lead  │  │ analyze_     │  │ │ - Best Practices │ │   │   │   │
│  │  │  │ (auth only)  │  │ image        │  │ │ - Materials      │ │   │   │   │
│  │  │  │              │  │              │  │ │ - Maintenance    │ │   │   │   │
│  │  │  │ search_      │  │ update_      │  │ │ - Costs          │ │   │   │   │
│  │  │  │ knowledge    │  │ project_     │  │ │ - Seasonal       │ │   │   │   │
│  │  │  │ _base        │  │ context      │  │ └──────────────────┘ │   │   │   │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────┘   │   │   │
│  │  │                                                                  │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                    │                                   │   │
│  └────────────────────────────────────┼───────────────────────────────────┘   │
│                                       │                                       │
│                                       ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER                                      │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │   │
│  │  │    MongoDB      │  │     Redis       │  │     Cloudinary          │ │   │
│  │  │                 │  │                 │  │                         │ │   │
│  │  │ - Conversation  │  │ - Session cache │  │ - Image uploads         │ │   │
│  │  │ - ChatMessage   │  │ - Pro search    │  │ - Vision analysis URLs  │ │   │
│  │  │ - User          │  │   cache         │  │                         │ │   │
│  │  │ - Lead          │  │ - Rate limits   │  │                         │ │   │
│  │  │ - Service       │  │                 │  │                         │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                      Weaviate                                    │   │   │
│  │  │                                                                  │   │   │
│  │  │  - Vector embeddings for semantic search                         │   │   │
│  │  │  - Knowledge base article indexing                               │   │   │
│  │  │  - LLM-friendly retrieval                                        │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL SERVICES                                    │   │
│  │                                                                         │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐ │   │
│  │  │  Anthropic API  │  │     Brevo       │  │       Stripe            │ │   │
│  │  │  Claude Sonnet  │  │  Email Service  │  │   (Credit System)       │ │   │
│  │  │  4.5 + Vision   │  │  Magic Links    │  │                         │ │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘ │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Tool Execution Flow

```
User: "I need a plumber for a leak in Dubai Marina"
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              AI SERVICE (Agentic Loop)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Claude receives message + tools array                  │
│           │                                             │
│           ▼                                             │
│  Claude decides: "I should search for professionals"    │
│           │                                             │
│           ▼                                             │
│  Tool Call: search_professionals({                      │
│    category: "plumbing",                                │
│    emirate: "dubai",                                    │
│    urgency: "urgent"                                    │
│  })                                                     │
│           │                                             │
│           ▼                                             │
│  Execute Tool → Query professionals from DB             │
│           │                                             │
│           ▼                                             │
│  Tool Result: [{ name: "Quick Fix", rating: 4.8 }, ...] │
│           │                                             │
│           ▼                                             │
│  Claude continues with result:                          │
│  "I found 5 verified plumbers in Dubai Marina:          │
│   1. Quick Fix Plumbing ⭐4.8..."                       │
│           │                                             │
│           ▼                                             │
│  Stream response to client                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow: Guest Lead Creation

```
Guest User Conversation
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  1. User describes project (AI extracts context)           │
│     → update_project_context tool captures:                │
│       - category: plumbing                                 │
│       - emirate: dubai                                     │
│       - urgency: urgent                                    │
│       - description: "leak under kitchen sink"             │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  2. AI provides value (budget estimate, advice)            │
│     → estimate_budget tool returns AED 500-2,000           │
│     → AI naturally asks: "Want to get quotes from pros?"   │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  3. User says yes, AI collects email                       │
│     → "Just share your email and I'll connect you"         │
│     → User: "john@example.com"                             │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  4. AI calls create_guest_lead tool                        │
│     Input: {                                               │
│       email: "john@example.com",                           │
│       title: "Kitchen Sink Leak Repair",                   │
│       description: "Leak under kitchen sink...",           │
│       category: "plumbing",                                │
│       emirate: "dubai",                                    │
│       budgetBracket: "500-1k",                             │
│       urgency: "urgent"                                    │
│     }                                                      │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  5. Backend creates:                                       │
│     a. Guest user account (isGuestAccount: true)           │
│     b. Lead in marketplace                                 │
│     c. Sends magic link email                              │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│  6. AI confirms:                                           │
│     "Your lead is posted! Check your email for access."    │
└────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: New AI Tools (Priority: High)

#### 1.1 Guest Lead Creation Tool
**Files to create:**
- `server/src/services/tools/guest-lead-creator.service.ts`

**Files to modify:**
- `server/src/services/ai/tools.registry.ts` - Add tool definition
- `server/src/services/ai/ai.service.ts` - Add tool execution handler
- `server/src/services/ai/system-prompts.ts` - Add guidance for email collection

**Tool Definition:**
```typescript
{
  name: 'create_guest_lead',
  description: 'Create a lead for guest users. Requires email. Creates guest account + lead + sends magic link.',
  input_schema: {
    properties: {
      email: { type: 'string', description: 'User email (required)' },
      firstName: { type: 'string' },
      phone: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      category: { type: 'string', enum: [...services] },
      emirate: { type: 'string', enum: [...emirates] },
      budgetBracket: { type: 'string', enum: [...brackets] },
      urgency: { type: 'string', enum: ['emergency', 'urgent', 'flexible', 'planning'] },
      timeline: { type: 'string' }
    },
    required: ['email', 'title', 'description', 'category', 'emirate', 'budgetBracket', 'urgency']
  }
}
```

#### 1.2 Professional Search Tool
**Files to create:**
- `server/src/services/tools/professional-search.service.ts`

**Files to modify:**
- `server/src/services/ai/tools.registry.ts`
- `server/src/services/ai/ai.service.ts`

**Tool Definition:**
```typescript
{
  name: 'search_professionals',
  description: 'Search verified professionals. Use when user wants recommendations.',
  input_schema: {
    properties: {
      category: { type: 'string' },
      emirate: { type: 'string' },
      minRating: { type: 'number', default: 4.0 },
      urgency: { type: 'string', enum: ['emergency', 'urgent', 'normal'] },
      limit: { type: 'number', default: 5 }
    },
    required: ['category', 'emirate']
  }
}
```

**Matching Algorithm:**
- Category match: 30 points
- Location match: 25 points
- Rating score: 20 points (rating × 4)
- Response time: 15 points (<4h = 15, <12h = 12, <24h = 9)
- Budget fit: 10 points

**Display Format: Detailed Cards**
Each professional result displayed as a rich card containing:
- Business name + verification badge
- Star rating + review count
- Service categories/specialties
- Response time ("Usually responds within 4 hours")
- Years in business
- Completed projects count
- Price range indicator
- "View Profile" and "Send Lead" action buttons

#### 1.3 Image Analysis Tool
**Files to modify:**
- `server/src/services/ai/ai.service.ts` - Add `streamChatWithImage()` method
- `server/src/services/ai/system-prompts.ts` - Add image analysis prompt
- `server/src/sockets/chat.socket.ts` - Add `chat:send_image` handler
- `server/src/models/ChatMessage.model.ts` - Extend attachments schema

**Implementation:**
- Use Claude Vision API with image URLs from Cloudinary
- Extract: issue type, severity, affected area, service recommendation
- Feed analysis into budget/timeline tools and lead enrichment

#### 1.4 Project Context Tool
**Files to create:**
- `server/src/services/ai/conversation-context.service.ts`

**Tool Definition:**
```typescript
{
  name: 'update_project_context',
  description: 'Track project details from conversation for richer lead creation.',
  input_schema: {
    properties: {
      serviceCategory: { type: 'string' },
      workTypes: { type: 'array', items: { type: 'string' } },
      emirate: { type: 'string' },
      neighborhood: { type: 'string' },
      budgetMentioned: { type: 'number' },
      urgency: { type: 'string' },
      propertyType: { type: 'string' }
    }
  }
}
```

---

### Phase 2: Knowledge Base Expansion (Priority: High)

#### 2.1 New Article Structure
**Files to create:**
- `server/src/data/knowledge-base/index.ts`
- `server/src/data/knowledge-base/articles/*.ts` (40+ articles)
- `server/src/types/knowledge.types.ts`

**Enhanced Schema:**
```typescript
interface KnowledgeArticle {
  id: string;
  category: 'regulations' | 'best_practices' | 'materials' | 'maintenance' | 'costs' | 'seasonal';
  topic: string;
  summary: string;
  content: string;
  tags: string[];
  keywords: string[];
  emirateSpecific?: string[];
  propertyTypes?: string[];
  seasonalRelevance?: string;
  relatedServices: string[];
  lastUpdated: Date;
}
```

#### 2.2 New Articles (Start with 15-20 high-value)
**Phase 1 - Core Articles (15-20):**
- Dubai/Abu Dhabi permit processes (regulations)
- Tenant renovation rights (regulations)
- Hiring contractors guide (best practices)
- Summer renovation survival (best practices)
- Top 5 service categories overview (plumbing, electrical, HVAC, painting, renovation)
- Common renovation mistakes (best practices)
- Emirate cost comparison (costs)
- Hidden costs guide (costs)

**Phase 2 - Expand based on user queries and pro feedback**

#### 2.3 Quote/Invoice Learning System (NEW)
**Concept:** Learn from real professional quotations and invoices to improve:
- Budget estimation accuracy
- Understanding of service components/line items
- Regional pricing variations
- Material cost benchmarks

**Implementation:**
- Create submission portal for professionals to share anonymized quotes
- Parse quote line items into structured data:
  ```typescript
  interface QuoteLineItem {
    serviceCategory: string;
    itemType: 'labor' | 'material' | 'permit' | 'other';
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    emirate: string;
    dateSubmitted: Date;
  }
  ```
- Aggregate data to improve budget_estimator tool accuracy
- Feed patterns into knowledge base articles
- Track price trends over time

#### 2.4 Knowledge Base Storage (Updated based on Insyte patterns)

**Recommended: Hybrid TOML + Weaviate**

**Why TOML for source files:**
- Human-readable, easy for team to edit
- No JSON escaping issues for long content
- Multi-line strings natural
- Version controlled with code

**Why Weaviate for search:**
- Semantic search (LLM-friendly)
- Find related articles even with different wording
- Already proven in Insyte project
- Scales to 1000+ articles

**Article Format (TOML):**
```toml
# server/src/data/knowledge-base/articles/regulations/dubai-permits.toml
[article]
id = "kb_reg_001"
category = "regulations"
topic = "Building Permits in Dubai"
summary = "Complete guide to Dubai Municipality permit process"
emirates = ["dubai"]
services = ["renovation", "plumbing", "electrical"]

[content]
text = """
Dubai Municipality requires building permits for structural modifications...

## Process
1. Submit application online
2. Pay fees (AED 500-2000)
...
"""

[metadata]
tags = ["permits", "dubai", "municipality", "regulations"]
keywords = ["DM", "approval", "NOC"]
last_updated = 2024-11-26
version = 1
```

**Implementation:**
1. Store articles as `.toml` files in `server/src/data/knowledge-base/articles/`
2. On server start, parse TOML and index into Weaviate
3. Search tool queries Weaviate for semantic matches
4. Falls back to keyword search if Weaviate unavailable

**Files to create:**
- `server/src/services/weaviate.service.ts` - Weaviate client (reference Insyte pattern)
- `server/src/services/tools/knowledge-base.service.ts` - Rewrite with Weaviate integration
- `server/src/data/knowledge-base/articles/**/*.toml` - Article files

**Weaviate Schema:**
```typescript
{
  class: 'HomeGPTKnowledge',
  vectorizer: 'text2vec-transformers',
  properties: [
    { name: 'articleId', dataType: ['string'] },
    { name: 'category', dataType: ['string'] },
    { name: 'topic', dataType: ['string'] },
    { name: 'content', dataType: ['text'] },  // Vectorized
    { name: 'emirates', dataType: ['string[]'] },
    { name: 'services', dataType: ['string[]'] },
    { name: 'tags', dataType: ['string[]'] },
  ]
}
```

#### 2.5 Weaviate Infrastructure Setup

**Docker Compose Addition:**
```yaml
# Add to docker-compose.dev.yml
weaviate:
  image: semitechnologies/weaviate:1.22.4
  ports:
    - "8080:8080"
  environment:
    QUERY_DEFAULTS_LIMIT: 25
    AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
    PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
    DEFAULT_VECTORIZER_MODULE: 'text2vec-transformers'
    ENABLE_MODULES: 'text2vec-transformers'
    TRANSFORMERS_INFERENCE_API: 'http://t2v-transformers:8080'
  volumes:
    - weaviate_data:/var/lib/weaviate
  depends_on:
    - t2v-transformers

t2v-transformers:
  image: semitechnologies/transformers-inference:sentence-transformers-multi-qa-MiniLM-L6-cos-v1
  environment:
    ENABLE_CUDA: '0'  # Set to 1 if GPU available

volumes:
  weaviate_data:
```

**Environment Variables:**
```bash
# Add to server/.env
WEAVIATE_HOST=localhost
WEAVIATE_PORT=8080
WEAVIATE_SCHEME=http
```

**Weaviate Service (reference Insyte pattern):**
```typescript
// server/src/services/weaviate.service.ts
import weaviate, { WeaviateClient } from 'weaviate-ts-client';

class WeaviateService {
  private client: WeaviateClient;

  async initialize() {
    this.client = weaviate.client({
      scheme: process.env.WEAVIATE_SCHEME,
      host: `${process.env.WEAVIATE_HOST}:${process.env.WEAVIATE_PORT}`,
    });
    await this.createSchema();
  }

  async createSchema() {
    // Create HomeGPTKnowledge class if not exists
  }

  async indexArticle(article: KnowledgeArticle) {
    // Add article to Weaviate with vector embedding
  }

  async semanticSearch(query: string, filters?: SearchFilters) {
    // Search with nearText and optional filters
  }
}
```

#### 2.6 Patterns from Insyte to Adopt

**Tool Registry with Zod Validation:**
- Upgrade current tools.registry.ts to use Zod schemas
- Add Redis caching for tool results
- Automatic parameter validation

**LLM Factory Pattern (Future):**
- Abstract LLM provider for easy switching
- Support both Anthropic and OpenAI
- Retry logic and timeout handling built-in

**Agent Base Class (Future):**
- Create BaseAgent for consistent lifecycle
- Specialist agents inherit common behavior
- Centralized metrics and error handling

---

### Phase 3: Conversational Data Collection (Priority: Medium)

#### 3.1 Questionnaire-to-Conversation Mapping
**Files to create:**
- `server/src/services/ai/questionnaire-mapper.service.ts`
- `server/src/services/ai/extraction-rules/*.ts` (per service)

**Approach:**
- Map form questions to natural language patterns
- Extract structured data from free-form conversation
- Track confidence level per extracted field

**Example Mapping (Plumbing):**
| Form Question | Natural Pattern | Extraction |
|--------------|-----------------|------------|
| "Type of work?" | "leak", "clog", "install" | leak_repair, drain_cleaning, fixture_install |
| "Emergency?" | "flooding", "urgent", "no rush" | emergency, urgent, routine |

#### 3.2 Data Completeness Scoring
**Scoring weights:**
- Required fields (60%): title, description, category, emirate, budget, urgency
- Service answers (20%): questionnaire responses
- Optional (20%): neighborhood, property type, timeline, photos

---

### Phase 4: Frontend Enhancements (Priority: Medium)

#### 4.1 Image Upload in Chat
**Files to modify:**
- `client/components/chat/MessageInput.tsx` - Add photo button
- `client/store/chatStore.ts` - Add image state

**Components to create:**
- `client/components/chat/ImageUpload.tsx`
- `client/components/chat/ImagePreview.tsx`

#### 4.2 Professional Results Display
**Files to create:**
- `client/components/chat/ProfessionalCard.tsx`

#### 4.3 Enhanced Guest Flow
**Files to modify:**
- `client/components/chat/GuestLimitBanner.tsx` - Contextual prompts
- `client/store/chatStore.ts` - Add guestContext state

---

### Phase 5: System Prompt Updates (Priority: High)

**File:** `server/src/services/ai/system-prompts.ts`

**Add sections:**
1. **Guest Email Collection Strategy** - Natural prompts, timing guidance
2. **Conversational Data Collection** - How to ask questions naturally
3. **Professional Search Guidance** - When to recommend, how to present
4. **Image Analysis Instructions** - What to extract, how to describe
5. **Tool Chaining** - How tools work together (image → budget → pro → lead)

---

## Critical Files Summary

| File | Action | Priority |
|------|--------|----------|
| `server/src/services/ai/tools.registry.ts` | Modify - Add 4 new tools | HIGH |
| `server/src/services/ai/ai.service.ts` | Modify - Tool handlers, vision, context | HIGH |
| `server/src/services/ai/system-prompts.ts` | Modify - Add all guidance sections | HIGH |
| `server/src/services/tools/guest-lead-creator.service.ts` | Create | HIGH |
| `server/src/services/tools/professional-search.service.ts` | Create | HIGH |
| `server/src/services/tools/knowledge-base.service.ts` | Rewrite | HIGH |
| `server/src/data/knowledge-base/**` | Create - 40+ articles | HIGH |
| `server/src/sockets/chat.socket.ts` | Modify - Image handler | MEDIUM |
| `server/src/models/ChatMessage.model.ts` | Modify - Attachments | MEDIUM |
| `client/components/chat/MessageInput.tsx` | Modify - Image upload | MEDIUM |
| `client/store/chatStore.ts` | Modify - Guest/project context | MEDIUM |

---

## Implementation Order

1. **Phase 1: Core Tools**
   - Guest lead creator tool
   - Professional search tool
   - System prompt updates

2. **Phase 2: Knowledge Base**
   - New article structure
   - Write 15-20 articles
   - Enhanced search algorithm

3. **Phase 3: Image Analysis**
   - Vision API integration
   - Socket handler for images
   - Frontend image upload

4. **Phase 4: Data Enrichment**
   - Project context tool
   - Questionnaire mapping
   - Completeness scoring

5. **Phase 5: Polish**
   - Frontend UX improvements
   - Testing and refinement
   - Documentation
