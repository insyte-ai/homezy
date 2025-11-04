#!/bin/bash

# Homezy Clean Script
# Removes all Docker volumes and resets the database

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

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo ""
echo "======================================"
echo "  Homezy Clean Script"
echo "======================================"
echo ""

print_warning "This will:"
print_warning "  • Stop all Docker services"
print_warning "  • Remove all Docker volumes (MongoDB + Redis data)"
print_warning "  • Reset the database to a clean state"
echo ""

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
print_info "Stopping and removing Docker services..."
docker-compose -f docker-compose.dev.yml down -v

print_success "All services stopped and volumes removed"
echo ""
print_info "Starting fresh services..."
docker-compose -f docker-compose.dev.yml up -d

print_success "Clean environment ready!"
echo ""
echo "Services are starting up. Run './scripts/run-dev.sh' to check status."
echo ""
