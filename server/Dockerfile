# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files for workspace
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies (workspace-aware)
RUN npm ci --workspace=server --include-workspace-root

# Copy server source code
COPY server ./server

# Build TypeScript
RUN npm run build --workspace=server

# Production stage
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache curl

WORKDIR /app

# Copy root package files for workspace
COPY package*.json ./
COPY server/package*.json ./server/

# Install production dependencies only (workspace-aware)
RUN npm ci --workspace=server --include-workspace-root --omit=dev

# Copy built application from builder
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Create necessary directories with proper ownership
RUN mkdir -p /app/uploads && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (Railway will set PORT via env var, defaults to 5000)
EXPOSE 5000

# Health check - uses PORT env var if set, defaults to 5000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-5000}/health || exit 1

# Start the application
WORKDIR /app/server
CMD ["node", "dist/index.js"]
