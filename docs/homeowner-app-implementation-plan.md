# Homezy Homeowner App - Implementation Plan

**Last Updated:** 2025-01-15

## Overview
Transform Homezy from a project marketplace into a comprehensive **home improvement management app**. Built mobile-first with shared code for web (Next.js) and mobile (Expo React Native).

---

## Top 5 Features

### 1. Home Improvement Project Management
Manage your renovation or improvement project like a pro. Track tasks (Kanban board), costs (budget vs actual), milestones, timelines, and suppliers - all in one place. Share with household members so everyone stays on the same page.

### 2. Find & Hire Trusted Professionals
Browse verified UAE professionals, read reviews, request quotes, compare proposals, and hire with confidence. All communication and project history in one app.

### 3. HomeGPT - AI Home Improvement Assistant
Get instant answers to any home improvement question. From "How much does kitchen remodeling cost in Dubai?" to "What permits do I need?" - your 24/7 home advisor.

### 4. Save Ideas, Pros, Products & Vendors
Your personal home improvement library. Save inspiration images, bookmark professionals, track products with prices, store vendor contacts, and organize estimates/documents - all accessible per project or in your "My Ideas" collection.

### 5. Service History & Smart Reminders
Track all home services (Homezy + external). The app learns your patterns and reminds you when it's time - "You did AC service 6 months ago, time for the next one." One-click to request a quote.

---

## Additional Features
- **My Home Profile** - Property details, rooms, ownership type
- **Expense Tracking** - Budget dashboard, categorized expenses, charts
- **Onboarding Flow** - Property setup wizard with AI assistance

---

## Phase 1: Data Models & Shared Types

### New Mongoose Models

**1. Property Model** (`server/src/models/Property.model.ts`)
```
- homeownerId, name, country (UAE), emirate, neighborhood
- ownershipType: 'owned' | 'rental'
- propertyType: 'villa' | 'townhouse' | 'apartment' | 'penthouse'
- bedrooms, bathrooms, sizeSqFt, yearBuilt
- rooms: [{ id, name, type, floor, notes }]
- isPrimary, profileCompleteness
```

**2. HomeProject Model** (`server/src/models/HomeProject.model.ts`)
```
- homeownerId (creator/owner)
- propertyId (optional - which property this project is for)
- name, description, category (Kitchen, Bathroom, HVAC, etc.)
- status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'
- isDefault: boolean (true for "My Ideas" collection - one per user)

# Integration with Homezy marketplace
- linkedLeadId, linkedQuoteId, linkedProjectId (from accepted quotes)

# Budget Tracking
- budgetEstimated: number
- budgetActual: number (sum of cost items)
- costItems: [{
    id, title, category (labor | materials | permits | other),
    estimatedCost, actualCost,
    vendorId (optional - links to saved vendor),
    status: 'estimated' | 'quoted' | 'paid',
    receiptUrl, notes
  }]

# Timeline
- startDate, targetEndDate, actualEndDate
- milestones: [{ id, title, dueDate, completedAt, status }]

# Tasks (Kanban-style)
- tasks: [{
    id, title, description,
    status: 'todo' | 'in-progress' | 'blocked' | 'done',
    assignedTo (collaborator userId),
    dueDate, completedAt,
    priority: 'low' | 'medium' | 'high',
    order (for drag-drop)
  }]

# Collaboration
- collaborators: [{
    userId, email, name,
    invitedAt, acceptedAt,
    status: 'pending' | 'accepted'
  }]

# Metadata
- createdAt, updatedAt, completedAt
```

**3. ProjectResource Model** (`server/src/models/ProjectResource.model.ts`)
```
- homeProjectId (which project this belongs to)
- homeownerId (who saved it)
- type: 'idea' | 'pro' | 'product' | 'vendor' | 'document' | 'estimate' | 'link'

# Common fields
- title, notes, tags[]

# Type-specific data (polymorphic)
- idea: { images[], sourceUrl, inspiration }
- pro: { professionalId (Homezy pro), externalName, phone, email, rating, specialty }
- product: { name, brand, price, currency, sourceUrl, images[], specifications }
- vendor: { name, type (supplier | store | contractor), phone, email, address, website }
- document: { fileUrl, fileType, fileSize, category (design | estimate | contract | permit | receipt) }
- estimate: { amount, currency, validUntil, fromVendor, description, documentUrl }
- link: { url, previewImage, description }

# Metadata
- isFavorite: boolean
- createdAt, updatedAt
```

**4. ServiceHistory Model** (`server/src/models/ServiceHistory.model.ts`) *(links to HomeProject when applicable)*
```
- homeownerId, propertyId, homeProjectId (optional)
- projectId, quoteId (for Homezy marketplace projects - auto-linked)
- title, description, category (HVAC, Plumbing, Electrical, etc.)
- serviceType: 'maintenance' | 'repair' | 'installation' | 'renovation' | 'inspection'
- providerType: 'homezy' | 'external', providerName, professionalId
- cost, completedAt, documents, photos, rating
```

