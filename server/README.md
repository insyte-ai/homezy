# Homezy Backend Server

Express.js + TypeScript backend API for the Homezy platform.

## Tech Stack

- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js + TypeScript
- **Database:** MongoDB 7+ with Mongoose ODM
- **Caching:** Redis (with ioredis)
- **Authentication:** JWT (access + refresh tokens)
- **Real-time:** Socket.IO
- **AI:** Anthropic Claude Sonnet 4.5 API
- **Payments:** Stripe
- **File Storage:** Cloudinary
- **Email:** Brevo/SendInBlue
- **Queue:** BullMQ
- **Validation:** Zod

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── env.ts       # Environment variables validation
│   │   ├── database.ts  # MongoDB connection
│   │   └── redis.ts     # Redis connection & cache helpers
│   ├── models/          # Mongoose models
│   ├── routes/          # API route definitions
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic & external services
│   ├── utils/           # Utility functions
│   │   └── logger.ts    # Winston logger
│   ├── app.ts           # Express app configuration
│   └── index.ts         # Server entry point
├── logs/                # Application logs
├── .env                 # Environment variables (not committed)
├── .env.example         # Environment variables template
└── package.json         # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- MongoDB 7+ running locally or remotely
- Redis 7+ running locally or remotely

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

See `.env.example` for all required environment variables. Key configurations:

- `MONGODB_URI`: MongoDB connection string
- `REDIS_HOST`, `REDIS_PORT`: Redis connection details
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: JWT signing secrets (min 32 chars)
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `CLOUDINARY_*`: Cloudinary credentials
- `BREVO_API_KEY`: Brevo/SendInBlue API key

### Development

```bash
# Start development server with hot reload
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Routes

All routes are prefixed with `/api/v1/`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Leads
- `GET /leads` - Get all leads
- `POST /leads` - Create new lead
- `GET /leads/:id` - Get lead by ID
- `PUT /leads/:id` - Update lead
- `DELETE /leads/:id` - Delete lead
- `POST /leads/:id/claim` - Claim a lead (professionals)

### Quotes
- `GET /quotes` - Get all quotes
- `POST /quotes` - Create new quote
- `GET /quotes/:id` - Get quote by ID
- `PUT /quotes/:id` - Update quote
- `POST /quotes/:id/accept` - Accept quote (homeowners)
- `POST /quotes/:id/decline` - Decline quote (homeowners)

### Professionals
- `GET /professionals` - Search professionals
- `GET /professionals/:id` - Get professional profile
- `PUT /professionals/:id` - Update professional profile
- `POST /professionals/verification` - Submit verification documents

### AI Chat
- `POST /ai/chat` - Send message to AI assistant
- `POST /ai/stream` - Stream AI responses
- `GET /ai/history` - Get chat history

### Credits
- `GET /credits/balance` - Get credit balance
- `GET /credits/packages` - Get available credit packages
- `POST /credits/purchase` - Purchase credits (Stripe)
- `GET /credits/transactions` - Get credit transaction history

## Health Check

```bash
curl http://localhost:5000/health
```

## Logging

Logs are written to:
- `logs/error.log` - Error level logs
- `logs/combined.log` - All logs
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

## Security Features

- Helmet.js for security headers
- CORS configuration
- JWT authentication with refresh tokens
- Rate limiting (Redis-backed)
- Input validation with Zod
- Bcrypt password hashing
- HttpOnly cookies for refresh tokens

## Database

### MongoDB Collections
- `users` - User accounts and profiles
- `leads` - Homeowner lead requests
- `quotes` - Professional quotes
- `projects` - Active projects
- `messages` - Chat messages
- `reviews` - Professional reviews
- `credits` - Credit transactions
- `auditLogs` - Audit trail

### Redis Databases
- DB 0: General caching
- DB 1: Session storage
- DB 2: Rate limiting
- DB 3: BullMQ job queues

## License

Proprietary - Homezy 2024
