# 🚀 Docker Quick Reference

## Start Application

### Development (with hot-reload)

```bash
./docker-start.sh dev
# or
docker-compose up
```

Accessible at: **http://localhost:3000**

### Production

```bash
./docker-start.sh prod
# or
docker-compose -f docker-compose.prod.yml up -d
```

Accessible at: **http://localhost:3000**

---

## Stop Application

```bash
./docker-start.sh stop
# or
docker-compose down
```

---

## View Logs

```bash
./docker-start.sh logs
# or
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

---

## Access Database

```bash
./docker-start.sh db
# or
docker exec -it travel_map_db psql -U traveler -d travel_map_db
```

---

## Common Issues & Solutions

### Port Already in Use

Edit `.env` and change ports:

```env
DB_PORT=5433
BACKEND_PORT=5001
FRONTEND_PORT=3001
```

### Database Connection Error

Check if database is running:

```bash
docker ps | grep postgres
```

### CORS Errors

Verify `.env` has correct URLs:

```bash
cat .env
# Should show CORS_ORIGIN=http://localhost:3000
```

### App Won't Load

Wait 15 seconds for initialization. Check logs:

```bash
docker-compose logs
```

### Full Clean Reset

```bash
./docker-start.sh clean
# or
docker-compose down -v
```

---

## Configuration Files

### Root .env

```env
DB_USER=traveler
DB_PASSWORD=travel123
DB_NAME=travel_map_db
DB_PORT=5432
BACKEND_PORT=5000
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:3000
```

### backend/.env

```env
DATABASE_URL=postgresql://traveler:travel123@postgres:5432/travel_map_db
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Service Health

Check if services are running:

```bash
docker ps
```

Expected output:

```
travel_map_db    (PostgreSQL - port 5432)
travel_map_api   (Express backend - port 5000)
travel_map_app   (Next.js frontend - port 3000)
```

Check health:

```bash
curl http://localhost:5000/health
curl http://localhost:3000
```

---

## Database Commands

### View Database

```bash
docker exec -it travel_map_db psql -U traveler -d travel_map_db
```

### List Tables

```bash
\dt
```

### View Locations

```bash
SELECT id, name, category, priority FROM locations;
```

### View Routes

```bash
SELECT id, name, route_type FROM routes;
```

### Exit Database

```bash
\q
```

---

## Useful Commands

### Restart Services

```bash
docker-compose restart
```

### Rebuild Images

```bash
docker-compose build
```

### View Resource Usage

```bash
docker stats
```

### Remove Unused Images

```bash
docker image prune
```

### View Container Details

```bash
docker inspect travel_map_db
```

---

## Deployment for Production

1. **Update `.env`** with production values:

   ```env
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://api.yourdomain.com
   CORS_ORIGIN=https://yourdomain.com
   DB_PASSWORD=secure_password_here
   ```

2. **Build production images**:

   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Start services**:

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verify**:
   ```bash
   docker ps
   curl https://yourdomain.com/health
   ```

---

## Backup & Restore

### Backup Database

```bash
docker exec travel_map_db pg_dump -U traveler -d travel_map_db > backup.sql
```

### Restore Database

```bash
docker exec -i travel_map_db psql -U traveler -d travel_map_db < backup.sql
```

---

## Performance Tips

- Use `.dockerignore` to reduce image size ✓
- Use multi-stage builds ✓
- Production uses `--production` npm flag ✓
- Alpine Linux for minimal image size ✓
- Health checks configured ✓

---

## Environment Variables

| Variable        | Default               | Notes                   |
| --------------- | --------------------- | ----------------------- |
| `DB_USER`       | traveler              | PostgreSQL user         |
| `DB_PASSWORD`   | travel123             | ⚠️ Change in production |
| `DB_NAME`       | travel_map_db         | Database name           |
| `DB_PORT`       | 5432                  | Expose port             |
| `BACKEND_PORT`  | 5000                  | API port                |
| `FRONTEND_PORT` | 3000                  | Web app port            |
| `NODE_ENV`      | production            | Node environment        |
| `CORS_ORIGIN`   | http://localhost:3000 | Allow frontend          |
| `FRONTEND_URL`  | http://localhost:3000 | Frontend address        |
| `BACKEND_URL`   | http://localhost:5000 | API address             |

---

## Troubleshooting Checklist

- [ ] Docker installed and running
- [ ] `.env` file exists and configured
- [ ] No port conflicts (check with `lsof -i :PORT`)
- [ ] Sufficient disk space (2GB minimum)
- [ ] Services fully started (wait 15 seconds)
- [ ] Logs show no errors (`docker-compose logs`)
- [ ] Backend health check passes (`curl localhost:5000/health`)
- [ ] Frontend loads (`curl localhost:3000`)
- [ ] Database connection works

---

## More Information

See [DOCKER.md](./DOCKER.md) for complete documentation.

---

## Quick Command Reference

```bash
# Start
./docker-start.sh dev

# Stop
./docker-start.sh stop

# Logs
./docker-start.sh logs

# Database
./docker-start.sh db

# Clean
./docker-start.sh clean

# Custom
docker-compose up -d          # Start background
docker-compose down -v        # Remove with volumes
docker-compose restart        # Restart services
docker-compose exec <srv> sh  # Shell into service
```
