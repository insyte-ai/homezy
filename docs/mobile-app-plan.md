# Homezy Mobile App Implementation Plan

**Created:** December 2025

## Overview
Build a **single Expo React Native app** with role-based UI for both homeowners and professionals, achieving **full feature parity** with the existing Next.js web app. Target: iOS and Android simultaneously.

---

## Tech Stack
- **Framework:** Expo SDK 51 + Expo Router (file-based routing)
- **Language:** TypeScript
- **State:** Zustand (adapted from web stores)
- **Real-time:** Socket.io-client
- **Storage:** expo-secure-store (tokens), AsyncStorage (general)
- **Auth:** JWT + Google OAuth (expo-auth-session)
- **Push:** expo-notifications

---

## Project Structure

```
/mobile
├── app/                              # Expo Router (file-based)
│   ├── _layout.tsx                   # Root with providers
│   ├── (auth)/                       # Login, Register, Forgot Password
│   ├── (homeowner)/                  # Homeowner screens (protected)
│   │   ├── (tabs)/                   # Bottom tab screens
│   │   ├── requests/                 # Lead management
│   │   ├── my-home/                  # Properties, Projects, Reminders
│   │   └── messages/                 # Conversations
│   ├── (pro)/                        # Professional screens (protected)
│   │   ├── (tabs)/                   # Bottom tab screens
│   │   ├── leads/                    # Marketplace, claims
│   │   ├── quotes/                   # Quote management
│   │   └── credits/                  # Credit purchase
│   └── onboarding/
├── src/
│   ├── components/                   # UI, forms, chat, messaging
│   ├── hooks/                        # useAuth, useSocket, useChat, etc.
│   ├── services/                     # API layer (adapted from web)
│   ├── store/                        # Zustand stores
│   ├── lib/                          # Socket, storage, notifications
│   └── theme/                        # Colors, typography
└── assets/
```

---

## Navigation Architecture

### Homeowner Bottom Tabs
| Tab | Screen | Icon |
|-----|--------|------|
| Home | Dashboard | home |
| Requests | My Requests | clipboard |
| HomeGPT | AI Chat | chatbubble |
| Messages | Conversations | mail |
| My Home | Properties, Projects, etc. | business |

### Professional Bottom Tabs
| Tab | Screen | Icon |
|-----|--------|------|
| Home | Dashboard | home |
| Marketplace | Lead Marketplace | storefront |
| My Leads | Direct Requests + Claimed | briefcase |
| Quotes | My Quotes | document-text |
| Profile | Portfolio, Settings | person |

Note: Messages are accessible from the header icon (similar to homeowner experience)

---

## Features by Role

### Homeowner Features
- [x] Dashboard (stats, quick actions, recent activity)
- [x] Create service request (multi-step lead form)
- [x] View leads and received quotes
- [x] Accept/decline quotes
- [x] HomeGPT AI chat with streaming
- [x] Real-time messaging with pros
- [x] My Home: Properties, Projects, Service History, Reminders, Expenses
- [x] Browse professionals (Find Pros)
- [x] In-app notifications
- [x] Settings

### Professional Features
- [x] Dashboard (earnings, pending actions)
- [x] Lead marketplace with filters
- [x] Claim leads (credit deduction)
- [x] Submit/edit quotes
- [x] Direct leads
- [x] Real-time messaging
- [x] Credits balance & purchase (Stripe)
- [x] Portfolio management
- [x] Verification status
- [x] In-app notifications
- [x] Settings

---

## Code Sharing Strategy

### From `/shared` (Already Available)
- TypeScript types: User, Lead, Quote, Property, HomeProject, etc.
- Zod validation schemas
- Constants: emirates, budget brackets, service categories

### Adapt from Web `/client`
| Web Source | Mobile Adaptation |
|------------|-------------------|
| `store/authStore.ts` | Replace localStorage → SecureStore |
| `store/chatStore.ts` | Same logic, Socket.io works in RN |
| `store/notificationStore.ts` | Add push notification integration |
| `store/leadFormStore.ts` | Replace localStorage → AsyncStorage |
| `lib/services/*.ts` | Replace axios config for mobile tokens |

---

## Real-Time Implementation

### Socket.io Connections
1. **Chat Socket** (`/`) - AI streaming, function calls
2. **Messaging Socket** (`/messaging`) - User-to-user messaging

### Key Events
```
Chat: chat:token, chat:function_call_start, chat:complete, chat:error
Messaging: message:new, typing:user_typing, typing:user_stopped
```

---

## Push Notifications

### Setup
- Use `expo-notifications` for permission and token
- Save push token to backend: `POST /users/push-token`
- Configure Android channels: default, messages, leads

### Backend Enhancement Needed
- Add `expo-server-sdk` to send push notifications
- Store push tokens in User model
- Trigger push for: new quotes, messages, reminders

---

## Key Dependencies

```json
{
  "expo": "~51.0.0",
  "expo-router": "~3.5.0",
  "expo-secure-store": "~13.0.0",
  "expo-notifications": "~0.28.0",
  "expo-image-picker": "~15.0.0",
  "expo-auth-session": "~5.5.0",
  "zustand": "^4.4.7",
  "axios": "^1.6.0",
  "socket.io-client": "^4.7.0",
  "@homezy/shared": "workspace:*"
}
```

