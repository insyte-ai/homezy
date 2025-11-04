#!/bin/bash

# Homezy Development Stop Script
# Stops all Docker services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

echo ""
echo "======================================"
echo "  Stopping Homezy Services"
echo "======================================"
echo ""

print_info "Stopping Docker services..."
docker-compose -f docker-compose.dev.yml down

print_success "All Docker services stopped"
echo ""
echo "Note: Application servers (if running) need to be stopped manually with Ctrl+C"
echo ""
