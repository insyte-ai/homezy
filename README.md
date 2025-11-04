# Homezy - AI-First Home Improvement Marketplace

AI-powered platform connecting UAE homeowners with verified home improvement professionals.

## Project Structure

```
homezy/
├── client/          # Next.js 14+ frontend (Web)
├── server/          # Express.js + TypeScript backend API
├── shared/          # Shared TypeScript types, schemas, and utilities
├── docker/          # Docker configurations
└── docs/            # Documentation
```

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS 4
- **State:** Zustand

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js + TypeScript
- **Database:** MongoDB 7+
- **Cache:** Redis 7+
- **Auth:** JWT (access + refresh tokens)
- **AI:** Anthropic Claude Sonnet 4.5

### Shared
- **Validation:** Zod schemas
- **Types:** Shared TypeScript interfaces

## Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose
- Docker Desktop running

### Start Development Environment

**One command to run everything:**

```bash
# From the root directory
./scripts/run-dev.sh
```

This single script will:
1. ✅ Check Docker is running
2. ✅ Install all dependencies (shared, server, client)
3. ✅ Build the shared package
4. ✅ Start MongoDB and Redis (Docker)
5. ✅ Start the backend server (http://localhost:5000)
6. ✅ Start the frontend app (http://localhost:3000)
7. ✅ Keep everything running until you press Ctrl+C

**Access the services:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Mongo Express:** http://localhost:8081 (admin/admin123)
- **Redis Commander:** http://localhost:8082

**Stop everything:**
```bash
# Press Ctrl+C in the terminal running run-dev.sh
# It will automatically stop all services and clean up
```

### Other Useful Scripts

**Stop only Docker services:**
```bash
./scripts/stop-dev.sh
```

**Reset database (clean state):**
```bash
./scripts/clean.sh
```

**View Docker logs:**
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

## Environment Variables

### Backend (`server/.env`)

Copy `server/.env.example` to `server/.env` and configure:

```env
# Required for development
MONGODB_URI=mongodb://localhost:27017/homezy
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT secrets (change these!)
JWT_ACCESS_SECRET=your-secret-min-32-chars
JWT_REFRESH_SECRET=your-secret-min-32-chars
COOKIE_SECRET=your-secret-min-32-chars

# API Keys (get from respective services)
ANTHROPIC_API_KEY=your-api-key          # https://console.anthropic.com/
STRIPE_SECRET_KEY=sk_test_...           # https://dashboard.stripe.com/test/apikeys
CLOUDINARY_CLOUD_NAME=your-cloud-name   # https://cloudinary.com/console
BREVO_API_KEY=your-api-key              # https://app.brevo.com/settings/keys/api
```

### Frontend (`client/client/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Documentation

### Authentication Endpoints

Base URL: `http://localhost:5000/api/v1`

#### Register
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "homeowner"
}
```

#### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

#### Get Current User
```bash
GET /auth/me
Authorization: Bearer {access_token}
```

#### Refresh Token
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "{refresh_token}"
}
```

#### Logout
```bash
POST /auth/logout
Authorization: Bearer {access_token}
```

## Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Register a user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "homeowner"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Get current user (replace TOKEN with access token from login)
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman/Insomnia

Import the following endpoints:
1. POST http://localhost:5000/api/v1/auth/register
2. POST http://localhost:5000/api/v1/auth/login
3. GET http://localhost:5000/api/v1/auth/me
4. POST http://localhost:5000/api/v1/auth/refresh
5. POST http://localhost:5000/api/v1/auth/logout

## Development Workflow

### Database Management

**View MongoDB data:**
- Open Mongo Express: http://localhost:8081
- Login: admin / admin123
- Browse the `homezy` database

**View Redis data:**
- Open Redis Commander: http://localhost:8082
- Browse keys and their values

**Reset database:**
```bash
# With Docker
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Without Docker (in mongosh)
use homezy
db.dropDatabase()
```

### Type Safety

```bash
# Check TypeScript types
cd server && npm run type-check
cd shared && npm run type-check

# Build shared package (required after type changes)
cd shared && npm run build
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format
```

## Project Status

### ✅ Completed
- Express backend structure with TypeScript
- MongoDB + Mongoose models (User, Lead, Quote, Project, Message, Review, Credit)
- Redis caching and session management
- JWT authentication system (access + refresh tokens)
- Complete middleware (auth, validation, error handling, rate limiting)
- Auth endpoints (register, login, logout, refresh, me)
- Docker Compose for local development
- Zod validation schemas

### 🚧 In Progress
- Lead CRUD endpoints
- User profile endpoints
- Professional profile endpoints

### 📋 Upcoming
- AI chat service (Claude Sonnet 4.5)
- Lead marketplace and claiming system
- Credit system with Stripe
- Quote submission and acceptance
- Real-time messaging (Socket.IO)
- Project management features
- Review and rating system
- File uploads (Cloudinary)
- Email notifications (Brevo)
- Background jobs (BullMQ)

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
docker ps | grep mongodb

# View MongoDB logs
docker logs homezy-mongodb-dev

# Restart MongoDB
docker-compose -f docker-compose.dev.yml restart mongodb
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
docker exec -it homezy-redis-dev redis-cli ping
# Should return: PONG

# Restart Redis
docker-compose -f docker-compose.dev.yml restart redis
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process (replace PID)
kill -9 PID

# Or use different ports in .env
PORT=5001
```

### TypeScript Errors

```bash
# Rebuild shared package
cd shared
npm run build

# Clear Next.js cache
cd client/client
rm -rf .next
npm run dev
```

## License

Proprietary - Homezy 2024

## Support

For issues or questions, please create an issue in the repository.
