#!/bin/bash

# Homezy Development Startup Script
# Starts MongoDB, Redis, and the development servers

echo "🚀 Starting Homezy Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ] || [ ! -d "shared/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"

    # Install shared
    if [ ! -d "shared/node_modules" ]; then
        echo -e "${YELLOW}📦 Installing shared dependencies...${NC}"
        cd shared && npm install && cd ..
    fi

    # Build shared
    if [ ! -d "shared/dist" ]; then
        echo -e "${YELLOW}🔨 Building shared package...${NC}"
        cd shared && npm run build && cd ..
    fi

    # Install server
    if [ ! -d "server/node_modules" ]; then
        echo -e "${YELLOW}📦 Installing server dependencies...${NC}"
        cd server && npm install && cd ..
    fi

    # Install client
    if [ ! -d "client/node_modules" ]; then
        echo -e "${YELLOW}📦 Installing client dependencies...${NC}"
        cd client && npm install && cd ..
    fi
fi

# Start MongoDB and Redis with Docker Compose
echo -e "${GREEN}📦 Starting MongoDB and Redis...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# Wait for MongoDB to be ready
echo -e "${YELLOW}⏳ Waiting for MongoDB to be ready...${NC}"
counter=0
until docker exec homezy-mongodb-dev mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
    counter=$((counter+1))
    if [ $counter -gt 30 ]; then
        echo -e "${RED}❌ MongoDB failed to start within 30 seconds${NC}"
        exit 1
    fi
    printf '.'
    sleep 1
done
echo ""

# Wait for Redis to be ready
echo -e "${YELLOW}⏳ Waiting for Redis to be ready...${NC}"
counter=0
until docker exec homezy-redis-dev redis-cli ping > /dev/null 2>&1; do
    counter=$((counter+1))
    if [ $counter -gt 30 ]; then
        echo -e "${RED}❌ Redis failed to start within 30 seconds${NC}"
        exit 1
    fi
    printf '.'
    sleep 1
done
echo ""

# Check if services are running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Exit"; then
    echo -e "${RED}❌ Some services failed to start. Check docker-compose logs.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ MongoDB and Redis are ready!${NC}"
echo ""
echo -e "${GREEN}📝 Service URLs:${NC}"
echo "  - Frontend:        http://localhost:3000"
echo "  - Backend API:     http://localhost:5001"
echo "  - Mongo Express:   http://localhost:8081 (admin/admin123)"
echo "  - Redis Commander: http://localhost:8082"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down...${NC}"
    # Kill all background processes
    kill $(jobs -p) 2>/dev/null
    # Stop Docker containers
    echo -e "${YELLOW}🐳 Stopping Docker containers...${NC}"
    docker-compose -f docker-compose.dev.yml down
    echo -e "${GREEN}✨ Cleanup complete!${NC}"
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Start backend in background
echo -e "${GREEN}🔧 Starting backend server...${NC}"
(cd server && npm run dev) &
BACKEND_PID=$!

# Give backend time to start
sleep 3

# Start frontend in background
echo -e "${GREEN}🎨 Starting frontend application...${NC}"
(cd client && npm run dev) &
FRONTEND_PID=$!

# Wait for all background processes
echo ""
echo -e "${GREEN}✨ Homezy is running! Press Ctrl+C to stop all services.${NC}"
echo -e "${YELLOW}💡 Tip: Run 'docker-compose -f docker-compose.dev.yml logs -f' in another terminal to see database logs${NC}"

# Keep the script running
wait $BACKEND_PID $FRONTEND_PID