**5. ServiceReminder Model** (`server/src/models/ServiceReminder.model.ts`)
```
- homeownerId, propertyId
- category (HVAC, Plumbing, Pool, Pest Control, etc.)
- title, description

# Pattern-based scheduling (learned from service history)
- triggerType: 'pattern-based' | 'seasonal' | 'custom'
- frequency: 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'custom'
- customIntervalDays: number (for custom frequency)
- lastServiceDate: Date (from most recent service history in this category)
- nextDueDate: Date (calculated: lastServiceDate + interval)

# Notification tracking
- remindersSent: [{ sentAt, channel, daysBeforeDue }]
- reminderLeadDays: [30, 7, 1] (when to send reminders before due)

# Status
- status: 'active' | 'snoozed' | 'paused' | 'converted-to-quote'
- snoozeUntil: Date
- leadId: string (if converted to quote request)
```

**6. Expense Model** (`server/src/models/Expense.model.ts`)
```
- homeownerId, propertyId, projectId, serviceHistoryId
- title, description, category, amount, date
- vendorType: 'homezy' | 'external', vendorName
- receiptUrl, documents, tags
```

### Shared Package Updates (`shared/src/types/`)

**New file: `home.types.ts`**
- All interfaces for Property, ServiceHistory, ServiceReminder, Expense
- Enums: OwnershipType, PropertyType, RoomType, ServiceCategory, ServiceType, ExpenseCategory

**New file: `project.types.ts`**
- HomeProject, Task, CostItem, Milestone, Collaborator interfaces
- ProjectResource with type-specific data (idea, pro, product, vendor, document, estimate, link)
- Enums: ProjectStatus, TaskStatus, TaskPriority, ResourceType, CostCategory

**New file: `schemas/home.schema.ts`**
- Zod validation schemas for all create/update operations

**New file: `schemas/project.schema.ts`**
- Zod validation for HomeProject, Task, CostItem, Milestone, ProjectResource, Collaborator

**New file: `constants/home.ts`**
- SERVICE_CATEGORIES (HVAC, Plumbing, Electrical, Pool, Pest Control, Cleaning, etc.)
- DEFAULT_SERVICE_FREQUENCIES (by category - e.g., HVAC: biannual, Pool: monthly)
- SEASONAL_MAINTENANCE (UAE-specific, by month)

**New file: `constants/project.ts`**
- PROJECT_CATEGORIES (Kitchen, Bathroom, Bedroom, Living Room, HVAC, Electrical, etc.)
- COST_CATEGORIES (labor, materials, permits, other)
- RESOURCE_TYPES with icons and labels

---

## Phase 2: Backend Services & API

### API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Properties | `GET/POST /api/properties`, `GET/PATCH/DELETE /api/properties/:id`, `POST/PATCH/DELETE /api/properties/:id/rooms/:roomId` |
| **Home Projects** | `GET/POST /api/home-projects`, `GET/PATCH/DELETE /api/home-projects/:id` |
| Project Tasks | `POST/PATCH/DELETE /api/home-projects/:id/tasks/:taskId`, `PATCH /api/home-projects/:id/tasks/reorder` |
| Project Costs | `POST/PATCH/DELETE /api/home-projects/:id/costs/:costId` |
| Project Milestones | `POST/PATCH/DELETE /api/home-projects/:id/milestones/:milestoneId` |
| Collaborators | `POST /api/home-projects/:id/collaborators/invite`, `DELETE /api/home-projects/:id/collaborators/:userId`, `POST /api/home-projects/accept-invite/:token` |
| **Project Resources** | `GET/POST /api/home-projects/:id/resources`, `GET/PATCH/DELETE /api/home-projects/:id/resources/:resourceId` |
| Service History | `GET/POST /api/service-history`, `GET /api/service-history/timeline`, `GET /api/service-history/by-category` |
| Service Reminders | `GET /api/service-reminders`, `GET /api/service-reminders/upcoming`, `POST /api/service-reminders` (create custom), `POST /api/service-reminders/:id/snooze`, `POST /api/service-reminders/:id/pause`, `POST /api/service-reminders/:id/request-quote` |
| Expenses | `GET/POST /api/expenses`, `GET /api/expenses/summary`, `GET /api/expenses/by-category`, `GET /api/expenses/by-month` |
| Onboarding | `GET /api/onboarding/status`, `POST /api/onboarding/property`, `POST /api/onboarding/complete` |

### Backend Services

