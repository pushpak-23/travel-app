# 🐳 Docker Setup Guide - Travel Map Application

This guide explains how to build and run the Travel Map application using Docker. The setup includes a PostgreSQL database with PostGIS, a Node.js/Express backend API, and a Next.js frontend.

## Prerequisites

- **Docker**: [Install Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Docker Compose**: Included with Docker Desktop
- At least 2GB of available disk space

## Quick Start (Development)

### 1. Clone and Navigate to Project

```bash
cd travel_project
```

### 2. Create Environment Files

Copy the example environment files to create your own:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

Edit `.env` if you want to customize ports or credentials:

```env
# Database
DB_USER=traveler
DB_PASSWORD=travel123
DB_NAME=travel_map_db

# Ports (adjust if conflicts with local services)
DB_PORT=5432
BACKEND_PORT=5000
FRONTEND_PORT=3000

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### 3. Start Development Stack

```bash
docker-compose up
```

**First time only**: The database will automatically initialize with all required tables.

Wait for output like:

```
✓ PostgreSQL is ready!
✓ Database initialization complete!
✓ Backend server running on port 5000
```

Then visit: **http://localhost:3000**

### 4. View Logs

In another terminal:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Production Deployment

### 1. Prepare Environment

```bash
cp .env.example .env
```

**Important**: Update `.env` with your production URLs:

```env
# Change these for production
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Change database credentials
DB_PASSWORD=your_secure_password_here

# Change these
DB_USER=produser
DB_PASSWORD=strong_secure_password_123
```

### 2. Build Production Images

```bash
docker-compose -f docker-compose.prod.yml build
```

### 3. Run Production Stack

```bash
docker-compose -f docker-compose.prod.yml up -d
```

The `-d` flag runs in detached mode (background).

### 4. Verify Services

```bash
# Check all containers are running
docker ps

# View logs
docker-compose -f docker-compose.prod.yml logs

# Health check backend
curl http://localhost:5000/health

# Health check frontend
curl http://localhost:3000
```

## Common Commands

### Stop All Services

```bash
# Development
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down
```

### Stop But Keep Data

```bash
docker-compose stop
```

### Start Existing Stack

```bash
docker-compose start
```

### Remove Everything (including data!)

```bash
# ⚠️  WARNING: This deletes the database!
docker-compose down -v
```

### Rebuild Without Cache

```bash
# Development
docker-compose build --no-cache

# Production
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Access Database Directly

```bash
docker exec -it travel_map_db psql -U traveler -d travel_map_db

# Common SQL commands:
# \dt                              -- list all tables
# SELECT * FROM locations;         -- view locations
# \q                               -- exit
```

### Run Database Migrations Manually

```bash
docker exec travel_map_api npm run migrate
```

### View Resource Usage

```bash
docker stats
```

## Troubleshooting

### Port Already in Use

If you see "port is already allocated", either:

1. **Change ports in `.env`**:

   ```env
   DB_PORT=5433
   BACKEND_PORT=5001
   FRONTEND_PORT=3001
   ```

2. Or stop the conflicting service:

   ```bash
   # Find what's using port 5000
   lsof -i :5000

   # Kill it (replace PID with the process ID)
   kill -9 <PID>
   ```

### Database Connection Error

```bash
# Check if database is running
docker ps | grep postgres

# Check database logs
docker logs travel_map_db

# If stuck, restart database
docker restart travel_map_db
```

### Backend Can't Connect to Database

```bash
# Verify DATABASE_URL is correct in .env
cat .env | grep DATABASE_URL

# Expected format:
# postgresql://traveler:travel123@postgres:5432/travel_map_db
```

### Frontend CORS Errors

Ensure `.env` has correct URLs:

```env
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then restart:

```bash
docker-compose restart
```

### "Connection refused" when accessing app

Services may still be starting. Wait 10-15 seconds and try again:

```bash
# Monitor startup
docker-compose logs -f

# When you see "✓" checkmarks, app is ready
```

### Clear All and Start Fresh

```bash
# Stop everything
docker-compose down -v

# Remove images
docker-compose down -v --rmi all

# Start fresh
docker-compose up
```

## Environment Variables Reference

### Global (.env)

| Variable        | Default               | Purpose                                     |
| --------------- | --------------------- | ------------------------------------------- |
| `DB_USER`       | traveler              | PostgreSQL username                         |
| `DB_PASSWORD`   | travel123             | PostgreSQL password ⚠️ Change in production |
| `DB_NAME`       | travel_map_db         | Database name                               |
| `DB_PORT`       | 5432                  | PostgreSQL port                             |
| `BACKEND_PORT`  | 5000                  | API server port                             |
| `FRONTEND_PORT` | 3000                  | Web app port                                |
| `FRONTEND_URL`  | http://localhost:3000 | Frontend URL for CORS                       |
| `BACKEND_URL`   | http://localhost:5000 | Backend URL for frontend                    |
| `CORS_ORIGIN`   | http://localhost:3000 | Allowed CORS origin                         |

### Backend (backend/.env)

| Variable       | Default               | Purpose                              |
| -------------- | --------------------- | ------------------------------------ |
| `DATABASE_URL` | postgres://...        | Full PostgreSQL connection string    |
| `PORT`         | 5000                  | Server port                          |
| `NODE_ENV`     | production            | Environment (development/production) |
| `CORS_ORIGIN`  | http://localhost:3000 | Allowed frontend origin              |

### Frontend (frontend/.env.local)

| Variable              | Default               | Purpose         |
| --------------------- | --------------------- | --------------- |
| `NEXT_PUBLIC_API_URL` | http://localhost:5000 | Backend API URL |

## Architecture

```
┌─────────────────────────────────────────────┐
│         Docker Network: travel_network      │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────┐  ┌──────────────┐       │
│  │  Frontend    │  │   Backend    │       │
│  │ (Next.js 14) │◄─┤ (Express.js) │       │
│  │ Port: 3000   │  │ Port: 5000   │       │
│  └──────────────┘  └──────────────┘       │
│        ↑                    ↑              │
│        └────────────┬───────┘              │
│                     │                      │
│              ┌──────▼────────┐             │
│              │  PostgreSQL   │             │
│              │  with PostGIS │             │
│              │  Port: 5432   │             │
│              └───────────────┘             │
│                                             │
└─────────────────────────────────────────────┘
```

### Container Details

- **travel_map_db**: PostgreSQL 15 with PostGIS extension
- **travel_map_api**: Express.js backend API
- **travel_map_app**: Next.js frontend application

## Features Included

✅ **Database**: PostgreSQL 15 + PostGIS for geographic queries
✅ **Backend**: Express.js with TypeScript, CORS configured
✅ **Frontend**: Next.js 14 with React 18, Tailwind CSS, Leaflet maps
✅ **Auto-initialization**: Database tables created automatically
✅ **Health checks**: Services monitored for health
✅ **Volume management**: Data persists between restarts
✅ **Network isolation**: All services on private Docker network
✅ **Environment configuration**: Easy customization via .env

## Data Persistence

- **Database**: Stored in Docker volume `postgres_data` (or `postgres_data_prod`)
- **Persists across**: `docker-compose stop` and `docker-compose start`
- **Lost on**: `docker-compose down -v` (the `-v` flag removes volumes)

To backup database:

```bash
docker exec travel_map_db pg_dump -U traveler -d travel_map_db > backup.sql
```

To restore:

```bash
docker exec -i travel_map_db psql -U traveler -d travel_map_db < backup.sql
```

## Next Steps

1. **Access the application**: Open http://localhost:3000
2. **Add locations**: Use "Add Location" button
3. **Create routes**: Use "Add Route" button
4. **Filter**: Use the filter button to view by category
5. **Edit/Delete**: Click on location cards to manage

## Production Checklist

- [ ] Update `.env` with strong database password
- [ ] Set `FRONTEND_URL` and `BACKEND_URL` to your domains
- [ ] Use HTTPS URLs in production
- [ ] Set up reverse proxy (nginx/Traefik) for SSL termination
- [ ] Configure backup strategy for database volume
- [ ] Set up monitoring and logging
- [ ] Update CORS_ORIGIN to match production frontend URL
- [ ] Test all features in production environment

## Support

For issues:

1. Check logs: `docker-compose logs`
2. Verify environment variables: `cat .env`
3. Check connectivity: `docker-compose exec backend curl http://postgres:5432`
4. Restart services: `docker-compose restart`

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
