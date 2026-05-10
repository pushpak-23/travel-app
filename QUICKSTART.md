# Travel Map - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Database Setup (PostgreSQL required)

```bash
# Create database
createdb travel_map_db

# Set connection string
export DATABASE_URL="postgresql://user:password@localhost:5432/travel_map_db"
```

### 2. Backend Setup

```bash
cd backend

# Install and configure
npm install
cp .env.example .env
# Edit .env and add your DATABASE_URL and MAPBOX_TOKEN

# Initialize database
npm run migrate

# Start server
npm run dev
# API running at http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install and configure
npm install
cp .env.local.example .env.local
# Edit .env.local and add your MAPBOX_TOKEN

# Start development server
npm run dev
# App running at http://localhost:3000
```

## 📍 Getting Mapbox Token

1. Go to [mapbox.com](https://www.mapbox.com/signup)
2. Create a free account
3. Go to Account → Tokens
4. Copy your default public token
5. Add to `.env` files

## 🗺️ First Location

Open http://localhost:3000, click "+ Add Location" and add:

- **Name**: Triund Trek
- **Latitude**: 32.2406
- **Longitude**: 76.3131
- **Category**: Trek
- **Priority**: 5

## 📝 Common Commands

### Backend

```bash
npm run dev      # Development server
npm run build    # Build for production
npm start        # Start production server
npm run migrate  # Run database migrations
```

### Frontend

```bash
npm run dev      # Development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Check code
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Database Connection Failed

- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check credentials in connection string

### Map Not Loading

- Verify NEXT_PUBLIC_MAPBOX_TOKEN in .env.local
- Check Mapbox token is active
- Open browser console for errors

## 🎯 Next Steps

- [ ] Add your Himachal Pradesh locations
- [ ] Explore route creation
- [ ] Add notes and memories to locations
- [ ] Create your first journey
- [ ] Customize the theme (edit tailwind.config.ts)

## 📚 Learn More

- [Next.js Docs](https://nextjs.org)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)

---

**Happy travels! 🌍✈️**