| Service | Key Functions |
|---------|---------------|
| `property.service.ts` | CRUD, room management, completeness calculation |
| `homeProject.service.ts` | CRUD, task management, cost tracking, milestone management, Homezy project integration |
| `projectResource.service.ts` | CRUD, type-specific handling (ideas, pros, products, vendors, docs) |
| `collaboration.service.ts` | Invite via email, accept invite, permission checks, notify collaborators |
| `serviceHistory.service.ts` | CRUD, auto-sync from completed projects, timeline aggregation, pattern detection |
| `serviceReminder.service.ts` | Pattern-based reminder creation, learn from service history, seasonal reminders, convert to quote |
| `expense.service.ts` | CRUD, auto-create from quotes, summary calculations |
| `onboarding.service.ts` | Progress tracking, AI-assisted setup via HomeGPT, create default "My Ideas" project |

### Cron Jobs (`server/src/jobs/`)

**1. `reminderNotifications.job.ts`** - Daily at 9 AM UAE
- Send reminders at 30, 7, 1 days before due date
- Check notification preferences before sending

**2. `seasonalReminders.job.ts`** - 1st of each month
- Create seasonal reminders (pre-summer AC check in April, etc.)

**3. `servicePatternAnalysis.job.ts`** - Weekly
- Analyze service history patterns per category
- Auto-create/update service reminders based on detected frequency
- E.g., "User has done pool cleaning monthly for 6 months → suggest monthly reminder"

---

## Phase 3: Frontend - Web App

### New Dashboard Pages

```
/dashboard/
  page.tsx                      # Dashboard overview (stats, recent activity, quick actions)

  my-home/                      # "My Home" Hub - all home management features
    page.tsx                    # Overview (property summary, recent projects, upcoming reminders)
    property/page.tsx           # Property details & rooms

    projects/                   # Home Improvement Project Management
      page.tsx                  # Projects list (active, completed, shared with me)
      new/page.tsx              # Create new project
      [id]/
        page.tsx                # Project dashboard (overview, progress, budget)
        tasks/page.tsx          # Kanban board for tasks
        costs/page.tsx          # Budget & cost tracking
        resources/page.tsx      # Saved resources (ideas, pros, products, vendors, docs)
        timeline/page.tsx       # Milestones & timeline view
        settings/page.tsx       # Project settings, collaborators

    ideas/page.tsx              # Default "My Ideas" collection (global saved resources)
    service-history/page.tsx    # Timeline view of all services
    reminders/page.tsx          # Service reminders list
    expenses/page.tsx           # Expense dashboard with charts

  requests/page.tsx             # My Requests (includes quotes & hired jobs)
  messages/page.tsx             # Conversations with professionals
  professionals/page.tsx        # Browse & search professionals

  onboarding/page.tsx           # First-time user setup wizard
  settings/page.tsx             # Account settings
```

### New Components (`client/components/`)

```
home-management/
  PropertyCard.tsx, PropertyForm.tsx
  RoomList.tsx, RoomForm.tsx
  ServiceHistoryTimeline.tsx, ServiceHistoryCard.tsx, ServiceHistoryForm.tsx
  ServiceReminderCard.tsx, ServiceReminderList.tsx, ReminderActionButtons.tsx
  ExpenseDashboard.tsx, ExpenseCard.tsx, ExpenseChart.tsx, ExpenseForm.tsx

projects/
  # Project Management
  ProjectCard.tsx, ProjectForm.tsx, ProjectList.tsx
  ProjectDashboard.tsx              # Overview with progress, budget, recent activity
  ProjectStatusBadge.tsx

  # Tasks (Kanban)
  TaskBoard.tsx                     # Kanban board container
  TaskColumn.tsx                    # Todo, In Progress, Blocked, Done columns
  TaskCard.tsx, TaskForm.tsx        # Draggable task cards
  TaskAssignee.tsx                  # Avatar with collaborator assignment

  # Budget & Costs
  CostTracker.tsx                   # Budget vs actual visualization
  CostItemCard.tsx, CostItemForm.tsx
  BudgetProgressBar.tsx

  # Resources
  ResourceGrid.tsx, ResourceCard.tsx
  ResourceForm.tsx                  # Dynamic form based on resource type
  IdeaCard.tsx, ProductCard.tsx, VendorCard.tsx, ProCard.tsx, DocumentCard.tsx
  SaveResourceButton.tsx            # Quick save from browse/search

  # Timeline & Milestones
  ProjectTimeline.tsx
  MilestoneCard.tsx, MilestoneForm.tsx

  # Collaboration
  CollaboratorList.tsx
  InviteCollaboratorModal.tsx
  CollaboratorAvatar.tsx

onboarding/
  OnboardingWizard.tsx
  PropertyTypeStep.tsx, OwnershipStep.tsx, PropertyDetailsStep.tsx
  OnboardingProgress.tsx
```

---

## Navigation

