# 📁 Travel Map Project Structure

```
travel_project/
│
├── 📄 README.md                    # Full documentation
├── 📄 QUICKSTART.md                # 5-minute setup guide
├── 📄 SETUP_COMPLETE.md            # Detailed setup summary
├── 📄 docker-compose.yml           # Docker setup (optional)
├── 📄 package.json                 # Root workspace config
│
├── 🔧 setup.sh                     # Auto setup script
├── 🔧 start-dev.sh                 # Start dev servers
├── 🔧 setup-db.sh                  # Database setup helper
│
├── backend/                        # 🌐 Express API Server
│   ├── src/
│   │   ├── index.ts               # Main server file
│   │   │                          # PORT: 5000
│   │   │                          # Features: CORS, JSON, Health check
│   │   │
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   │                          # - Location
│   │   │                          # - Route
│   │   │                          # - Note
│   │   │                          # - Journey
│   │   │                          # - User
│   │   │
│   │   ├── routes/
│   │   │   ├── locations.ts       # GET, POST, PUT, DELETE locations
│   │   │   ├── routes.ts          # GET, POST, PUT, DELETE routes
│   │   │   ├── notes.ts           # GET, POST, PUT, DELETE notes
│   │   │   └── journeys.ts        # GET, POST, PUT, DELETE journeys
│   │   │
│   │   └── scripts/
│   │       └── migrate.ts         # Database initialization
│   │                              # - Create tables
│   │                              # - Enable PostGIS
│   │                              # - Create indexes
│   │
│   ├── package.json               # Dependencies & scripts
│   ├── tsconfig.json              # TypeScript config
│   ├── Dockerfile                 # Container setup
│   ├── .env.example               # Environment template
│   └── .gitignore
│
├── frontend/                       # 🎨 Next.js React App
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout with animations
│   │   │   ├── page.tsx           # Main home page
│   │   │   │                      # Features:
│   │   │   │                      # - Interactive sidebar
│   │   │   │                      # - Main map area
│   │   │   │                      # - Top controls
│   │   │   │                      # - Add location modal
│   │   │   │
│   │   │   └── globals.css        # Global Tailwind setup
│   │   │
│   │   ├── components/
│   │   │   ├── InteractiveMap.tsx
│   │   │   │   └─ Mapbox GL map with markers
│   │   │   │      Features: pan, zoom, 45° pitch, navigation control
│   │   │   │
│   │   │   ├── LocationCard.tsx
│   │   │   │   └─ Displays selected location details
│   │   │   │      Shows: name, category, priority, coordinates, tags
│   │   │   │
│   │   │   ├── LocationsList.tsx
│   │   │   │   └─ Filterable list of all locations
│   │   │   │      Features: category filter, click to select
│   │   │   │
│   │   │   └── AddLocationModal.tsx
│   │   │       └─ Modal form to add new locations
│   │   │          Fields: name, description, lat, lng, category, priority, tags
│   │   │
│   │   ├── lib/
│   │   │   └── api.ts             # Axios API client
│   │   │                          # Methods:
│   │   │                          # - locationAPI.getAll/getById/create/update/delete
│   │   │                          # - routeAPI.* (same methods)
│   │   │                          # - noteAPI.* (same methods)
│   │   │                          # - journeyAPI.* (same methods)
│   │   │
│   │   └── store/
│   │       └── mapStore.ts        # Zustand state management
│   │                              # State:
│   │                              # - locations[]
│   │                              # - routes[]
│   │                              # - selectedLocation
│   │                              # - mapCenter [lng, lat]
│   │                              # - mapZoom
│   │
│   ├── public/                    # Static assets
│   ├── package.json               # Dependencies & scripts
│   ├── tsconfig.json              # TypeScript config
│   ├── tailwind.config.ts         # Tailwind configuration
│   ├── postcss.config.js          # PostCSS setup
│   ├── next.config.js             # Next.js config
│   ├── Dockerfile                 # Container setup
│   ├── .env.local.example         # Environment template
│   └── .gitignore
│
└── (Database runs separately)      # 🗄️ PostgreSQL
    ├── User: postgres
    ├── Database: travel_map_db
    └── Extension: PostGIS
        Tables:
        ├── locations         # Places to visit
        ├── routes           # Paths between places
        ├── notes            # Memories & notes
        └── journeys         # Trip itineraries
```

