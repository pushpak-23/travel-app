#!/bin/bash

# Travel Map - Docker Quick Start Script
# This script helps set up and run the Docker containers

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         🗺️  Travel Map - Docker Quick Start             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose plugin is installed
if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose plugin is not installed${NC}"
    echo "Visit: https://docs.docker.com/compose/"
    exit 1
fi

echo -e "${GREEN}✓ Docker found: $(docker --version)${NC}"
echo -e "${GREEN}✓ Docker Compose found: $(docker compose version)${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Check if backend .env exists
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  backend/.env file not found${NC}"
    if [ -f backend/.env.example ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✓ Created backend/.env${NC}"
    fi
fi

# Check if frontend .env.local exists
if [ ! -f frontend/.env.local ]; then
    echo -e "${YELLOW}⚠️  frontend/.env.local file not found${NC}"
    if [ -f frontend/.env.local.example ]; then
        cp frontend/.env.local.example frontend/.env.local
        echo -e "${GREEN}✓ Created frontend/.env.local${NC}"
    fi
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Available Commands:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}1. Start Development Stack${NC}"
echo "   ${YELLOW}./docker-start.sh dev${NC}"
echo "   Starts all services with hot-reload"
echo ""
echo -e "${GREEN}2. Start Production Stack${NC}"
echo "   ${YELLOW}./docker-start.sh prod${NC}"
echo "   Starts optimized production images"
echo ""
echo -e "${GREEN}3. Stop All Services${NC}"
echo "   ${YELLOW}./docker-start.sh stop${NC}"
echo ""
echo -e "${GREEN}4. View Logs${NC}"
echo "   ${YELLOW}./docker-start.sh logs${NC}"
echo ""
echo -e "${GREEN}5. Access Database${NC}"
echo "   ${YELLOW}./docker-start.sh db${NC}"
echo ""
echo -e "${GREEN}6. Clean Up (remove containers & volumes)${NC}"
echo "   ${YELLOW}./docker-start.sh clean${NC}"
echo ""

# Parse command argument
MODE=${1:-dev}

case $MODE in
    dev)
        echo -e "${BLUE}🚀 Starting Development Stack...${NC}"
        echo ""
        docker compose up
        ;;
    prod)
        echo -e "${BLUE}🚀 Starting Production Stack...${NC}"
        echo ""
        docker compose -f docker-compose.prod.yml up -d
        echo ""
        echo -e "${GREEN}✓ Production stack started in background${NC}"
        echo "Access: http://localhost:3000"
        echo ""
        echo "View logs:"
        echo "  docker compose -f docker-compose.prod.yml logs -f"
        ;;
    stop)
        echo -e "${YELLOW}⏹️  Stopping all services...${NC}"
        if [ -f docker-compose.prod.yml ] && docker compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q travel_map; then
            docker compose -f docker-compose.prod.yml down
        else
            docker compose down
        fi
        echo -e "${GREEN}✓ All services stopped${NC}"
        ;;
    logs)
        echo -e "${BLUE}📋 Showing logs...${NC}"
        echo "(Press Ctrl+C to exit)"
        echo ""
        if [ -f docker-compose.prod.yml ] && docker compose -f docker-compose.prod.yml ps 2>/dev/null | grep -q travel_map; then
            docker compose -f docker-compose.prod.yml logs -f
        else
            docker compose logs -f
        fi
        ;;
    db)
        echo -e "${BLUE}🗄️  Accessing PostgreSQL Database...${NC}"
        echo ""
        docker exec -it travel_map_db psql -U traveler -d travel_map_db
        ;;
    clean)
        echo -e "${RED}⚠️  WARNING: This will delete all containers, networks, and volumes!${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Cleaning up...${NC}"
            docker compose down -v
            docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
            echo -e "${GREEN}✓ Cleanup complete${NC}"
        else
            echo "Cleanup cancelled"
        fi
        ;;
    *)
        echo -e "${RED}Unknown command: $MODE${NC}"
        echo ""
        echo "Usage: ./docker-start.sh [dev|prod|stop|logs|db|clean]"
        exit 1
        ;;
esac
