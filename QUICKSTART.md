# Travel Map - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Clone and Run With Docker

```bash
git clone <your-repo-url>
cd travel-app
cp .env.example .env
./run.sh
```

This is the recommended path. It builds the containers, starts PostgreSQL, runs migrations, and brings the app up on the host ports.

### 2. Optional Manual Setup

If you do not want Docker, run the backend and frontend separately:

```bash
# Create database
createdb travel_map_db

# Backend
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
npm run dev
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
