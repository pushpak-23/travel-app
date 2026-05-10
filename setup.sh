#!/bin/bash

echo "🌍 Travel Map - Setup Script"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
npm install
cp .env.example .env
echo "✓ Backend setup complete"
echo ""

# Setup Frontend  
echo "📦 Setting up Frontend..."
cd ../frontend
npm install
cp .env.local.example .env.local
echo "✓ Frontend setup complete"
echo ""

# Back to root
cd ..

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your PostgreSQL connection string"
echo "2. Update frontend/.env.local with your Mapbox token"
echo "3. Run database migrations: cd backend && npm run migrate"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm run dev"
echo ""
echo "Visit http://localhost:3000 to see your app!"