## 📊 API Endpoints

### Locations

```
GET    /api/locations          Get all locations
GET    /api/locations/:id      Get specific location
POST   /api/locations          Create new location
PUT    /api/locations/:id      Update location
DELETE /api/locations/:id      Delete location
```

### Routes

```
GET    /api/routes             Get all routes
GET    /api/routes/:id         Get specific route
POST   /api/routes             Create new route
PUT    /api/routes/:id         Update route
DELETE /api/routes/:id         Delete route
```

### Notes

```
GET    /api/notes/location/:id Get notes for location
GET    /api/notes/:id          Get specific note
POST   /api/notes              Create new note
PUT    /api/notes/:id          Update note
DELETE /api/notes/:id          Delete note
```

### Journeys

```
GET    /api/journeys           Get all journeys
GET    /api/journeys/:id       Get specific journey
POST   /api/journeys           Create new journey
PUT    /api/journeys/:id       Update journey
DELETE /api/journeys/:id       Delete journey
```

## 🎯 Component Hierarchy

```
App (page.tsx)
├── Background Animations
├── Sidebar
│   ├── Header
│   ├── Tab Navigation
│   ├── LocationsList
│   │   └── LocationItem (repeating)
│   ├── LocationCard
│   └── Add Button
├── Map Container
│   ├── InteractiveMap
│   ├── Toggle Sidebar Button
│   └── Top Controls
└── AddLocationModal
    └── Location Form
```

## 🎨 Color Scheme

### Backgrounds

- Primary: `#0f172a` (slate-950)
- Glass effect: `rgba(255,255,255,0.1)` with backdrop blur

### Accents

- Primary blue: `#3b82f6`
- Secondary purple: `#8b5cf6`
- Accent pink: `#ec4899`

### Text

- Primary: `#ffffff`
- Secondary: `#d1d5db` (gray-300)
- Tertiary: `#9ca3af` (gray-400)

## 🚀 Deployment Structure

### Development

```
Frontend (Next.js)  ←HTTP→  Backend (Express)  ←SQL→  PostgreSQL
  :3000                       :5000                      :5432
```

### Docker Deployment

```
docker compose up
├── postgres:15-postgis (port 5432)
├── express-api (port 5000)
└── next-app (port 3000)
```

### Production (Example)

```
Vercel (Frontend)  ←HTTP→  Railway (Backend)  ←SQL→  Managed PostgreSQL
```

## 📦 Dependencies Summary

### Backend

```
express           - Web framework
pg                - PostgreSQL driver
cors              - CORS middleware
dotenv            - Environment variables
joi               - Validation (optional)
uuid              - ID generation
typescript        - Type safety
ts-node           - TypeScript runtime
```

### Frontend

```
next              - React framework
react/react-dom   - UI library
mapbox-gl         - Map library
framer-motion     - Animations
zustand           - State management
axios             - HTTP client
tailwindcss       - Styling
typescript        - Type safety
```

## 🔑 Key Configuration Files

### .env (Backend)

```
DATABASE_URL      - PostgreSQL connection
PORT              - Server port (5000)
NODE_ENV          - development/production
CORS_ORIGIN       - Frontend URL
MAPBOX_TOKEN      - Mapbox API key
```

### .env.local (Frontend)

```
NEXT_PUBLIC_MAPBOX_TOKEN - Mapbox API key
NEXT_PUBLIC_API_URL       - Backend URL
```

---

**Ready to explore and customize!** 🌍
