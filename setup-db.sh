#!/bin/bash

# Database Setup Helper - Docker Edition
# This script sets up PostgreSQL and creates the travel_map_db database using Docker

set -e

echo "🐳 Travel Map - Docker Database Setup"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo ""
    echo "Installation guides:"
    echo "  Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✓ Docker found: $(docker --version)"
echo ""

# Check if container already exists
if docker ps -a --format '{{.Names}}' | grep -q '^travel_map_db$'; then
    echo "⚠️  Container 'travel_map_db' already exists"
    if docker ps --format '{{.Names}}' | grep -q '^travel_map_db$'; then
        echo "✓ Container is already running!"
    else
        echo "Starting existing container..."
        docker start travel_map_db
        echo "✓ Container started"
    fi
else
    echo "Creating PostgreSQL container with PostGIS..."
    docker run \
        --name travel_map_db \
        -e POSTGRES_USER=traveler \
        -e POSTGRES_PASSWORD=travel123 \
        -e POSTGRES_DB=travel_map_db \
        -p 5432:5432 \
        -d \
        postgis/postgis:15-3.3
    
    echo "✓ Container created"
    echo ""
    echo "⏳ Waiting for database to be ready..."
    sleep 15
fi

echo ""

# Verify connection
echo "Testing connection..."
if docker exec travel_map_db psql -U traveler -d travel_map_db -c "SELECT version();" > /dev/null 2>&1; then
    echo "✓ Connection successful!"
else
    echo "⚠️  Connection failed. Trying again in 5 seconds..."
    sleep 5
    docker exec travel_map_db psql -U traveler -d travel_map_db -c "SELECT version();" > /dev/null 2>&1
    echo "✓ Connection successful!"
fi

echo ""
echo "📌 Connection String:"
echo "   postgresql://traveler:travel123@localhost:5432/travel_map_db"
echo ""

# Get container info
echo "📊 Container Info:"
docker inspect travel_map_db --format='IP Address: {{.NetworkSettings.IPAddress}}'
echo "Port: 5432"
echo ""

echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Add to backend/.env:"
echo "   DATABASE_URL=postgresql://traveler:travel123@localhost:5432/travel_map_db"
echo "2. Run migrations:"
echo "   cd backend && npm run migrate"
echo ""
echo "View logs: docker logs travel_map_db"
echo "Stop container: docker stop travel_map_db"
echo "Start container: docker start travel_map_db"
