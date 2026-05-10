#!/bin/bash

# Travel Map Development Server Start Script
# Requires: Node.js 18+, PostgreSQL

set -e

echo "🌍 Travel Map - Development Environment"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ PostgreSQL psql not found in PATH${NC}"
    echo "  You may still be able to connect if PostgreSQL is running"
fi

echo -e "${GREEN}✓ Prerequisites checked${NC}"
echo ""

# Start backend if --backend or --all flag
if [[ "$1" == "--backend" || "$1" == "--all" || -z "$1" ]]; then
    echo "Starting Backend..."
    cd backend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run dev &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend running (PID: $BACKEND_PID)${NC}"
    echo "  API: http://localhost:5000"
    cd ..
    echo ""
fi

# Start frontend if --frontend or --all flag
if [[ "$1" == "--frontend" || "$1" == "--all" || -z "$1" ]]; then
    echo "Starting Frontend..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓ Frontend running (PID: $FRONTEND_PID)${NC}"
    echo "  App: http://localhost:3000"
    cd ..
    echo ""
fi

echo -e "${GREEN}🎉 Development servers running!${NC}"
echo ""
echo "Open in your browser:"
echo "  → http://localhost:3000 (Frontend)"
echo ""
echo "Stop servers with: Ctrl+C"
echo ""

# Keep script running
wait