---

## Implementation Roadmap (14 Weeks)

### Phase 1: Foundation (Weeks 1-3)
| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Setup | Expo project, navigation, theme, base UI components |
| 2 | Auth | Login, register, Google OAuth, token storage |
| 3 | Structure | Role-based routing, settings, onboarding screens |

### Phase 2: Homeowner Core (Weeks 4-6)
| Week | Focus | Deliverables |
|------|-------|--------------|
| 4 | Leads | Dashboard, create request form, my requests list |
| 5 | Quotes | Request details, quotes list, accept/decline |
| 6 | Messaging | Socket.io messaging, push notifications |

### Phase 3: Professional Core (Weeks 7-9)
| Week | Focus | Deliverables |
|------|-------|--------------|
| 7 | Leads | Dashboard, marketplace, claim leads |
| 8 | Quotes | Submit quote, my quotes, credits purchase |
| 9 | Profile | Portfolio, verification, profile editing |

### Phase 4: AI & My Home (Weeks 10-12)
| Week | Focus | Deliverables |
|------|-------|--------------|
| 10 | HomeGPT | AI chat with streaming, tool calls |
| 11 | My Home | Properties, projects CRUD |
| 12 | History | Service history, reminders, expenses |

### Phase 5: Polish (Weeks 13-14)
| Week | Focus | Deliverables |
|------|-------|--------------|
| 13 | Testing | E2E tests, performance, bug fixes |
| 14 | Launch | App Store assets, EAS Build, TestFlight |

---

## Critical Files to Reference

### Backend (No changes needed for MVP)
- `server/src/routes/` - All API routes ready
- `server/src/sockets/chat.socket.ts` - AI chat events
- `server/src/sockets/messaging.socket.ts` - Messaging events

### Backend Enhancement (Needed for push)
- Add `server/src/services/push.service.ts` - Expo push notifications
- Update `server/src/models/User.model.ts` - Add pushTokens field

### Web Code to Adapt
- `client/store/authStore.ts` - Auth state pattern
- `client/store/chatStore.ts` - Chat state pattern
- `client/store/leadFormStore.ts` - Multi-step form pattern
- `client/lib/services/*.ts` - API service patterns
- `client/hooks/useSocket.ts` - Socket connection pattern

### Shared Package
- `shared/src/types/` - All TypeScript interfaces
- `shared/src/schemas/` - Zod validation schemas
- `shared/src/constants/` - App constants

---

## Progress Log

### Completed (December 2025)

**Phase 1: Foundation**
- [x] Expo SDK 54 project initialized with TypeScript
- [x] File-based routing with expo-router
- [x] Theme system (colors, typography, spacing)
- [x] Base UI components (Button, Card, Input, Avatar, Badge, EmptyState)
- [x] Authentication (login, register, token storage with SecureStore)
- [x] Role-based navigation (homeowner/pro tab layouts)

**Phase 2: Homeowner Core**
- [x] Homeowner dashboard with stats and quick actions
- [x] Multi-step service request form (6 steps)
- [x] My Requests list with filtering
- [x] Request detail view with quotes
- [x] Quote acceptance/decline flow
- [x] Real-time messaging with Socket.io

**Phase 3: Professional Core**
- [x] Pro dashboard with analytics
- [x] Lead marketplace with filters
- [x] Lead claiming with credit deduction
- [x] My Leads screen (Direct Requests + Claimed leads tabs)
- [x] Quote creation and management
- [x] Credits balance display and purchase flow
- [x] Real-time messaging (header icon)
- [x] Profile management (edit, portfolio, verification, settings)

**Phase 4: My Home (Completed)**
- [x] My Home hub screen with primary property and quick stats
- [x] Properties: List, Create, Edit/View with rooms
- [x] Projects: List, Create, Detail with Tasks/Costs/Milestones
- [x] Reminders: List with snooze/pause/resume/complete actions
- [x] Service History: List with category/type badges
- [x] Expenses: List with summary and category breakdown
- [x] API services for all My Home features

**Phase 4: HomeGPT (Completed)**
- [x] HomeGPT AI chat with streaming
- [x] Chat store (Zustand) for message state management
- [x] Socket.io hook for real-time token streaming
- [x] Tool call indicators (searching professionals, calculating estimates, etc.)
- [x] Welcome screen with suggestion prompts
- [x] Connection status indicator

**Find Pros (Completed)**
- [x] Browse professionals screen for homeowners
- [x] Search and filter by category
- [x] Professional cards with ratings and details

**Phase 4: Push Notifications (Completed)**
- [x] Push notifications with Expo
- [x] Backend push service with expo-server-sdk
- [x] Push token registration API endpoints
- [x] Integration with notification service
- [x] Android notification channels (default, messages, leads)
- [x] Deep linking from notification taps

---

## Next Steps

1. **Testing & Polish** - E2E tests, performance optimization
2. **App Store Submission** - EAS Build, TestFlight, Play Store
