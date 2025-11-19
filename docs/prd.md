# Homezy - Product Requirements Document (PRD)

## Executive Summary

**Product Name**: Homezy
**Domain**: homezy.co
**Type**: AI-First B2C Home Improvement Marketplace
**Market**: UAE
**Target Audience**: Homeowners seeking home improvement professionals and advice

Homezy is an AI-powered platform connecting UAE homeowners with verified home improvement professionals. Unlike traditional service marketplaces, Homezy leads with an intelligent chat interface powered by Claude Sonnet 4.5, providing personalized advice, project planning, and seamless professional matching. The platform combines conversational AI with a credit-based lead marketplace similar to Thumbtack, where professionals claim homeowner requests.

---

## Product Vision

Transform the home improvement experience in the UAE by making professional discovery, project planning, and expert advice accessible through a single AI-powered conversation. Homeowners get intelligent guidance from initial concept to project completion, while professionals access qualified leads and build their reputation.ca

---

## Core Value Propositions

### For Homeowners
- **AI-First Experience**: Chat with an intelligent home improvement specialist that understands UAE market, regulations, and best practices
- **Effortless Professional Discovery**: AI generates optimized lead requests that attract up to 5 qualified professionals
- **Informed Decisions**: Get AI-powered budget estimates, timelines, and project guidance before committing
- **Project Tracking**: Simple dashboard to manage projects, documents, budgets, and professional communication
- **Trust & Quality**: Work only with verified professionals with transparent ratings and reviews

### For Professionals
- **Quality Leads**: Access homeowner requests that match their expertise and service area
- **Fair Competition**: Credit-based claiming ensures up to 5 professionals per lead (no bidding wars)
- **Build Reputation**: Showcase portfolio, collect reviews, and earn verification badges
- **Flexible Commitment**: Purchase credits as needed, no subscription requirements
- **Progressive Benefits**: Enhanced verification unlocks better visibility and lower credit costs

---

## Technical Architecture

### Technology Stack

#### Frontend (Multi-Platform)

**Web Application:**
- **Framework**: Next.js 14+ with App Router (React Server Components)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+
- **State Management**: Zustand (platform-agnostic, works on React Native)
- **Form Handling**: React Hook Form + Zod validation
- **Real-time**: Socket.io client
- **HTTP Client**: Shared API client from `/shared` package

**Rationale**: Next.js App Router chosen for superior SEO capabilities (RSC, streaming, metadata API), performance optimizations, and modern React patterns. Essential for ranking in home improvement searches.

**Mobile Application (React Native - Phase 2):**
- **Framework**: React Native (Expo recommended for faster development)
- **Language**: TypeScript 5+ (shared with web)
- **Styling**: NativeWind (Tailwind for React Native) or React Native StyleSheet
- **State Management**: Zustand (same as web)
- **Navigation**: React Navigation 6
- **Form Handling**: React Hook Form + Zod validation (shared schemas)
- **Real-time**: Socket.io client (React Native compatible)
- **HTTP Client**: Shared API client from `/shared` package
- **Push Notifications**: Expo Notifications / Firebase Cloud Messaging (FCM)
- **Camera/Photos**: Expo Image Picker / React Native Image Picker
- **Offline Support**: React Query with persistence

**Code Sharing Strategy:**
- **100% Shared**: TypeScript types, Zod schemas, API client, constants, business logic utils
- **Platform-Specific**: UI components, navigation, platform APIs (camera, notifications)
- **Estimated Code Reuse**: 60-70% of client logic shared between web and mobile

#### Backend
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js + TypeScript
- **Database**: MongoDB 7+ with Mongoose ODM
- **Caching**: Redis (sessions, frequently accessed data)
- **Queue**: BullMQ (background jobs: emails, image processing, AI tasks)
- **Authentication**: JWT (access + refresh tokens, httpOnly cookies)
- **Validation**: Zod schemas shared with frontend
- **Real-time**: Socket.io

#### AI & Integrations
- **AI Model**: Anthropic Claude Sonnet 4.5 API
- **AI Capabilities**: Function calling (tools), vision (photo analysis), streaming responses
- **Payments**: Stripe Checkout (credit purchases only - no marketplace payments in MVP)
- **File Storage**: Cloudinary (images, documents, CDN)
- **Email**: Brevo/SendInBlue (transactional emails, notifications)
- **OAuth**: Google OAuth 2.0
- **Maps**: Google Maps API (service area selection, location matching)

#### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Hosting**: TBD (AWS/DigitalOcean/Vercel+Railway)
- **Monitoring**: TBD (Sentry for errors, DataDog/New Relic for performance)
- **Environment**: Development, Staging, Production

### Architecture Patterns

#### Monorepo Structure (Mobile-First Architecture)
```
homezy/
├── client/                 # Next.js web application
│   ├── app/               # App Router pages & layouts
│   │   ├── (auth)/       # Auth routes group
│   │   ├── (dashboard)/  # Dashboard routes group
│   │   ├── api/          # API routes (if needed)
│   │   └── layout.tsx    # Root layout
│   ├── components/        # Web-specific React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── features/     # Feature-specific components
│   │   └── layouts/      # Layout components
│   ├── lib/              # Web-specific utilities
│   ├── hooks/            # Web-specific React hooks
│   ├── styles/           # Tailwind styles
│   └── public/           # Static assets
│
├── mobile/                # React Native mobile app (Phase 2)
│   ├── src/
│   │   ├── screens/      # Mobile screens
│   │   ├── components/   # Mobile-specific components
│   │   ├── navigation/   # React Navigation setup
│   │   ├── hooks/        # Mobile-specific hooks
│   │   └── lib/          # Mobile-specific utilities
│   ├── app.json          # Expo config (if using Expo)
│   ├── package.json
│   └── tsconfig.json
│
├── server/                # Express backend API
│   ├── src/
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Business logic controllers
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── services/     # External services (AI, email, file upload, payments)
│   │   ├── utils/        # Server-specific helpers
│   │   ├── config/       # Configuration (DB, Redis, env)
│   │   └── index.ts      # Server entry point
│   ├── tests/            # Backend tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                # Shared code between web, mobile, and server
│   ├── types/            # TypeScript interfaces & types
│   │   ├── user.types.ts
│   │   ├── lead.types.ts
│   │   ├── project.types.ts
│   │   ├── api.types.ts  # API request/response types
│   │   └── index.ts
│   ├── schemas/          # Zod validation schemas
│   │   ├── user.schema.ts
│   │   ├── lead.schema.ts
│   │   ├── auth.schema.ts
│   │   └── index.ts
│   ├── api/              # API client (platform-agnostic)
│   │   ├── client.ts     # Base API client (fetch wrapper)
│   │   ├── endpoints/    # Type-safe endpoint functions
│   │   │   ├── auth.ts
│   │   │   ├── leads.ts
│   │   │   ├── professionals.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── constants/        # Shared constants
│   │   ├── categories.ts  # Service categories
│   │   ├── config.ts      # App config constants
│   │   ├── routes.ts      # API routes constants
│   │   └── index.ts
│   ├── utils/            # Shared utility functions
│   │   ├── formatting.ts  # Date, currency formatting
│   │   ├── validation.ts  # Helper validators
│   │   ├── calculations.ts # Credit calculations, etc.
│   │   └── index.ts
│   ├── hooks/            # Shared React hooks (work on web & mobile)
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── index.ts
│   ├── store/            # Zustand stores (shared state management)
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   └── index.ts
│   ├── package.json      # Shared package dependencies
│   └── tsconfig.json
├── docs/                 # Documentation
└── docker/              # Docker configurations
```

#### Key Technical Decisions

1. **Next.js App Router over Pages Router**
   - Better SEO with React Server Components
   - Improved performance (streaming, selective hydration)
   - Modern patterns for data fetching and caching
   - Native metadata API for dynamic SEO

2. **MongoDB over PostgreSQL**
   - Flexible schema for evolving features
   - Embedded documents reduce joins (project with milestones, user with profiles)
   - Horizontal scaling for high read loads
   - Rich querying for location-based searches

3. **JWT with Refresh Tokens**
   - Stateless API for horizontal scaling
   - Short-lived access tokens (15 min) for security
   - Long-lived refresh tokens (7 days) in httpOnly cookies
   - Invalidation capability via token versioning

4. **Credits-Only Monetization (MVP)**
   - Simpler implementation (no marketplace payment flows)
   - Proven model from competitor analysis
   - Future-ready for subscription tiers or transaction fees
   - Focus on lead generation value proposition

5. **Progressive Verification**
   - Lower barrier to entry (basic verification = license + insurance)
   - Incentivizes comprehensive verification through benefits
   - Builds trust gradually
   - Admin bandwidth optimized

6. **Mobile-First API Design**
   - RESTful API designed to work seamlessly with both web and mobile
   - Shared TypeScript code (types, validation, API client) reduces duplication
   - Platform-agnostic architecture (60-70% code reuse between web and React Native)
   - Future-proof for React Native mobile app (iOS + Android simultaneous launch)

#### Mobile-First Considerations

**API Design Principles:**
- **Consistent JSON responses**: All endpoints return predictable JSON structures
- **Proper error handling**: Standardized error responses with error codes for client handling
- **Pagination**: Cursor-based pagination for infinite scroll (better for mobile)
- **File uploads**: Support both multipart/form-data (web) and base64 (mobile camera)
- **Offline-first ready**: API designed to work with React Query caching and offline support
- **Token refresh flow**: Automatic refresh token rotation works seamlessly on mobile
- **Versioning**: API versioning strategy (e.g., `/api/v1/`) for backward compatibility

**Push Notifications (Mobile):**
- User model includes `deviceTokens` array for FCM/APNS tokens
- Notification preferences stored per device
- Backend notification service abstracts email vs push (same trigger, different delivery)
- Notification queue (BullMQ) handles both email and push

**Real-Time Messaging:**
- Socket.io works on both web (browser) and React Native
- Graceful fallback to polling if WebSocket unavailable (mobile networks)
- Connection state management (handle app backgrounding on mobile)

**File Handling:**
- Camera capture support (mobile uploads photos directly from camera)
- Image compression before upload (mobile bandwidth consideration)
- Chunked uploads for large files (resume on network failure)
- CDN delivery optimized for mobile (Cloudinary automatic format selection)

**Authentication Flow:**
- JWT in AsyncStorage (React Native) vs httpOnly cookies (web)
- Biometric authentication support (Face ID, Touch ID via Expo SecureStore)
- Refresh token rotation on both platforms

**Shared Code Strategy:**
```typescript
// Example: shared/api/endpoints/auth.ts works on both platforms
import { apiClient } from '../client'; // Platform-agnostic fetch wrapper
import { LoginSchema } from '../../schemas/auth.schema';
import type { AuthResponse } from '../../types/api.types';

export const authAPI = {
  login: async (credentials: LoginSchema): Promise<AuthResponse> => {
    return apiClient.post('/auth/login', credentials);
  },
  // Web and mobile both use this same function
};
```

**Platform-Specific Implementations:**
- Web: httpOnly cookies for tokens
- Mobile: AsyncStorage/SecureStore for tokens
- API client handles platform differences transparently

---

## User Roles & Permissions

### 1. Guest (Unauthenticated)
**Can:**
- View landing page with AI chat demo
- Browse public professional profiles (limited)
- View service categories
- Read public content/guides (AI-generated)
- Sign up / Sign in

**Cannot:**
- Use full AI chat
- Submit lead requests
- View professional contact info
- Access messaging

### 2. Homeowner (Authenticated)
**Can:**
- Full access to AI chat specialist
- Create and manage home improvement projects
- Submit lead requests to marketplace
- Receive and compare professional quotes (up to 5)
- Message professionals
- Upload project photos and documents
- Track project progress, budget, timeline
- Rate and review professionals
- Save favorite professionals
- Schedule appointments
- Receive notifications (email, in-app)