### Current Navigation (to be updated)
```
Dashboard | My Requests | Quotes | Messages | Projects | Professionals
```

### Web App Navigation (`client/app/dashboard/layout.tsx`)

```typescript
// Consolidated structure - "My Home" becomes the hub for home management features
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Home', href: '/dashboard/my-home', icon: HouseIcon },         // Hub for Projects, Ideas, Reminders, Service History
  { name: 'My Requests', href: '/dashboard/requests', icon: FileText },     // Includes quotes & hired jobs
  { name: 'Messages', href: '/dashboard/messages', icon: Mail },
  { name: 'Professionals', href: '/dashboard/professionals', icon: Users },
];

// "My Home" sub-navigation:
//   - Overview (property details)
//   - Projects (home improvement management)
//   - Ideas (saved resources)
//   - Service History
//   - Reminders
//   - Expenses
```

### Mobile App Navigation (Expo React Native)

**Bottom Tab Bar (5 tabs):**
```typescript
const bottomTabs = [
  { name: 'HomeGPT', screen: 'HomeGPT', icon: MessageCircle },   // AI assistant
  { name: 'My Home', screen: 'MyHome', icon: HouseIcon },        // Hub: Projects, Ideas, Reminders, etc.
  { name: 'Requests', screen: 'Requests', icon: FileText },      // Find pros, get quotes
  { name: 'Pros', screen: 'Professionals', icon: Users },        // Browse professionals
  { name: 'Activity', screen: 'Activity', icon: Bell },          // Notifications & reminders
];

// Top Right Icons:
//   - Messages (Mail icon with unread badge)
//   - Profile (Avatar - leads to Settings)
```

**"My Home" contains (as sub-screens):**
- Property details
- Projects (home improvement)
- Ideas (saved resources)
- Service History
- Reminders
- Expenses

---

## Phase 4: User Model Extension

**Extend `homeownerProfile` in User model:**
```typescript
homeownerProfile: {
  // Existing
  favoritePros, savedSearches, notificationPreferences,

  // NEW
  onboardingCompleted: boolean,
  onboardingSkippedAt?: Date,
  primaryPropertyId?: string,

  // Extended notifications
  notificationPreferences: {
    // existing...
    serviceReminders: boolean,
    seasonalReminders: boolean,
    expenseAlerts: boolean,
  }
}
```

---

## Phase 5: Push Notifications

**Device token management (add to User model):**
```typescript
pushTokens: [{
  token: string,
  platform: 'ios' | 'android' | 'web',
  deviceId?: string,
  createdAt: Date
}]
```

**Push Notification Service** (`server/src/services/pushNotification.service.ts`)
- Support FCM (web) + Expo Push (mobile)
- Notification types: service_reminder, reminder_due_today, seasonal_reminder, expense_alert

---

## Phase 6: Data Migration

**Migration script for existing users:**
1. Create ServiceHistory entries from completed Projects
2. Create Expense entries from accepted Quotes
3. Show onboarding on next login for users without `onboardingCompleted`

---

## Implementation Order

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1-2 | Foundation | All models, shared types, validation schemas, basic CRUD APIs |
| 3-4 | **Project Management Core** | HomeProject CRUD, tasks (Kanban), costs, milestones, project dashboard UI |
| 5-6 | **Resources & Collaboration** | ProjectResource CRUD, all resource types, collaborator invite/accept, sharing UI |
| 7-8 | Service History & Expenses | Services, APIs, migration script, dashboard UI |
| 9-10 | Service Reminders | Pattern-based reminder service, cron jobs, email templates, UI |
| 11-12 | Onboarding & My Home | Wizard flow, property UI, HomeGPT integration, default "My Ideas" project |
| 13-14 | Push & Mobile Prep | Push notification service, device tokens, shared query configs |
| 15-16 | Testing & Polish | E2E tests, mobile responsiveness, documentation |

---

## Critical Files to Modify

| File | Changes |
|------|---------|
| `server/src/models/User.model.ts` | Extend homeownerProfile, add pushTokens |
| `shared/src/types/user.types.ts` | Add home management types |
| `client/app/dashboard/layout.tsx` | Add new nav items, remove Quotes & old Projects tabs |
| `server/src/jobs/index.ts` | Register new cron jobs |
| `server/src/routes/index.ts` | Register new route modules |

---

## Mobile-First Considerations

1. **API Design**: Batch endpoints, efficient payloads, pagination
2. **Shared Code**: Types, validation, API endpoints in `/shared`
3. **Offline Caching**: Properties (24hr), service history (1hr), reminders (5min), expenses (1hr)
4. **Push Notifications**: FCM for web, Expo Push for mobile
5. **Query Keys**: Standardized in shared package for React Query

---

**Document Maintainer:** Product Team
**Next Review:** After Phase 2 completion