**Cannot:**
- Claim leads (that's for professionals)
- Access professional dashboard
- Purchase credits

### 3. Professional - Pending Verification
**Can:**
- Complete profile setup
- Upload verification documents (license, insurance)
- Upload portfolio photos
- Define service categories and areas
- View profile preview

**Cannot:**
- Claim leads from marketplace
- Receive quotes requests
- Purchase credits
- Message homeowners (until verified)

### 4. Professional - Basic Verified ✓
**Verification Requirements:**
- Valid business/trade license
- Insurance certificate (liability coverage)
- Admin approval

**Can:**
- Browse lead marketplace
- Purchase credit packages
- Claim leads (spend credits)
- Submit quotes on claimed leads
- Message homeowners
- Receive and manage reviews
- Access professional dashboard
- Update availability calendar
- View basic analytics

**Cannot:**
- Access comprehensive verification benefits

**Limitations:**
- Standard credit costs
- Standard lead visibility
- No premium badges

### 5. Professional - Comprehensive Verified ✓✓
**Additional Requirements Beyond Basic:**
- Background check clearance
- Portfolio with minimum 10 project photos
- 2+ professional references
- Service area mapping completed
- Average 4+ star rating (after first 5 reviews)

**Benefits Over Basic:**
- **15% lower credit costs** on lead claims
- **Priority placement** in search results
- **"Premium Verified" badge** on profile
- **Featured in category pages**
- **Enhanced profile** (video intro, detailed bio)
- **Advanced analytics** (conversion rates, lead value)
- **Early lead access** (24-hour head start on new leads)

### 6. Admin
**Can:**
- Review and approve/reject professional verification (basic & comprehensive)
- Moderate lead requests (flag inappropriate, spam)
- Manage service categories and subcategories
- View platform analytics dashboard
- Manage credit packages and pricing
- Review and moderate user reviews
- Handle support tickets and disputes
- Access audit logs
- Manage user accounts (suspend, delete, edit)
- Configure platform settings (VAT rate, platform fees, credit pricing)
- Send platform announcements
- Export data and reports

**Special Access:**
- View all user data
- Access all conversations (for moderation)
- Override verification status
- Refund credits (manual)
- Impersonate users (for debugging)

### Role Switching
- Users can be both Homeowner and Professional (separate profiles, role toggle in UI)
- Role-specific dashboards and navigation
- Session maintains current active role

---

## Core Features & User Flows

### 1. AI Chat Interface (Primary Entry Point)

#### Overview
The AI chat is the core differentiator. Powered by Claude Sonnet 4.5 with function calling, it acts as an intelligent home improvement specialist that guides homeowners from initial questions to completed projects.

#### AI Agent Capabilities (Function Calling Tools)

1. **`create_project`**: Creates a new home improvement project
   - Parameters: title, description, category, estimated_budget, desired_timeline
   - Returns: project ID and summary

2. **`search_professionals`**: Searches for professionals
   - Parameters: category, location (emirate/neighborhood), max_budget, rating_min, availability
   - Returns: List of matching professionals with ratings, response time, pricing range

3. **`estimate_budget`**: Generates budget estimate for project
   - Parameters: project_type, scope_description, materials_quality (economy/standard/premium)
   - Returns: Breakdown by labor, materials, permits, contingency (UAE market data)

4. **`estimate_timeline`**: Generates realistic timeline
   - Parameters: project_type, scope_description, urgency
   - Returns: Phase breakdown with durations, considerations (UAE weather, permits)

5. **`create_lead_form`**: Generates optimized lead request
   - Parameters: project details, budget, timeline, requirements
   - Returns: Structured lead form for marketplace posting

6. **`analyze_project_photo`**: Analyzes uploaded photos
   - Parameters: image_url, analysis_type (damage_assessment/before_state/material_identification)
   - Returns: Detailed analysis with recommendations

7. **`get_regulations`**: UAE building codes and regulations
   - Parameters: project_type, location
   - Returns: Relevant regulations, permit requirements, compliance notes

8. **`suggest_next_steps`**: Proactive suggestions based on project state
   - Parameters: project_id
   - Returns: Actionable recommendations

9. **`generate_project_report`**: Creates comprehensive project report
   - Parameters: project_id
   - Returns: PDF-ready report with timeline, budget, photos, milestones

10. **`search_knowledge_base`**: Searches curated home improvement content
    - Parameters: query
    - Returns: Relevant guides, tips, best practices

#### Chat Features
- **Persistent Conversations**: All chats saved per homeowner
- **Context Awareness**: AI remembers previous conversations, active projects
- **Streaming Responses**: Real-time token streaming for better UX
- **Multi-turn Conversations**: Follow-up questions, clarifications
- **Photo Upload in Chat**: Drag-drop or paste images for AI analysis
- **Conversation History**: Searchable history with timestamps
- **Suggested Prompts**: Quick-start prompts for common scenarios
- **Voice Input**: (Future) Speech-to-text for queries

#### Chat UI/UX
- **Landing Page**: Full-screen chat interface with welcome message
- **Chat Bubble**: Always-accessible floating button on other pages
- **Mobile Optimized**: Responsive design, native-like experience
- **Loading States**: Typing indicators, skeleton loaders
- **Error Handling**: Graceful fallbacks, retry mechanisms
- **Export Chat**: Download conversation history

### 2. Lead Request System (Marketplace Core)

#### Lead Creation Flow
1. **Trigger**: Homeowner creates via AI chat or manual form
2. **AI Assistance**: AI suggests optimal project details, budget brackets, timeline
3. **Form Fields**:
   - **Project Category**: Select from 20+ service types
   - **Title**: Auto-generated or custom
   - **Description**: Detailed requirements (AI helps structure)
   - **Location**: Emirate + neighborhood + address (optional)
   - **Budget Range**: 6 value brackets (AED 500-1K, 1K-5K, 5K-15K, 15K-50K, 50K-150K, 150K+)
   - **Timeline**: Urgency (Emergency <24h, Urgent <1 week, Flexible 1-4 weeks, Planning >1 month)
   - **Attachments**: Photos, documents, sketches (up to 10 files)
   - **Preferences**: Professional requirements (verified, rating, response time)
   - **Visibility**: Open (marketplace) vs Direct (to specific professional)
4. **Review**: AI shows lead summary, estimated responses, credit cost for professionals
5. **Submit**: Lead posted to marketplace

#### Credit-Based Claiming System

**Credit Costs by Value Bracket:**
| Budget Range | Credits to Claim | Rationale |
|-------------|-----------------|-----------|
| AED 500-1K | 5 credits | Small jobs, lower value |
| AED 1K-5K | 10 credits | Standard projects |
| AED 5K-15K | 20 credits | Medium renovations |
| AED 15K-50K | 40 credits | Large projects |
| AED 50K-150K | 75 credits | Major renovations |
| AED 150K+ | 125 credits | Luxury/commercial |

**Emergency Multiplier**: 1.5x credits for leads marked "Emergency <24h"

**Comprehensive Verified Discount**: 15% fewer credits (rounded down)

**Credit Packages:**
| Package | Credits | Price (AED) | Per Credit Cost | Bonus |
|---------|---------|-------------|-----------------|--------|
| Starter | 50 | 250 | 5.00 | - |
| Professional | 150 | 600 | 4.00 | +10 credits |
| Business | 400 | 1,400 | 3.50 | +40 credits |
| Enterprise | 1000 | 3,000 | 3.00 | +150 credits |

**Purchase**: Stripe Checkout integration, instant credit top-up

#### Lead Marketplace
- **Professional View**: Browse all open leads matching service categories
- **Filters**: Category, location, budget, urgency, posted date
- **Sort**: Newest first, budget (high-low), urgency, ending soon
- **Lead Card**: Title, category, location, budget range, urgency, time posted, credits to claim, claims remaining (out of 5)
- **Lead Details**: Full description, photos, homeowner preferences, homeowner rating (if repeat user)
- **Claim Action**: "Claim for X credits" button (disabled if no credits or 5/5 claimed)
- **Countdown**: Leads expire after 7 days if unclaimed

#### Claiming & Quote Submission
1. **Professional Claims Lead**: Spends credits, gets full homeowner details (name, contact, address)
2. **Notification**: Homeowner notified "3 professionals have claimed your request"
3. **Quote Submission Form**:
   - **Timeline Estimate**: Start date + completion date
   - **Budget Quote**: Itemized breakdown (labor, materials, permits, other)
   - **Approach**: Description of how they'll complete project
   - **Warranty**: Warranty terms offered
   - **Attachments**: Portfolio samples, references, certifications
   - **Questions**: Request clarifications from homeowner
4. **Submit Quote**: Homeowner receives notification

#### Homeowner Quote Review
- **Quote Comparison View**: Side-by-side comparison of up to 5 quotes
- **Comparison Matrix**: Timeline, total cost, rating, response time, verification status
- **Details**: Full quote with itemized costs
- **Professional Profile**: One-click view profile, portfolio, reviews
- **Actions**: Message professional, Accept quote, Decline quote
- **AI Assist**: "Ask AI to analyze quotes" - AI compares value, flags red flags, suggests questions

#### Lead States
- **Open**: Accepting claims (0-4 claimed)
- **Full**: 5 professionals claimed, no more claims
- **Quoted**: Homeowner received 1+ quotes
- **Accepted**: Homeowner accepted a quote (lead closes for others)
- **Expired**: 7 days passed, no claims or no quotes submitted
- **Cancelled**: Homeowner cancelled request

### 3. Professional Profiles & Verification

#### Profile Sections

**Basic Information:**
- Business name
- Owner/contact name
- Profile photo & cover photo
- Tagline (one-liner)
- About/bio (500 chars)
- Service categories (multi-select from 20+)
- Business type (Sole Proprietor, LLC, Corporation)
- Years in business
- Team size
- Languages spoken

**Service Areas:**
- Emirates served (multi-select)
- Neighborhoods within emirates (map selection)
- Service radius (km from business address)
- Willing to travel outside area (yes/no, extra cost)

**Portfolio:**
- Project photos (up to 50)
- Before/after pairs
- Project descriptions (title, scope, completion date)
- Featured projects (pin top 6)

**Verification & Trust:**
- Verification badges (Basic ✓ / Comprehensive ✓✓)
- License number (verified by admin)
- Insurance details (verified by admin)
- Background check status (comprehensive only)
- Member since date
- Total projects completed (self-reported, future: verified)
- Response time (calculated: avg time to respond to messages)
- Quote acceptance rate (%)

**Pricing & Availability:**
- Typical hourly rate range (optional)
- Typical project minimums (optional)
- Availability calendar (integrated)
- Typical response time (hours/days)
- Payment methods accepted (cash, bank transfer, card - future)

**Reviews & Ratings:**
- Overall rating (1-5 stars, avg of all reviews)
- Total reviews count
- Rating breakdown by category (Professionalism, Quality, Timeliness, Value, Communication)
- Recent reviews (with homeowner responses)
- Filter reviews by project type

**Credentials:**
- Certifications (upload certificates)
- Association memberships
- Specializations
- Awards

#### Verification Workflows

**Basic Verification (Required to Claim Leads):**
1. Professional submits:
   - Trade/business license (PDF or image)
   - Insurance certificate (liability, min AED 500K coverage)
   - Business address proof
2. Admin reviews (48-hour SLA):
   - Verifies license authenticity (cross-check with government DB if API available)
   - Checks insurance validity and coverage amount
   - Validates business address
3. Admin decision:
   - **Approve**: Professional gets Basic Verified ✓ badge, can claim leads
   - **Reject with Reason**: Professional can resubmit corrected documents
4. Notification sent (email + in-app)

**Comprehensive Verification (Optional, Unlocks Benefits):**
1. Professional submits (in addition to basic):
   - Background check consent + ID proof
   - Portfolio (minimum 10 photos from 5 different projects)
   - Professional references (2 minimum):
     - Reference contact info
     - Project details
     - Admin may contact for verification
   - Service area mapping (completed via map UI)
2. Background check initiated (third-party service integration)
3. Admin reviews portfolio quality and references
4. Requirements:
   - Background check clear
   - Portfolio meets quality standards
   - References verified (at least 1 contacted)
   - Service areas defined
   - Average rating 4+ stars (if has reviews)
5. Admin decision: Approve for Comprehensive ✓✓
6. Benefits activated immediately

#### Professional Dashboard

**Overview Page:**
- Credit balance (prominent)
- Active leads (claimed, awaiting quote submission)
- Pending quotes (submitted, awaiting homeowner response)
- Accepted projects (in progress)
- Unread messages count
- Weekly stats: leads claimed, quotes sent, acceptance rate
- Quick actions: Buy credits, Browse leads, View calendar

**Leads Tab:**
- Browse marketplace
- Filter & search
- My claimed leads (with submission deadline)
- Archived leads

**Quotes Tab:**
- Pending quotes (submitted, waiting)
- Accepted quotes (convert to project)
- Declined quotes (with reason if provided)
- Draft quotes (saved, not submitted)

**Projects Tab:**
- Active projects (in progress)
- Completed projects
- Project details: milestones, timeline, budget, messages, documents

**Messages Tab:**
- Conversations with homeowners
- Unread count
- Search conversations
- Quick replies

**Calendar Tab:**
- Availability management
- Scheduled appointments
- Sync with external calendars (Google Calendar - future)

**Credits Tab:**
- Current balance
- Purchase credits (Stripe Checkout)
- Transaction history (claims, refunds)
- Usage analytics (credits spent by month, category)

**Profile Tab:**
- Edit all profile sections
- Verification status & upload documents
- Preview public profile

**Analytics Tab:**
- Lead claim to quote conversion rate
- Quote to project conversion rate
- Average project value
- Total earnings (self-reported milestone payments - future)
- Response time trends
- Review ratings over time

### 4. Service Categories (Comprehensive - 20+)

**Categories at Launch:**

1. **Plumbing**
   - Emergency repairs, pipe installation, leak detection, bathroom fixtures, water heaters, drainage

2. **Electrical**
   - Wiring, lighting installation, panel upgrades, fault finding, emergency repairs, smart home integration

3. **HVAC (Air Conditioning)**
   - AC installation, AC repair, duct cleaning, maintenance contracts, ventilation

4. **General Contracting**
   - Full renovations, additions, structural work, project management

5. **Roofing**
   - Roof repair, replacement, waterproofing, inspection, gutter installation

6. **Painting & Wallpaper**
   - Interior painting, exterior painting, wallpaper installation, decorative finishes

7. **Flooring**
   - Tile installation, marble, hardwood, laminate, vinyl, carpet, floor refinishing

8. **Kitchen Remodeling**
   - Cabinet installation, countertops, backsplash, appliance installation, full kitchen renovation

9. **Bathroom Remodeling**
   - Shower/tub installation, vanity, tiling, waterproofing, full bathroom renovation

10. **Carpentry**
    - Custom furniture, built-ins, trim/molding, door installation, repairs

11. **Masonry & Tiling**
    - Brickwork, stonework, tile installation, concrete work

12. **Landscaping & Garden**
    - Garden design, lawn installation, irrigation, tree services, hardscaping, maintenance

13. **Windows & Doors**
    - Window replacement, door installation, glass work, frames, security doors

14. **Interior Design**
    - Space planning, furniture selection, color consultation, full design services

15. **Architecture**
    - Design plans, structural design, permits, project planning

16. **Waterproofing & Insulation**
    - Basement waterproofing, roof waterproofing, thermal insulation, soundproofing

17. **Smart Home & Security**
    - Security systems, cameras, smart lighting, home automation, access control

18. **Pest Control**
    - Termite treatment, rodent control, insect control, prevention, fumigation

19. **Cleaning Services**
    - Deep cleaning, post-construction cleaning, regular maintenance, specialized cleaning

20. **Pool & Spa**
    - Pool installation, pool maintenance, repair, cleaning, equipment

21. **Appliance Repair & Installation**
    - Refrigerator, washer/dryer, dishwasher, oven repair and installation

22. **Handyman Services**
    - General repairs, mounting, assembly, minor electrical/plumbing, odd jobs

**Category Structure:**
- Each category has subcategories for specific services
- Professionals select multiple categories/subcategories
- Leads tagged with primary category (searchable/filterable)

### 5. Project Management Tools (Basic Tracking)

#### Project Dashboard (Homeowner View)

**Project Card:**
- Project title & category
- Status badge (Planning, In Progress, Completed)
- Progress bar (% complete based on milestones)
- Budget: AED X,XXX spent / AED Y,YYY estimated
- Timeline: Start date - Est. completion date
- Assigned professional (if accepted quote)
- Last activity timestamp
- Quick actions: View, Message, Add photo, Mark complete

**Project Details Page:**

**Overview Section:**
- Project description
- Category & subcategories
- Location
- Status with timeline
- Created date

**Budget Tracker:**
- Estimated budget (from original lead)
- Accepted quote amount (if quote accepted)
- Actual spent (manual entry or milestone payments - future)
- Budget variance (over/under)
- Cost breakdown chart (labor, materials, permits, other)
- Add expense entries (description, amount, category, receipt upload)

**Timeline:**
- Visual timeline (Gantt-style or simple linear)
- Milestones (customizable):
  - Default milestones by project type
  - Custom milestones
  - Milestone status: Not started, In progress, Completed, Delayed
  - Target date vs actual completion date
- Project start and end dates
- Delay warnings (if milestones overdue)

**Documents:**
- Organized file storage
- Categories: Contracts, Invoices, Permits, Receipts, Photos, Other
- Upload (drag-drop, max 10MB per file)
- Preview (images, PDFs in-browser)
- Download
- Professional can also upload (shared space)

**Photos:**
- Before/After galleries
- Progress photos (chronological)
- Upload with timestamps
- Tag photos to milestones
- Comparison slider (before/after)

**Communication Hub:**
- Integrated messaging with assigned professional
- Project-specific chat (separate from lead discussion)
- Share files in chat
- Pin important messages

**Activity Log:**
- Chronological log of all project events
- Milestone completions, budget changes, documents added, messages sent
- Filterable by type

**Actions:**
- Edit project details
- Add/edit milestones
- Mark project complete
- Leave review (when completed)
- Archive project

#### Professional View (Project Management)

**Accepted Projects List:**
- Similar cards as homeowner view
- Filterable by status, category, start date
- Sort by deadline, budget, created date

**Project Details:**
- All same sections as homeowner
- Additional: Quote details (original quote submitted)
- Upload deliverables (completion certificates, photos)
- Update milestone status
- Request milestone payments (future feature)

#### AI Project Assistance

**AI Suggestions:**
- "Your Kitchen Renovation project is 50% over budget. AI suggests reviewing material choices or adjusting scope."
- "Electrical Installation milestone is delayed by 5 days. AI recommends contacting your professional."
- "Based on similar projects, you may need a permit for this renovation. AI suggests checking with your professional."

**AI-Generated Timeline:**
- When creating project, AI suggests realistic timeline based on:
  - Project type and scope
  - UAE market data (typical durations)
  - Season/weather considerations
  - Permit requirements

**AI Budget Estimates:**
- AI provides budget breakdown when project created
- Compares accepted quote to market rates
- Flags if quote seems unusually high/low

### 6. Messaging & Real-Time Communication

#### System Architecture
- Socket.io for real-time messaging
- Fallback to polling if WebSocket unavailable
- Message persistence in MongoDB `messages` collection
- Redis pub/sub for multi-server scaling (future)

#### Conversation Features

**Message Types:**
- Text messages (markdown support)
- File attachments (images, PDFs, up to 5MB)
- Quick replies (predefined responses for professionals)
- System messages (quote submitted, appointment scheduled)

**Real-Time Features:**
- Typing indicators ("John is typing...")
- Read receipts (delivered, read timestamps)
- Online/offline status
- Presence (last seen)
- Push notifications (desktop, mobile - future)

**Conversation Management:**
- Search within conversation
- Archive conversations
- Mute notifications per conversation
- Star/favorite conversations
- Filter: All, Unread, Archived
- Sort: Recent activity, Unread first, Alphabetical

**Message UI/UX:**
- Chat bubble design (modern, clean)
- Timestamp on hover
- Edit message (within 5 min of sending)
- Delete message (remove for both parties - within 5 min)
- React with emojis (optional, disabled by default for professional tone)
- Quote/reply to specific message
- Image preview lightbox
- PDF preview in-browser
- Voice messages (future)

#### Notification System

**Email Notifications (Brevo):**

Homeowner receives email for:
- New professional claimed their lead (batched: "3 professionals interested")
- New quote received (individual email per quote)
- Professional sent message
- Milestone completed (by professional)
- Review request (after project completion)

Professional receives email for:
- Lead claim successful (with homeowner contact)
- Homeowner sent message
- Quote accepted/declined
- New review received
- Credit balance low (< 10 credits)
- New lead matching their categories (optional, digest)

**In-App Notifications:**
- Bell icon with unread count
- Notification dropdown with:
  - Avatar/icon
  - Message preview
  - Timestamp (relative: "2 min ago")
  - Unread indicator (dot)
  - Click to navigate to relevant page
- Mark as read/unread
- Mark all as read
- Notification types: messages, quotes, reviews, system updates
- Filter notifications by type

**Notification Preferences:**
- User settings to enable/disable each notification type
- Email vs in-app toggle
- Digest options (instant, hourly, daily for certain notifications)
- Do Not Disturb schedule (mute during hours)

### 7. Reviews & Trust System

#### Review Submission

**Eligibility:**
- Only homeowners who accepted a professional's quote can review
- One review per professional per project
- Review request sent after:
  - Project marked "Completed" by homeowner, OR
  - 30 days after quote acceptance (if not manually completed)

**Review Form:**
- Overall rating: 1-5 stars (required)
- Category ratings (1-5 stars each):
  - **Professionalism**: Courteous, respectful, reliable
  - **Quality of Work**: Workmanship, attention to detail
  - **Timeliness**: Started/finished on time, met deadlines
  - **Value for Money**: Fair pricing, worth the cost
  - **Communication**: Responsive, clear, kept homeowner informed
- Written review (50-500 chars, required)
- Project photos (optional, up to 5 before/after photos)
- Would recommend (Yes/No toggle)
- Completion details:
  - Did professional complete project? (Yes/No)
  - If No: What went wrong? (optional text)

**Review Display:**
- Professional profile shows:
  - Overall rating (avg of all reviews, displayed as 4.7 ★)
  - Total reviews count
  - Rating distribution (5 stars: X%, 4 stars: Y%, etc.)
  - Category ratings breakdown (avg for each category)
- Recent reviews section:
  - Reviewer name (first name + last initial: "Ahmed K.")
  - Review date
  - Star rating
  - Written review
  - Project type (category)
  - Photos (if uploaded)
  - Professional response (if replied)
  - Helpful votes (future: other users can vote helpful)

**Professional Response:**
- Professionals can respond to reviews (one response per review)
- Response displayed below review
- Encourages professionalism (no abuse/retaliation)
- Response timestamp

**Review Moderation:**
- Admin can flag reviews for moderation
- Reasons: Inappropriate language, false claims, personal info, spam
- Flagged reviews hidden until reviewed
- Admin can remove reviews or keep them
- Professionals can report reviews (admin reviews report)

#### Trust Indicators

**Professional Profile Badges:**
- ✓ Basic Verified (license + insurance)
- ✓✓ Comprehensive Verified (background check + references + portfolio)
- ⭐ Top Rated (4.8+ rating, 20+ reviews)
- 🚀 Quick Responder (avg response time < 2 hours)
- 💯 High Acceptance (80%+ quote acceptance rate)
- 🏆 Years in Business (5+ years, 10+ years badges)

**Homeowner Trust Indicators:**
- Review count (if repeat user)
- Member since date
- Verified contact (email, phone)

**Platform Trust Features:**
- Verified reviews only (must have accepted quote)
- No anonymous reviews
- Review edit period (24 hours after submission)
- Professional response capability
- Transparent rating calculation
- Report abuse mechanism

### 8. Scheduling & Appointments

#### Professional Calendar

**Availability Management:**
- Weekly schedule (set available hours per day)
- Specific unavailable dates (vacations, holidays)
- Time slots (30 min, 1 hour, 2 hour blocks)
- Buffer time between appointments
- Max appointments per day limit

**Appointment Types:**
- Consultation (free initial meeting)
- Site visit (for quote preparation)
- Scheduled work (project work time)
- Follow-up (warranty, inspection)

**Calendar View:**
- Month view (overview)
- Week view (detailed)
- Day view (hourly breakdown)
- Color-coded by appointment type
- Click to view appointment details

#### Homeowner Booking Flow

**1. Request Appointment:**
- From professional profile: "Request Appointment" button
- From active project: "Schedule with [Professional]" button
- Select appointment type (Consultation, Site Visit, Other)
- Add message (what they'd like to discuss)

**2. Professional Reviews:**
- Notification of appointment request
- View homeowner details & message
- Options:
  - **Suggest Times**: Professional selects 3-5 available time slots
  - **Decline**: With reason message

**3. Homeowner Confirms:**
- Receives suggested times
- Selects preferred time
- Appointment confirmed (both calendars updated)

**4. Appointment Management:**
- Email reminders (24 hours before, 2 hours before)
- In-app notifications
- Reschedule request (other party must approve)
- Cancel appointment (with notice, reason required)
- Mark as completed
- Add notes post-appointment

**Future: Calendar Sync:**
- Sync with Google Calendar
- iCal export
- Automatic timezone handling

### 9. Search & Discovery

#### Professional Search

**Search Inputs:**
- **Text search**: Business name, keywords
- **Category**: Multi-select from 20+ categories
- **Location**: Emirate dropdown + neighborhood (autocomplete)
- **Rating**: Minimum rating (e.g., 4+ stars)
- **Verification**: Any / Basic ✓ / Comprehensive ✓✓
- **Availability**: Available this week, within 2 weeks, flexible
- **Price range**: Budget level (economy, standard, premium - based on self-reported rates)

**Sort Options:**
- Relevance (default - considers location proximity, rating, verification)
- Rating (highest first)
- Most reviewed
- Quick responders
- Newest members
- Distance (if location specified)

**Search Results:**
- Professional card:
  - Profile photo
  - Business name
  - Overall rating (stars + count)
  - Verification badges
  - Categories served
  - Location (emirate)
  - Tagline
  - Response time badge
  - "View Profile" & "Request Quote" buttons
- Pagination (20 results per page)
- Filter count (e.g., "42 professionals found")
- Map view toggle (show professionals on map - future)

**Saved Searches:**
- Save search criteria
- Get notified when new professionals match
- Manage saved searches in account settings

#### Lead Marketplace (Professional View)

**Filters:**
- **Category**: Own service categories (pre-selected), All categories
- **Location**: Emirates (multi-select), Specific neighborhoods
- **Budget**: Select bracket(s)
- **Urgency**: Emergency, Urgent, Flexible, Planning
- **Posted**: Last 24 hours, Last 3 days, Last 7 days, All time
- **Claim status**: Has slots available (< 5 claimed)

**Sort:**
- Newest first (default)
- Budget (highest first)
- Urgency (emergency first)
- Ending soon (7 day expiration)
- Fewest claims (least competition)

**Lead Card:**
- Category & urgency badges
- Title
- Location (emirate, neighborhood)
- Budget range
- Posted timestamp (relative)
- Description preview (truncated)
- Claims: "3 of 5 claimed" with visual indicator
- Credits required (with comprehensive discount shown)
- "View Details" button

**Lead Details Modal:**
- Full description
- All photos/attachments
- Homeowner preferences
- Timeline requirements
- Full location (if claimed)
- Homeowner rating (if repeat user)
- "Claim for X credits" button

**My Claimed Leads:**
- Filter claimed leads by:
  - Awaiting quote submission
  - Quote submitted (pending response)
  - Quote accepted (converted to project)
  - Quote declined
- Sort by claim date, deadline
- Deadline countdown (must submit quote within 48 hours)

### 10. SEO Optimization (Next.js App Router)

#### Metadata Strategy

**Dynamic Pages:**

**Professional Profile (`/professionals/[id]/[slug]`):**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const professional = await getProfessional(params.id);
  return {
    title: `${professional.businessName} - ${professional.categories.join(', ')} in ${professional.emirate} | Homezy`,
    description: `Hire ${professional.businessName} for ${professional.categories.join(', ')}. ${professional.rating}★ rated with ${professional.reviewCount} reviews. ${professional.tagline}`,
    keywords: [...professional.categories, professional.emirate, 'UAE', 'home improvement'],
    openGraph: {
      title: professional.businessName,
      description: professional.tagline,
      images: [professional.profilePhoto],
      type: 'profile',
    },
  };
}
```

**Category Pages (`/categories/[category]`):**
- Title: "Find [Category] Professionals in UAE | Homezy"
- Description: "Compare top-rated [category] professionals. Get free quotes, read reviews, and hire with confidence."
- Structured data: BreadcrumbList, ItemList (professionals)

**Location Pages (`/professionals/[emirate]/[category]`):**
- Title: "[Category] in [Emirate] - Top Rated Professionals | Homezy"
- Description: "Find the best [category] professionals in [Emirate]. Compare quotes from verified experts."

**AI Chat Landing:**
- Title: "Homezy - AI-Powered Home Improvement Assistant for UAE Homeowners"
- Description: "Get instant advice, project estimates, and connect with verified professionals. Your smart home improvement companion."

#### Structured Data (Schema.org)

**Professional Profile:**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "image": "profile-photo-url",
  "telephone": "contact-number",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Dubai",
    "addressCountry": "AE"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "42"
  },
  "priceRange": "$$"
}
```

**Review Markup:**
```json
{
  "@type": "Review",
  "author": {"@type": "Person", "name": "Ahmed K."},
  "datePublished": "2024-11-01",
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "reviewBody": "Excellent work..."
}
```

**Service Markup:**
```json
{
  "@type": "Service",
  "serviceType": "Plumbing",
  "provider": {"@type": "LocalBusiness", ...},
  "areaServed": "Dubai, UAE"
}
```

#### Technical SEO

**Performance:**
- Next.js Image component (automatic optimization, lazy loading)
- WebP + BlurHash placeholders
- Code splitting (automatic with App Router)
- React Server Components (reduce client JS)
- Font optimization (next/font)

**Crawlability:**
- Sitemap generation (`/sitemap.xml`)
  - Dynamic entries for all professional profiles
  - Category pages
  - Location pages
  - Static pages
- Robots.txt configuration
- Canonical URLs for all pages
- Breadcrumb navigation (UI + structured data)

**Mobile Optimization:**
- Responsive design (Tailwind mobile-first)
- Touch-friendly UI (min 44x44px tap targets)
- Fast mobile page speed
- Mobile viewport meta tags

**Content Strategy:**
- AI-generated educational content (unique per user, but cached for SEO)
- Category description pages (rich content about each service)
- Location pages with local insights
- Professional profiles encourage rich bios and detailed portfolios
- Unique URLs for all content (`/professionals/`, `/categories/`, `/locations/`)

**Social Sharing:**
- Open Graph tags (all pages)
- Twitter Card tags
- Share buttons (professional profiles, reviews)
- Social proof (review counts, ratings)

**Core Web Vitals Targets:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

---

## Security & Compliance

### Authentication & Authorization

**Password Security:**
- Bcrypt hashing (12 rounds for production)
- Min password requirements: 8 chars, 1 uppercase, 1 number, 1 special char
- Password reset via email token (expires 1 hour)
- Account lockout after 5 failed login attempts (15 min cooldown)

**JWT Security:**
- Access tokens: 15 min expiration
- Refresh tokens: 7 days expiration, stored in httpOnly, secure, sameSite cookies
- Token signing: HS256 algorithm with 256-bit secret
- Token versioning (invalidate all tokens for user if compromised)
- No sensitive data in JWT payload (only user ID, role)

**Session Security:**
- Redis for session storage (not in-memory for multi-server support)
- Session invalidation on logout
- Automatic session refresh before expiration
- Device tracking (future: notify on new device login)

**OAuth Security:**
- State parameter validation (CSRF protection)
- Nonce for replay attack prevention
- Scope limitations (only request needed permissions)
- Token storage in database (encrypted)

### Input Validation & Sanitization

**Validation Strategy:**
- Zod schemas shared between client and server
- Server-side validation (never trust client)
- Sanitize all user inputs (prevent XSS)
- Escape HTML in user-generated content
- File upload validation:
  - File type whitelist (images: jpg, png, webp; docs: pdf)
  - File size limits (5MB general, 10MB for project documents)
  - Malware scanning (ClamAV integration - future)
  - Filename sanitization

**SQL/NoSQL Injection Prevention:**
- Mongoose queries (parameterized, no string interpolation)
- Never use `$where` operator with user input
- Input type validation (ensure strings, numbers, booleans as expected)

**XSS Prevention:**
- React auto-escaping (JSX)
- `dangerouslySetInnerHTML` never used with user content
- Content Security Policy headers
- Sanitize before storing in DB (DOMPurify on server for rich text)

**CSRF Protection:**
- CSRF tokens for state-changing operations
- SameSite cookie attribute
- Origin/Referer header validation
- Double-submit cookie pattern for AJAX requests

### Data Protection

**Encryption:**
- HTTPS enforced (redirect HTTP to HTTPS)
- TLS 1.3 for transport encryption
- Sensitive data encrypted at rest:
  - User passwords (bcrypt)
  - OAuth tokens (AES-256)
  - Credit card info (never stored; Stripe tokenization)
  - Verification documents (encrypted in Cloudinary)

**PII Protection:**
- Personal data access restricted by role
- Homeowner contact info hidden until professional claims lead
- Admin access logged (audit trail)
- Data minimization (only collect necessary fields)
- Right to erasure (user can request account deletion)

**UAE Data Compliance:**
- UAE Data Protection Law compliance
- Data residency considerations (future: UAE-based servers)
- Privacy policy (clear, accessible)
- Terms of service

### Rate Limiting

**API Rate Limits:**
- General API: 100 requests/15 min per IP
- Auth endpoints: 5 login attempts/15 min per IP
- AI chat: 20 messages/min per user
- File upload: 10 uploads/hour per user
- Stripe webhooks: Verify signature, no rate limit

**Implementation:**
- Redis-backed rate limiter (ioredis + rate-limiter-flexible)
- Response headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- 429 status code when exceeded
- Exponential backoff for repeated violations

### Audit Logging

**Logged Events:**
- User registration, login, logout
- Professional verification (admin actions)
- Credit purchases and usage
- Lead creation, claiming, quote submission
- Project status changes
- Review submission and moderation
- Admin actions (user edits, deletions, system config changes)
- Failed login attempts
- Permission violations

**Log Storage:**
- MongoDB `auditLogs` collection
- Fields: timestamp, user ID, action type, resource type, resource ID, changes (before/after), IP address, user agent
- Retention: 2 years
- Admin-only access via dashboard

---

## Performance & Scalability

### Database Optimization

**MongoDB Indexing:**
```javascript
// Users
users: { email: 1 }, { "professionalProfile.categories": 1 }, { "professionalProfile.serviceAreas.emirate": 1 }

// Leads
leads: { status: 1, createdAt: -1 }, { category: 1, "location.emirate": 1 }, { "budget.bracket": 1 }

// Reviews
reviews: { professionalId: 1, createdAt: -1 }, { rating: 1 }

// Messages
messages: { conversationId: 1, createdAt: -1 }, { recipientId: 1, read: 1 }

// Compound indexes
leads: { status: 1, category: 1, "location.emirate": 1, createdAt: -1 }
```

**Query Optimization:**
- Projection (select only needed fields)
- Limit/skip for pagination (use cursor-based for large datasets)
- Avoid N+1 queries (populate efficiently, aggregate pipelines)
- Lean queries for read-only operations
- Connection pooling (default Mongoose)

### Caching Strategy (Redis)

**Cache Layers:**

1. **Session Cache:**
   - User sessions (15 min access token, 7 day refresh)
   - Cache key: `session:{userId}`

2. **Data Cache:**
   - Professional profiles (frequently viewed): 1 hour TTL
   - Service categories: 24 hours TTL
   - Credit packages: 24 hours TTL
   - Lead marketplace listings (professionals): 5 min TTL
   - Cache key pattern: `{resource}:{id}`

3. **Computed Cache:**
   - Professional rating aggregations: 1 hour TTL (invalidate on new review)
   - Search results: 10 min TTL
   - Dashboard stats: 15 min TTL

4. **Rate Limit Cache:**
   - Request counts per IP/user
   - TTL: 15 min (sliding window)

**Cache Invalidation:**
- Write-through: Update cache on data write
- On-demand: Invalidate specific keys on related updates
- TTL-based: Auto-expiration for less critical data

### Background Jobs (BullMQ)

**Job Queues:**

1. **Email Queue:**
   - Send welcome email
   - Verification approval/rejection
   - Lead claim notification
   - Quote received notification
   - Message notification (batched)
   - Review request
   - Priority: High (immediate), Normal (5 min delay), Low (1 hour delay)
   - Retry: 3 attempts with exponential backoff

2. **File Processing Queue:**
   - Image optimization (Sharp: resize, WebP conversion, BlurHash)
   - Document processing (PDF thumbnails)
   - Virus scanning (future)
   - Priority: Normal
   - Retry: 2 attempts

3. **AI Queue:**
   - Generate budget estimates (API call to Claude)
   - Analyze project photos
   - Generate project reports
   - Priority: Normal
   - Retry: 3 attempts (AI API may fail)
   - Rate limit: Respect Anthropic API limits

4. **Notification Queue:**
   - Batch digest emails (daily summaries)
   - Push notifications (future)
   - SMS notifications (future)
   - Priority: Low
   - Retry: 2 attempts

5. **Analytics Queue:**
   - Calculate professional stats (quote acceptance rate, response time)
   - Platform metrics aggregation
   - Scheduled: Daily at 2 AM
   - Retry: 1 attempt

6. **Cleanup Queue:**
   - Delete expired leads (7 days old, unclaimed)
   - Archive old messages (> 1 year)
   - Remove deleted user data (30 day grace period)
   - Scheduled: Weekly
   - Retry: 1 attempt

**Job Monitoring:**
- BullMQ board (UI for job inspection)
- Failed job alerts (admin notifications)
- Queue metrics (processing time, success rate)

### Horizontal Scaling

**Stateless API Design:**
- No in-memory session storage (use Redis)
- No local file storage (use Cloudinary)
- JWT for authentication (no server-side session state)
- Load balancer ready (NGINX or AWS ALB)

**Database Scaling:**
- MongoDB replica set (primary + 2 secondaries for read scaling)
- Read preference: `secondaryPreferred` for non-critical reads
- Sharding consideration (future, if > 10M documents)

**Redis Scaling:**
- Redis Cluster (future, if single instance insufficient)
- Separate Redis instances for cache vs sessions vs rate limiting

### CDN & Asset Delivery

**Cloudinary CDN:**
- All images served via Cloudinary CDN
- Automatic format selection (WebP for modern browsers)
- Responsive images (srcset generation)
- Lazy loading with BlurHash placeholders

**Next.js CDN:**
- Static assets (CSS, JS) cached at edge
- ISR (Incremental Static Regeneration) for professional profiles, category pages
- Revalidation strategy: On-demand revalidation on profile updates

---

## Analytics & Monitoring

### Platform Analytics (Admin Dashboard)

**User Metrics:**
- Total users (homeowners, professionals)
- New registrations (daily, weekly, monthly trend)
- Active users (DAU, WAU, MAU)
- User retention (cohort analysis)
- Churn rate

**Lead Metrics:**
- Total leads posted
- Leads by category breakdown
- Leads by budget bracket
- Average claims per lead
- Lead completion rate (5/5 claims)
- Lead-to-quote conversion rate
- Quote-to-acceptance rate

**Professional Metrics:**
- Total professionals (pending, basic verified, comprehensive verified)
- Verification approval rate
- Active professionals (claimed lead in last 30 days)
- Average response time
- Average quote acceptance rate
- Top performers (by reviews, projects)

**Credit Metrics:**
- Total credits purchased (AED revenue)
- Credits spent (by category, budget bracket)
- Average credits per professional
- Credit package popularity
- Credit balance distribution

**Revenue Metrics:**
- Gross revenue (credit sales)
- Revenue by professional tier
- Revenue trend (daily, weekly, monthly)
- Average revenue per professional

**Engagement Metrics:**
- AI chat sessions (total, per user)
- Average messages per session
- AI tool usage breakdown (which functions called most)
- Message volume (homeowner-professional)
- Average messages per lead
- Project creation rate

**Performance Metrics:**
- API response times (p50, p95, p99)
- Error rates (by endpoint)
- Uptime
- Database query performance
- Cache hit rates

### User Analytics (Professional Dashboard)

**Professional Views:**
- Profile views (daily, weekly, monthly trend)
- Search appearances (how often appeared in searches)
- Click-through rate (searches → profile views)

**Lead Performance:**
- Leads claimed
- Credits spent
- Claim-to-quote conversion (% of claims that resulted in quote submission)
- Quote-to-acceptance conversion (% of quotes accepted)
- Average quote amount

**Engagement:**
- Messages sent/received
- Response time (avg time to first response)
- Unread message rate

**Reputation:**
- Reviews received
- Average rating trend
- Review response rate
- "Would recommend" percentage

### Monitoring & Alerting

**Error Tracking:**
- Sentry integration for frontend and backend
- Error grouping and deduplication
- Source maps for readable stack traces
- User context (user ID, role) attached to errors
- Breadcrumbs (user actions leading to error)

**Performance Monitoring:**
- API endpoint latency tracking
- Database query slow log (> 100ms)
- Redis cache miss rate
- Cloudinary delivery times

**Alerts:**
- High error rate (> 1% of requests)
- API latency spike (p95 > 1s)
- Database connection issues
- Redis connection issues
- BullMQ job failure rate > 5%
- Disk space < 20%
- Memory usage > 80%
- Professional verification queue backlog (> 50 pending)
- Credit balance depleted for active professionals

**Logging:**
- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG
- Centralized logging (future: ELK stack or cloud service)
- Log retention: 30 days

---

## Testing Strategy

### Unit Tests (Jest)

**Backend:**
- Utility functions (JWT generation, password hashing, validation)
- Middleware (auth, error handling)
- Service functions (credit calculation, rating aggregation)
- Mongoose model methods
- Target: 80% code coverage

**Frontend:**
- UI components (buttons, forms, cards)
- Utility functions (date formatting, currency formatting)
- Custom hooks
- Context providers
- Target: 70% code coverage

**AI Service:**
- Tool/function definitions
- Response parsing
- Error handling
- Mock Claude API responses

### Integration Tests

**API Endpoints:**
- Auth flow (register → login → refresh → logout)
- Lead creation and claiming
- Quote submission and acceptance
- Review submission
- Messaging
- Credit purchase flow (Stripe test mode)
- Professional verification workflow

**Database:**
- CRUD operations for all models
- Query performance (indexing verification)
- Data validation (Mongoose schemas)

**Third-Party Integrations:**
- Cloudinary upload
- Brevo email sending
- Stripe checkout session creation
- Google OAuth flow

**Target:** Critical paths covered (auth, lead flow, credit purchase)

### End-to-End Tests (Playwright)

**Critical User Flows:**

1. **Homeowner Journey:**
   - Sign up → verify email → chat with AI → create lead → receive quotes → accept quote → message professional → leave review

2. **Professional Journey:**
   - Sign up → upload verification docs → get approved → purchase credits → claim lead → submit quote → get accepted → message homeowner

3. **Admin Journey:**
   - Log in → review pending professional verification → approve → view analytics dashboard

**Test Environments:**
- Desktop (Chrome, Firefox, Safari)
- Mobile (Chrome Android, Safari iOS)
- Tablet (iPad)

**Target:** 5-10 critical flows covered

### Manual Testing

**User Acceptance Testing (UAT):**
- Beta testers (homeowners and professionals)
- Feedback collection (surveys, interviews)
- Usability testing (observe first-time users)

**Regression Testing:**
- Before each major release
- Test critical flows manually
- Verify bug fixes

---

## Deployment & DevOps

### Environments

1. **Development:**
   - Local machines (Docker Compose)
   - Mock external services (Stripe test mode, Cloudinary dev account)
   - Seeded database (sample data)

2. **Staging:**
   - Cloud-hosted (mirrors production)
   - Stripe test mode
   - Real integrations (Cloudinary, Brevo sandboxes)
   - Testing with real devices
   - Load testing

3. **Production:**
   - Cloud-hosted (AWS/DigitalOcean/Vercel+Railway)
   - Live integrations
   - Monitoring and alerts enabled
   - Backups automated

### CI/CD Pipeline (GitHub Actions)

**On Pull Request:**
- Run linter (ESLint)
- Run type checking (TypeScript)
- Run unit tests
- Run integration tests
- Build check (ensure no build errors)
- Comment on PR with coverage report

**On Merge to `main`:**
- All PR checks
- Run E2E tests
- Build Docker images
- Tag with commit SHA
- Push images to registry (Docker Hub / AWS ECR)

**On Tag (`v*`):**
- Deploy to staging
- Run smoke tests on staging
- Manual approval gate
- Deploy to production (blue-green deployment)
- Run smoke tests on production
- Rollback on failure

### Infrastructure

**Containerization (Docker):**

```yaml
# docker-compose.yml (simplified)
services:
  client:
    build: ./client
    ports: ["3000:3000"]
    environment:
      - NEXT_PUBLIC_API_URL=http://server:5000

  server:
    build: ./server
    ports: ["5000:5000"]
    environment:
      - MONGODB_URI=mongodb://mongo:27017/homezy
      - REDIS_URL=redis://redis:6379
    depends_on: [mongo, redis]

  mongo:
    image: mongo:7
    volumes: [mongo-data:/data/db]

  redis:
    image: redis:7-alpine
    volumes: [redis-data:/data]

  worker:
    build: ./server
    command: npm run worker
    depends_on: [redis, mongo]
```

**Kubernetes (Future):**
- Deployment manifests for client, server, worker
- Horizontal Pod Autoscaler (based on CPU/memory)
- Persistent volumes for MongoDB, Redis
- ConfigMaps for environment variables
- Secrets for sensitive data

### Database Backups

**Automated Backups:**
- MongoDB daily backups (full dump)
- Retention: 30 days
- Stored in cloud storage (S3 or equivalent)
- Encrypted at rest

**Backup Testing:**
- Quarterly restore drills
- Verify data integrity post-restore

**Point-in-Time Recovery:**
- MongoDB oplog (if replica set)
- Restore to any point in last 24 hours

### Monitoring

**Infrastructure:**
- Server CPU, memory, disk usage
- Network I/O
- Container health checks
- Auto-restart on failure

**Application:**
- Error rates (Sentry)
- API latency (custom metrics)
- Database performance
- Queue processing times
- User activity (analytics)

**Alerting Channels:**
- Email for critical alerts
- Slack integration (future)
- PagerDuty for on-call rotation (future)

---

## Future Enhancements

### Phase 2 - Mobile Launch (3-6 months post-Web MVP)

**Priority: React Native Mobile App (iOS + Android Simultaneous Launch)**

1. **Mobile App Development:**
   - **Framework**: React Native with Expo (or bare React Native)
   - **Platforms**: iOS and Android (simultaneous launch)
   - **Code Sharing**: Leverage 60-70% shared code from `/shared` package
   - **Core Features**: All homeowner features from web app:
     - AI chat interface (optimized for mobile, voice input)
     - Lead creation and quote comparison
     - Project management dashboard
     - Real-time messaging
     - Professional search and discovery
     - Photo upload (camera integration)
     - Push notifications (FCM for Android, APNS for iOS)
     - Biometric authentication (Face ID, Touch ID)
   - **Offline Support**: React Query persistence for viewing projects and messages offline
   - **Performance**: Optimized for mobile networks (image compression, lazy loading)
   - **App Stores**: Submit to Apple App Store and Google Play Store

2. **Mobile-Specific Features:**
   - **Native Camera**: Direct photo capture for projects and lead requests
   - **Push Notifications**: Real-time alerts for new quotes, messages, project updates
   - **Biometric Auth**: Face ID/Touch ID for secure, convenient login
   - **Location Services**: Auto-detect emirate/neighborhood for better professional matching
   - **Voice Input**: Speech-to-text for AI chat (hands-free project planning)
   - **Offline Mode**: View projects, messages, and cached content without internet
   - **Share**: Share professional profiles via native share sheet

3. **Advanced AI Features:**
   - Voice conversations with AI (speech-to-text, text-to-speech)
   - AI-powered professional matching (beyond basic search, ML-based recommendations)
   - Photo analysis improvements (damage assessment, material identification)
   - Predictive project timelines (ML model based on historical platform data)
   - Smart budget optimization suggestions
   - Proactive AI notifications ("Your kitchen project should start permits now")

4. **Payment Integration (Web + Mobile):**
   - Escrow payments (homeowner pays upfront, released on milestone completion)
   - Stripe Connect for professionals (direct payouts)
   - Platform transaction fee (2.5% on completed projects)
   - In-app payments (mobile: Apple Pay, Google Pay integration)
   - Invoice generation and download

5. **Enhanced Professional Tools:**
   - Professional mobile app features (optional separate app or role toggle):
     - Claim leads on-the-go
     - Submit quotes from mobile
     - Calendar/scheduling sync
     - Quick message replies with templates
   - Desktop dashboard enhancements:
     - Advanced analytics (conversion funnels, revenue tracking)
     - Lead recommendations (AI suggests which leads to claim)

### Phase 3 (6-12 months)

1. **Advanced Project Management:**
   - Budget vs actual tracking with variance alerts
   - Gantt charts for complex projects
   - Multi-professional coordination (e.g., architect + contractor)
   - Change order management
   - Warranty tracking

2. **Multi-Market Expansion:**
   - Arabic language support (UI, AI chat)
   - Other GCC countries (Saudi Arabia, Qatar, Kuwait)
   - Multi-currency support
   - Regional professional licensing verification

3. **Marketplace Enhancements:**
   - Professional packages/bundles (e.g., "Full Kitchen Renovation" with fixed pricing)
   - Instant booking for simple tasks (like Uber for handyman)
   - Video quotes (professionals record video explanations)
   - 3D project mockups (for design services)

4. **Trust & Safety:**
   - Insurance claims integration (if project issues)
   - Dispute resolution center
   - Verified project completion (not just homeowner word)
   - Professional liability tracking

### Phase 4 (12+ months)

1. **AI Super Agent:**
   - Multi-agent system (architect agent, budget agent, timeline agent collaborate)
   - Autonomous project management (AI proactively manages projects)
   - Continuous learning from platform data
   - Integration with smart home devices (project triggers automation)

2. **Ecosystem Integrations:**
   - Material suppliers marketplace (order materials via Homezy)
   - Permit services (streamline permit applications)
   - Home insurance integration (project adds value, update coverage)
   - Real estate integration (show project history when selling home)

3. **Data & Insights:**
   - Market reports (average costs by category, neighborhood)
   - ROI calculations for home improvements
   - Resale value impact estimates
   - Trend analysis (popular projects by season, location)

---

## Success Metrics (KPIs)

### Launch Targets (First 6 Months)

**User Acquisition:**
- 1,000 homeowner signups
- 200 professional signups
- 100 verified professionals (basic)
- 20 comprehensive verified professionals

**Engagement:**
- 500 leads posted
- 60% of leads get 3+ claims
- 40% of leads result in accepted quote
- 5,000 AI chat sessions
- Average 10 messages per chat session

**Revenue:**
- AED 50,000 in credit purchases
- Average AED 250 per professional (credit purchases)

**Trust:**
- 100 reviews submitted
- Average professional rating 4.5+
- <5% disputed projects

**Platform Health:**
- 99% uptime
- <1% API error rate
- Average page load <2s
- Mobile traffic >50%

### Long-Term Vision (2 Years)

**Market Position:**
- #1 home improvement platform in UAE
- 50,000 homeowners
- 2,000 active professionals
- Coverage in all 7 Emirates

**Revenue:**
- AED 2M annual revenue from credits
- Expand to subscription tiers (30% professionals on paid plans)
- Explore transaction fees on completed projects

**Expansion:**
- Launch in Saudi Arabia, Qatar
- Mobile apps with 50K downloads
- Strategic partnerships (insurance, real estate, suppliers)

---

## Appendix

### Glossary

- **Lead**: Homeowner's project request posted to marketplace (like RFQ in Tradezy)
- **Claim**: Professional spends credits to access lead details and submit quote
- **Quote**: Professional's proposal with timeline, budget, approach
- **Project**: Active home improvement project with assigned professional
- **Milestone**: Project phase or checkpoint (e.g., Design, Demolition, Construction)
- **Credit**: Virtual currency professionals purchase to claim leads
- **Verification**: Process of validating professional's credentials (Basic or Comprehensive)
- **AI Agent**: Claude-powered assistant with tool-calling capabilities

### UAE Market Context

**Emirates:**
1. Dubai
2. Abu Dhabi
3. Sharjah
4. Ajman
5. Umm Al Quwain
6. Ras Al Khaimah
7. Fujairah

**Currency:** AED (UAE Dirham), 1 USD ≈ 3.67 AED

**VAT:** 5% (applied to credit purchases, future marketplace transactions)

**Regulations:**
- Trade licenses required for all businesses
- Professional liability insurance (minimum AED 500K recommended)
- Building permits required for structural work (varies by emirate)
- Dubai Municipality approvals for certain renovations
- Electrical/plumbing work requires licensed professionals

**Market Size:**
- ~3 million households in UAE
- Growing expat population (home improvement needs)
- Hot climate (HVAC, waterproofing critical)
- Rapid construction/renovation market

### Competitive Landscape

**Direct Competitors:**
- ServiceMarket.com (UAE-based, multi-service)
- Justmop/Justlife (cleaning + home services)
- UrbanClap/Urban Company (expanding to UAE)
- Local contractor directories

**Homezy Differentiators:**
- AI-first approach (no competitor has intelligent assistant)
- Credit-based lead claiming (vs bidding wars)
- Progressive verification (lower barrier, incentivized quality)
- Focus on homeowner education and empowerment
- Project management tools integrated
- UAE-specific AI knowledge (regulations, climate, market)

---

## Document Version

**Version:** 1.1
**Last Updated:** November 19, 2025
**Author:** Product Team
**Status:** Approved for Development

**Changelog:**
- v1.1 (Nov 19, 2025): Updated implementation status to reflect completed messaging system, monthly free credits, SEO pages, and enhanced dashboards. Updated timeline to reflect 95% completion after 2 weeks of rapid development.
- v1.0 (Nov 4, 2025): Initial PRD and project kickoff

---

## Implementation Status

### ✅ Completed (Phase 1)

#### Backend Infrastructure
- ✅ Express.js + TypeScript backend with modular structure
- ✅ MongoDB 7+ connection with Mongoose ODM
- ✅ Redis configuration (4 separate DBs: cache, sessions, rate-limiting, queues)
- ✅ Winston logger with file rotation and HTTP logging (Morgan)
- ✅ Docker Compose for local development (MongoDB, Redis, Mongo Express, Redis Commander)
- ✅ Development startup scripts (`./scripts/run-dev.sh`)
- ✅ Environment configuration with Zod validation

#### Database Models
- ✅ User model (homeowner/professional profiles, auth fields, verification status)
- ✅ Lead model (with LeadClaim sub-model)
- ✅ Quote model
- ✅ Project model (with milestones)
- ✅ Message model (chat + attachments)
- ✅ Review model (ratings + verification)
- ✅ Credit models:
  - CreditBalance (total, free credits, paid credits, lifetime stats)
  - CreditTransaction (type, amount, FIFO tracking with remainingAmount, expiry)
  - CreditPurchase (Stripe payment tracking, 6-month expiry)

#### Authentication System
- ✅ JWT authentication (access + refresh tokens)
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Token versioning for security
- ✅ Auth middleware (authenticate, authorize, optionalAuth)
- ✅ Validation middleware with Zod
- ✅ Error handling middleware with custom error classes
- ✅ Redis-backed rate limiting
- ✅ Auth API endpoints:
  - POST `/api/v1/auth/register` - User registration
  - POST `/api/v1/auth/login` - User login
  - POST `/api/v1/auth/refresh` - Token refresh
  - POST `/api/v1/auth/logout` - Logout
  - GET `/api/v1/auth/me` - Get current user

#### Frontend Infrastructure
- ✅ Next.js 14+ with App Router and TypeScript
- ✅ Tailwind CSS 4 with custom component classes
- ✅ Axios API client with request/response interceptors
- ✅ Auth service layer
- ✅ Zustand state management for auth
- ✅ React Hot Toast for notifications
- ✅ Frontend logger utility (console + future remote logging)
- ✅ Environment configuration

#### Authentication Pages
- ✅ Homepage with hero section and features (with role-based access control)
- ✅ Login page with role-based redirects
- ✅ Homeowner registration page (simplified)
- ✅ Professional registration page (with required phone, redirects to onboarding)
- ✅ Auth layout wrapper
- ✅ Real-time password validation with visual feedback
- ✅ Form validation with error handling
- ✅ Auto-redirect after authentication (role-aware)

#### Logging & Monitoring
- ✅ Backend: Enhanced error logging for validation, duplicates, and system errors
- ✅ Frontend: Comprehensive logger for API errors, auth events, user actions
- ✅ Request/response logging with Morgan
- ✅ Structured logging with Winston (error, combined, exceptions, rejections)

#### Professional Onboarding & Dashboard
- ✅ "Become a Pro" landing page with benefits and pricing
- ✅ Pro registration flow (separate route: `/auth/pro/register`)
- ✅ 5-step onboarding wizard (service selection, business basics, service area, profile photo, completion)
- ✅ Pro dashboard layout with navigation and progress banner
- ✅ Dashboard home page with stats, next steps, and market insights
- ✅ Portfolio, verification, and profile placeholder pages
- ✅ Role-based routing (pros → dashboard, homeowners → homepage)
- ✅ Auth redirect guards preventing pros/admins from accessing homepage

#### Professional Profile Management
- ✅ Pro profile endpoints (CRUD operations)
- ✅ Portfolio management (add, update, delete items)
- ✅ Featured projects management (up to 6)
- ✅ Verification document upload
- ✅ Pro search and filtering endpoint
- ✅ Public pro profile endpoint
- ✅ Validation schemas for all pro operations

#### Credit System (Phase 1 - COMPLETE)
- ✅ Enhanced database models:
  - CreditBalance (total, free credits, paid credits tracking)
  - CreditTransaction (full audit trail with FIFO tracking)
  - CreditPurchase (Stripe payment records with 6-month expiry)
- ✅ Credit service with FIFO deduction logic:
  - Free credits deducted first, then paid (oldest first)
  - Dynamic pricing based on budget bracket, urgency, and verification
  - Atomic transactions with MongoDB sessions
  - Refund mechanism for failed lead claims
- ✅ Stripe integration:
  - 4 credit packages (Starter, Professional, Business, Enterprise)
  - Checkout session creation
  - Webhook handling (payment success, failure, refunds)
  - Signature verification for security
- ✅ Credit API endpoints:
  - GET `/api/v1/credits/balance` - Current balance
  - GET `/api/v1/credits/transactions` - Transaction history
  - GET `/api/v1/credits/purchases` - Purchase history
  - GET `/api/v1/credits/packages` - Available packages
  - POST `/api/v1/credits/checkout` - Create Stripe checkout
  - POST `/api/v1/credits/calculate-cost` - Preview credit cost
  - POST `/api/v1/credits/webhook` - Stripe webhook (with raw body)
  - POST `/api/v1/credits/admin/add` - Manual credit addition
  - POST `/api/v1/credits/admin/refund` - Manual refund
- ✅ Credit cost calculation:
  - Base cost by budget bracket (2-25 credits)
  - Urgency multipliers (1.0x - 1.5x for emergency)
  - Verification discounts (5% basic, 15% comprehensive)
- ✅ 6-month credit expiry system with background job support
- ✅ Validation schemas for all credit operations

#### AI Chat System (Home GPT - Phase 1 - COMPLETE)
- ✅ Claude Sonnet 4.5 integration via Anthropic SDK
- ✅ Real-time streaming responses via Socket.io
- ✅ Conversation management (user and guest support)
- ✅ Message history and context handling
- ✅ Function calling / Tool execution:
  - `estimate_budget` - Calculate project costs with AED breakdown (labor, materials, permits, VAT)
  - `estimate_timeline` - Estimate realistic timelines considering UAE factors (weather, permits, labor)
  - `search_knowledge_base` - Search home improvement guides and best practices
- ✅ System prompts for home improvement specialist persona
- ✅ Chat API endpoints:
  - POST `/api/v1/chat/conversations` - Create/get conversation
  - GET `/api/v1/chat/conversations/:id` - Get conversation details
  - GET `/api/v1/chat/conversations/:id/messages` - Get message history
- ✅ Socket.io events:
  - `chat:message` - Send message to AI
  - `chat:stream` - Receive streaming response chunks
  - `chat:tool_use` - Tool execution notifications
  - `chat:complete` - Message completion
  - `chat:error` - Error handling
- ✅ Guest mode for unauthenticated users
- ✅ Conversation persistence in MongoDB
- ✅ Token usage tracking

#### Lead Management System (Phase 1 - COMPLETE)
- ✅ Lead database model (with LeadClaim sub-model)
- ✅ Quote database model (with QuoteItem schema)
- ✅ Lead validation schemas (create, update, claim, filter, search)
- ✅ Quote validation schemas (submit, accept, decline)
- ✅ Lead service with complete business logic:
  - Create, update, cancel leads (homeowner)
  - Browse marketplace with filters (category, location, budget, urgency, search)
  - Claim leads with credit deduction (professional)
  - Get my leads/claims
  - Credit cost calculation (budget + urgency + verification discount)
  - Automatic refunds on lead cancellation
- ✅ Quote service with complete business logic:
  - Submit quotes (professional, must have claimed lead)
  - Update/delete quotes (before acceptance)
  - Accept/decline quotes (homeowner)
  - Get quotes for lead (homeowner view)
  - Get my quotes (professional view)
  - Auto-decline other quotes on acceptance
- ✅ Lead API endpoints (14 routes):
  - POST `/api/v1/leads` - Create lead
  - GET `/api/v1/leads/marketplace` - Browse marketplace
  - GET `/api/v1/leads/my-leads` - Get my leads
  - GET `/api/v1/leads/my-claims` - Get claimed leads
  - GET `/api/v1/leads/:id` - Get lead details
  - PATCH `/api/v1/leads/:id` - Update lead
  - POST `/api/v1/leads/:id/cancel` - Cancel lead
  - POST `/api/v1/leads/:id/claim` - Claim lead
  - GET `/api/v1/leads/:id/claims` - Get claims for lead
- ✅ Quote API endpoints (8 routes):
  - POST `/api/v1/leads/:leadId/quotes` - Submit quote
  - GET `/api/v1/leads/:leadId/quotes` - Get quotes for lead
  - GET `/api/v1/quotes/my-quotes` - Get my quotes
  - GET `/api/v1/quotes/:id` - Get quote details
  - PATCH `/api/v1/quotes/:id` - Update quote
  - DELETE `/api/v1/quotes/:id` - Delete quote
  - POST `/api/v1/quotes/:id/accept` - Accept quote
  - POST `/api/v1/quotes/:id/decline` - Decline quote
- ✅ Lead lifecycle management:
  - Open → Full (5 claims) → Quoted → Accepted/Expired/Cancelled
  - 7-day automatic expiration
  - Address privacy (hidden until claimed)
  - Verification requirements enforcement
- ✅ Quote workflow:
  - Professional verification check (basic or comprehensive)
  - Price validation (subtotal + VAT = total)
  - Timeline validation (completion > start)
  - Automatic status updates on acceptance

#### Admin Portal (Phase 1 - COMPLETE)
- ✅ Admin authentication and authorization middleware
- ✅ Admin dashboard backend with comprehensive analytics:
  - Platform metrics (users, leads, credits, revenue)
  - User management (list, search, view, update, delete)
  - Professional verification workflow (approve/reject)
  - Lead moderation (view, flag, delete)
  - Review moderation (flag, delete)
  - Service category management (CRUD)
  - Credit package management
  - System configuration (VAT rates, platform settings)
  - Audit logs tracking
- ✅ Admin API endpoints (30+ routes):
  - GET `/api/v1/admin/dashboard/metrics` - Platform metrics
  - GET `/api/v1/admin/users` - User management
  - PATCH `/api/v1/admin/users/:id` - Update user
  - DELETE `/api/v1/admin/users/:id` - Delete user
  - GET `/api/v1/admin/professionals/pending` - Pending verifications
  - POST `/api/v1/admin/professionals/:id/verify` - Approve/reject verification
  - GET `/api/v1/admin/leads` - Lead moderation
  - GET `/api/v1/admin/reviews` - Review moderation
  - GET `/api/v1/admin/categories` - Category management
  - POST `/api/v1/admin/categories` - Create category
  - And more...
- ✅ Admin portal frontend:
  - Modern dashboard with sidebar navigation
  - Overview page with key metrics and charts
  - User management interface with search and filters
  - Professional verification queue with document review
  - Lead management and moderation tools
  - Review moderation interface
  - Service category CRUD interface
  - Credit package management
  - Audit log viewer
  - Responsive design with Tailwind CSS
  - Real-time stats and data visualization
  - Role-based access control
  - Admin-only routes with auth guards

#### Professional Portal (Phase 1 - COMPLETE)
- ✅ Comprehensive pro dashboard with two-level navigation
- ✅ Profile completion banner with progress tracking
- ✅ Lead marketplace frontend with advanced filtering:
  - Category, location, budget bracket, urgency filters
  - Sort options (newest, budget, urgency, ending soon)
  - Lead cards with claim status and credit cost display
  - Real-time claim updates
- ✅ Lead detail view with claim functionality
- ✅ My Leads section with claimed leads tracking
- ✅ Quote submission form with:
  - Timeline picker (start and completion dates)
  - Budget breakdown (labor, materials, permits, other + VAT calculation)
  - Rich text editor for approach/methodology
  - Warranty terms input
  - File attachment support (prepare for Cloudinary)
- ✅ Quotes management page:
  - View all submitted quotes
  - Track quote status (pending, accepted, declined)
  - Filter and search capabilities
- ✅ Credits dashboard:
  - Real-time balance display
  - Transaction history with filtering
  - Purchase history tracking
  - Stripe Checkout integration UI
  - Credit package selection interface
- ✅ Professional analytics dashboard:
  - Earnings tracking by period
  - Active leads and quote metrics
  - Quote acceptance rate visualization
  - Performance charts and insights
- ✅ Profile management interface:
  - Complete profile editor (bio, tagline, services, areas)
  - Portfolio management with image upload UI
  - Verification document upload
  - Profile preview functionality
- ✅ Settings page:
  - Notification preferences
  - Availability management
  - Pricing configuration
- ✅ Professional preview page:
  - Public profile view before verification
  - Portfolio showcase
  - Service areas display
- ✅ Professional directory:
  - Public professional listings
  - SEO-friendly profile URLs with slugs
  - Search and filter capabilities
- ✅ Reusable professional components:
  - VerificationBadges (Basic ✓, Comprehensive ✓✓)
  - ImageUploader with drag-drop and preview
  - CharacterCounter for text inputs
  - ProfileStats display
  - UserProfileDropdown with role-based navigation
- ✅ Professional-specific services:
  - Professional profile API integration
  - Analytics data service
  - Slug generation utilities
  - Profile completeness tracking

#### UI/UX Design System Updates (COMPLETE)
- ✅ Updated color palette from teal to professional blue (#3b82f6 - Coolers.co)
- ✅ Consistent white text on primary-colored buttons
- ✅ Logo and favicon updated to match primary color
- ✅ Navigation active state highlighting (prevent dual highlights)
- ✅ Improved contrast and accessibility throughout
- ✅ Inter font as primary typeface
- ✅ Consistent component styling and spacing
- ✅ Mobile-responsive design patterns

#### Real-Time Messaging System (Phase 1 - COMPLETE)
- ✅ UserConversation and UserMessage models with MongoDB schemas
- ✅ Socket.io namespace for real-time messaging with JWT authentication
- ✅ RESTful API endpoints for messages and conversations
- ✅ Read receipts, typing indicators, and online presence
- ✅ Message editing (5-min window) and soft delete functionality
- ✅ Conversations list page with search and real-time updates
- ✅ Chat interface with typing indicators and read receipts
- ✅ Unread message badge in navigation with real-time updates
- ✅ Socket.io client with event listeners for live messaging

#### Monthly Free Credits System (Phase 1 - COMPLETE)
- ✅ 100 free credits on professional registration (welcome bonus)
- ✅ Monthly reset to 100 credits on 1st of each month for verified pros
- ✅ Background scripts for monthly reset and credit expiry
- ✅ Updated credit packages with bonus credits (50/160/440/1150)
- ✅ Cron jobs: `monthlyCreditsReset.ts` and `creditExpiry.ts`
- ✅ Redesigned credits page with tabbed layout (Overview/Purchase/History)
- ✅ Credit costs display by budget brackets
- ✅ Transaction history and analytics

#### SEO & Discovery (Phase 1 - COMPLETE)
- ✅ SEO-optimized service category pages
- ✅ Dynamic sitemap generation
- ✅ Professional directory with real-time search and filtering
- ✅ Professional profile slugs for SEO-friendly URLs

#### Lead Creation & Management (Phase 1 - COMPLETE)
- ✅ Multi-step lead form with service-specific questions
- ✅ Connected to backend lead management API
- ✅ Local file upload support for lead attachments
- ✅ Homeowner dashboard renamed "leads" → "requests" (better UX)
- ✅ Quote comparison interface

#### Authentication Enhancements (Phase 1 - COMPLETE)
- ✅ Magic link authentication (passwordless login)
- ✅ Settings integration (profile, notifications, password change)

#### Deployment (Phase 1 - COMPLETE)
- ✅ Railway deployment configuration with MongoDB Atlas
- ✅ Monorepo build configuration optimized
- ✅ Production-ready infrastructure

### 🚧 In Progress

- File upload optimization (Cloudinary integration for cloud storage)
- Testing and refinement of messaging system
- Performance optimization and load testing

### 📋 Upcoming (Phase 1 MVP)

#### Core Features
- Project management (milestones, documents, budget tracking)
- Review and rating system
- Email notifications (Brevo integration)
- Background jobs optimization (BullMQ for queues)

#### Integration & Testing
- Cloudinary integration for cloud file storage
- Google OAuth implementation (optional for Phase 1)
- End-to-end testing (critical user flows)
- Load testing (API performance)
- Security audit
- Beta testing with users (UAT)

### 📅 Development Timeline (Actual)

**Nov 4-9, 2025 - Week 1 (✅ COMPLETED)**
- Foundation: Technical setup, auth system, database models
- Backend: Express + MongoDB + Redis infrastructure
- Core features: Lead management, Quote system, Credit system
- Admin portal: Complete dashboard with user/professional management
- Homeowner dashboard: Base structure and navigation
- AI Chat: Claude Sonnet 4.5 integration with tools

**Nov 10-16, 2025 - Week 2 (✅ COMPLETED)**
- Professional portal: Complete dashboard with marketplace, quotes, credits
- SEO: Service category pages and dynamic sitemap
- Authentication: Magic link (passwordless) implementation
- Lead form: Multi-step wizard with service-specific questions
- UI/UX: Design system updates and consistency improvements

**Nov 17-23, 2025 - Week 3 (✅ COMPLETED)**
- Real-time messaging: Socket.io with full chat features
- Free credits: Monthly reset system with background jobs
- Professional directory: Search and filtering
- Homeowner UX: Renamed "leads" to "requests"
- **Current status as of Nov 19**: ~95% feature complete

**Nov 24-30, 2025 - Week 4 (UPCOMING)**
- Project management system implementation
- Review and rating system
- File upload optimization (Cloudinary)

**Dec 1-7, 2025 - Week 5**
- Email notifications (Brevo integration)
- Background jobs optimization (BullMQ)
- Testing: E2E tests, performance optimization

**Dec 8-14, 2025 - Week 6**
- Security audit and penetration testing
- Beta testing with real users
- Bug fixes and refinements

**Dec 15-21, 2025 - Week 7**
- Final QA and polish
- Production deployment preparation
- Monitoring and alerting setup

**Dec 22-31, 2025 - Launch**
- **Target MVP Launch:** Late December 2025
- Post-launch monitoring and support

**Project Start Date:** November 4, 2025
**Target MVP Launch:** December 22-31, 2025
**Current Status:** ~95% complete after 2.5 weeks of rapid development

### 🎯 Recent Major Achievements (November 2025 - Weeks 1-3)

**Week 3 (Nov 17-19, 2025):**
- ✅ **Real-Time Messaging System**: Complete Socket.io implementation with typing indicators, read receipts, and online presence
- ✅ **Monthly Free Credits**: Automated 100 credits/month for verified professionals with background jobs
- ✅ **Enhanced Homeowner UX**: Renamed "leads" to "requests" for better clarity
- ✅ **Professional Directory**: Real-time search and filtering with SEO-optimized profiles

**Week 2 (Nov 10-16, 2025):**
- ✅ **Complete Professional Portal**: Full dashboard with marketplace, quotes, credits, and analytics
- ✅ **SEO Optimization**: Dynamic service pages and sitemap generation
- ✅ **Magic Link Auth**: Passwordless authentication option
- ✅ **Multi-Step Lead Form**: Service-specific questions with AI assistance

**Week 1 (Nov 4-9, 2025):**
- ✅ **Project Kickoff**: Full technical stack setup and architecture
- ✅ **Admin Portal**: Comprehensive admin dashboard with user/professional/lead management
- ✅ **Homeowner Dashboard**: Complete two-level navigation with requests, quotes, projects
- ✅ **Railway Deployment**: Production-ready hosting with MongoDB Atlas

**Overall Progress:**
- All core features implemented (Auth, AI Chat, Leads, Quotes, Credits, Messaging)
- Three complete dashboards (Homeowner, Professional, Admin)
- Real-time features operational (Chat with AI, Messaging between users)
- Payment system fully functional (Stripe + Credits)
- Remaining: Project management, Reviews, Cloud file storage, Testing

---

## Next Steps (Priority Order)

### Immediate Priorities (Week 4: Nov 24-30, 2025) - Current Phase

1. **Project Management System:**
   - Project dashboard with milestones
   - Document upload and management
   - Budget tracking (actual vs estimated)
   - Progress updates and timeline tracking
   - Integration with accepted quotes

2. **Review and Rating System:**
   - Review submission form (overall + category ratings)
   - Professional response capability
   - Review display on profiles
   - Rating aggregation and trust badges
   - Review moderation tools (admin)

3. **File Upload Optimization:**
   - Cloudinary integration for cloud storage
   - Image optimization and WebP conversion
   - Document storage for projects
   - Avatar/profile photo cloud hosting
   - Migration from local file uploads

### Medium-Term (Week 5-6: Dec 1-14, 2025) - Testing & Polish

4. **Email Notifications (Brevo):**
   - Brevo/SendInBlue integration
   - Notification templates:
     - Lead claimed notification (homeowner)
     - New quote received (homeowner)
     - Quote accepted/declined (professional)
     - New message notification
     - Review request (homeowner)
     - Credit balance low (professional)
   - User notification preferences
   - Email delivery tracking

5. **Background Jobs (BullMQ):**
   - Email queue optimization
   - Image processing queue (Cloudinary)
   - Analytics calculation queue
   - Lead expiry automation (7-day cleanup)
   - Job monitoring and retry logic

6. **Testing & Performance:**
   - End-to-end testing (critical user flows)
   - Load testing (API performance)
   - Performance optimization
   - Bug fixes and refinements

### Launch Prep (Week 7+: Dec 15-31, 2025)

7. **Security Audit:**
   - Penetration testing
   - Vulnerability scanning
   - Security best practices review
   - OWASP compliance check

8. **Beta Testing:**
   - Beta user recruitment (homeowners + professionals)
   - User acceptance testing (UAT)
   - Feedback collection and iteration
   - Bug reporting and tracking

9. **Production Deployment:**
   - Staging environment final QA
   - Production deployment checklist
   - Monitoring and alerting setup
   - Rollback plan preparation
   - Go-live!

### Post-Launch (Ongoing)

10. **AI Chat Enhancements:**
    - Enhanced `create_lead` tool integration
    - Improved `search_professionals` tool
    - Expand knowledge base content
    - Photo analysis improvements for damage assessment
    - Voice input integration (Phase 2)

---

## Testing Checklist (Week 3-4: Nov 19-30, 2025)

### 🧪 Critical User Flow Testing

**Status Legend:** ⏳ Not Started | 🧪 Testing | ✅ Passed | 🐛 Issues Found | ✔️ Fixed

#### Authentication & Onboarding
- [ ] ⏳ **Homeowner Signup** - Email/password registration flow
- [ ] ⏳ **Professional Signup** - Registration with phone number requirement
- [ ] ⏳ **Magic Link Authentication** - Passwordless login flow
- [ ] ⏳ **Professional Onboarding** - 5-step wizard (services, business, areas, photo, completion)
- [ ] ⏳ **Login/Logout** - Both roles with proper redirects
- [ ] ⏳ **Password Reset** - Forgot password flow
- [ ] ⏳ **Session Management** - Token refresh, expiry handling

#### Homeowner Core Flows
- [ ] ⏳ **AI Chat Interaction** - Budget estimates, timeline estimates, knowledge base
- [ ] ⏳ **Project Request Creation** - Multi-step lead form with service-specific questions
- [ ] ⏳ **Photo Upload** - Attach photos to lead request (local file upload)
- [ ] ⏳ **Lead Status Tracking** - View "my requests" with status updates
- [ ] ⏳ **Quote Comparison** - View and compare multiple quotes side-by-side
- [ ] ⏳ **Quote Accept/Decline** - Accept a quote and auto-decline others
- [ ] ⏳ **Professional Search** - Browse and filter professional directory
- [ ] ⏳ **Messaging Homeowner Side** - Send/receive messages with claimed professionals
- [ ] ⏳ **Settings Management** - Update profile, notifications, password

#### Professional Core Flows
- [ ] ⏳ **Lead Marketplace Browsing** - View available leads with filters
- [ ] ⏳ **Lead Filtering** - Category, location, budget, urgency filters
- [ ] ⏳ **Lead Detail View** - View full lead details before claiming
- [ ] ⏳ **Credit Purchase** - Stripe Checkout flow for credit packages
- [ ] ⏳ **Lead Claiming** - Spend credits to claim a lead (with insufficient credit handling)
- [ ] ⏳ **Quote Submission** - Submit quote with timeline, budget breakdown, approach
- [ ] ⏳ **Quote Management** - Edit/delete quotes before acceptance
- [ ] ⏳ **Messaging Professional Side** - Chat with homeowners on claimed leads
- [ ] ⏳ **Profile Management** - Update bio, services, portfolio, verification docs
- [ ] ⏳ **Credits Dashboard** - View balance, transactions, purchase history
- [ ] ⏳ **Monthly Free Credits** - Verify 100 credits on signup and monthly reset

#### Real-Time Features
- [ ] ⏳ **Socket.io Messaging** - Real-time message delivery
- [ ] ⏳ **Typing Indicators** - Show when other party is typing
- [ ] ⏳ **Read Receipts** - Message read status updates
- [ ] ⏳ **Online Presence** - Show online/offline status
- [ ] ⏳ **Unread Badge** - Real-time unread count in navigation
- [ ] ⏳ **Message Editing** - Edit messages within 5-minute window
- [ ] ⏳ **Message Deletion** - Soft delete messages

#### Admin Portal
- [ ] ⏳ **Admin Login** - Admin role access and authorization
- [ ] ⏳ **Dashboard Metrics** - Platform statistics and analytics
- [ ] ⏳ **User Management** - View, search, update, delete users
- [ ] ⏳ **Professional Verification** - Approve/reject verification requests
- [ ] ⏳ **Lead Moderation** - View, flag, delete inappropriate leads
- [ ] ⏳ **Review Moderation** - Flag and remove inappropriate reviews
- [ ] ⏳ **Manual Credit Operations** - Add credits, issue refunds
- [ ] ⏳ **Audit Logs** - View system audit trail

#### Edge Cases & Error Handling
- [ ] ⏳ **Insufficient Credits** - Prevent claiming when balance too low
- [ ] ⏳ **Lead at Max Claims** - Prevent claiming when 5/5 claims reached
- [ ] ⏳ **Quote After Acceptance** - Prevent quote submission after lead closed
- [ ] ⏳ **Duplicate Prevention** - Prevent duplicate signups, claims, quotes
- [ ] ⏳ **Network Errors** - Handle API failures gracefully
- [ ] ⏳ **Validation Errors** - Proper form validation and error messages
- [ ] ⏳ **Session Expiry** - Handle expired tokens and force re-login
- [ ] ⏳ **File Upload Limits** - Handle oversized files and invalid formats

#### Performance & Security
- [ ] ⏳ **Page Load Times** - Test all major pages load under 2 seconds
- [ ] ⏳ **API Response Times** - Check endpoint performance
- [ ] ⏳ **Mobile Responsiveness** - Test on mobile devices and tablets
- [ ] ⏳ **Rate Limiting** - Verify rate limits work correctly
- [ ] ⏳ **XSS Protection** - Test input sanitization
- [ ] ⏳ **SQL Injection** - Verify parameterized queries
- [ ] ⏳ **CSRF Protection** - Check CSRF tokens on state-changing operations
- [ ] ⏳ **Authorization Checks** - Verify role-based access control

#### Integration Testing
- [ ] ⏳ **Stripe Webhooks** - Test payment success, failure, refund webhooks
- [ ] ⏳ **Credit Deduction (FIFO)** - Verify free credits used first, then paid
- [ ] ⏳ **Credit Expiry** - Test 6-month expiry mechanism
- [ ] ⏳ **AI Chat Tools** - Test all Claude function calls work correctly
- [ ] ⏳ **SEO Metadata** - Verify dynamic metadata generation
- [ ] ⏳ **Sitemap Generation** - Check sitemap updates dynamically

### 📝 Testing Notes & Issues

**Instructions:**
1. Update status for each test as you progress (change ⏳ to 🧪 to ✅ or 🐛)
2. Document issues found below with test case reference
3. Mark as ✔️ Fixed once resolved and re-tested

**Issue Template:**
```
### Issue #X: [Brief Description]
- **Test Case**: [Which flow above]
- **Severity**: Critical / High / Medium / Low
- **Status**: Open / In Progress / Fixed / Won't Fix
- **Description**: [What happened]
- **Steps to Reproduce**: [How to trigger]
- **Expected**: [What should happen]
- **Actual**: [What actually happened]
- **Fix**: [Solution applied]
```

**Issues Log:**
_(Add issues here as discovered during testing)_
