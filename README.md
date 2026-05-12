# Travel Map - Personal Travel Planning Web App

A cinematic, interactive web application for planning and visualizing your future travel adventures. Designed specifically for mapping trips around Himachal Pradesh and beyond.

![Travel Map Architecture](https://img.shields.io/badge/Tech%20Stack-Next.js%20%7C%20Express%20%7C%20PostgreSQL%20%7C%20Mapbox-blue)

## 🌍 Features

### Core Functionality

- **Interactive Map**: Smooth, animated Mapbox GL JS map centered on Himachal Pradesh
- **Location Marking**: Add villages, towns, hidden gems, treks, accommodations, and cafés
- **Route Planning**: Draw and visualize roads, treks, and scenic routes
- **Priority System**: Rate places by priority (1-5 stars) to organize your must-sees
- **Categorization**: Organize locations by type (villages, towns, treks, stays, cafés, hidden gems)
- **Tags & Filtering**: Tag locations and filter by category for easy discovery
- **Journey Flow**: Create trip itineraries with multiple locations and routes
- **Notes & Media**: Attach memories, reels, images, and travel inspiration to locations
- **Visit Tracking**: Mark locations as visited and track your progress

### Visual Experience

- Cinematic dark theme with gradient animations
- Smooth transitions and hover effects
- Glass morphism UI components
- Route animations on the map
- Responsive sidebar with location browser
- Real-time map interactions

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + custom animations
- **Animations**: Framer Motion
- **Map**: Mapbox GL JS
- **State Management**: Zustand
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with PostGIS
- **API Style**: RESTful

### Database

- **Primary**: PostgreSQL
- **GIS Extension**: PostGIS (for advanced geographic queries)
- **Data Types**: UUID, JSONB, Geometry

## 📋 Project Structure

```
travel_project/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server setup
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   ├── routes/
│   │   │   ├── locations.ts      # Location CRUD endpoints
│   │   │   ├── routes.ts         # Route endpoints
│   │   │   ├── notes.ts          # Note endpoints
│   │   │   └── journeys.ts       # Journey endpoints
│   │   └── scripts/
│   │       └── migrate.ts        # Database initialization
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx        # Root layout
    │   │   ├── page.tsx          # Home page
    │   │   └── globals.css       # Global styles
    │   ├── components/
    │   │   ├── InteractiveMap.tsx      # Main map component
    │   │   ├── LocationCard.tsx        # Location details
    │   │   ├── LocationsList.tsx       # Locations browser
    │   │   └── AddLocationModal.tsx    # Add location form
    │   ├── lib/
    │   │   └── api.ts            # API client
    │   ├── store/
    │   │   └── mapStore.ts       # Zustand store
    │   └── globals.css           # Tailwind imports
    ├── public/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.ts
    └── .env.local.example
```

## 🚀 Getting Started

### Recommended: Run With Docker

After cloning the repo, the simplest way to start the app is:

```bash
git clone <your-repo-url>
cd travel-app
cp .env.example .env
./run.sh
```

That script uses Docker Compose, builds the images locally, starts PostgreSQL, runs the database migrations, and then exposes the app on:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

If you are running on a server with a public or floating IP, replace the localhost URLs in `.env` with your server IP before starting.

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Mapbox GL account (get free token at [mapbox.com](https://mapbox.com))
- npm or yarn

### Manual Setup

Use this only if you want to run the backend and frontend outside Docker.

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings:
# - DATABASE_URL: Your PostgreSQL connection string
# - PORT: Server port (default: 5000)
# - CORS_ORIGIN: Frontend URL (default: http://localhost:3000)
# - MAPBOX_TOKEN: Your Mapbox token

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local with:
# - NEXT_PUBLIC_MAPBOX_TOKEN: Your Mapbox token
# - NEXT_PUBLIC_API_URL: Backend URL (default: http://localhost:5000)

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📱 API Documentation

### Endpoints

#### Locations

- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get location by ID
- `POST /api/locations` - Create new location
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location

#### Routes

- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create new route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route

#### Notes

- `GET /api/notes/location/:location_id` - Get notes for a location
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

#### Journeys

- `GET /api/journeys` - Get all journeys
- `POST /api/journeys` - Create new journey
- `PUT /api/journeys/:id` - Update journey
- `DELETE /api/journeys/:id` - Delete journey

### Example Requests

**Add a location**:

```bash
curl -X POST http://localhost:5000/api/locations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Triund Trek",
    "description": "Scenic trek with panoramic views",
    "latitude": 32.2406,
    "longitude": 76.3131,
    "category": "trek",
    "priority": 5,
    "tags": ["hiking", "scenic", "must-visit"]
  }'
```

## 🎨 UI/UX Features

### Design System

- **Color Palette**: Dark slate background with purple, blue, and pink accents
- **Typography**: Clean, modern sans-serif fonts
- **Components**: Glass morphism effects with semi-transparent backgrounds
- **Animations**: Smooth fade-ins, slides, and hover transitions

### Key Components

1. **InteractiveMap**: Mapbox GL map with markers and real-time updates
2. **LocationCard**: Detailed view of selected location
3. **LocationsList**: Filterable list of all locations by category
4. **AddLocationModal**: Form to add new locations with geocoordinates
5. **Sidebar**: Collapsible navigation and location browser

## 🌟 Future Enhancements

- [ ] User authentication and profiles
- [ ] Sharing and collaboration features
- [ ] Route optimization and distance calculation
- [ ] Integration with weather APIs
- [ ] 3D terrain visualization
- [ ] Mobile app with offline support
- [ ] Social features (trips with friends)
- [ ] Trip expense tracking
- [ ] Photo gallery and memory storage
- [ ] Integration with travel APIs (flights, hotels, buses)

## 📝 Database Schema

### Locations Table

```sql
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- latitude (DECIMAL)
- longitude (DECIMAL)
- category (VARCHAR)
- subcategory (VARCHAR)
- visited (BOOLEAN)
- priority (INTEGER, 1-5)
- tags (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Routes Table

```sql
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- start_location_id (UUID FK)
- end_location_id (UUID FK)
- coordinates (JSONB) - GeoJSON format
- distance_km (DECIMAL)
- travel_time_hours (DECIMAL)
- route_type (VARCHAR)
- difficulty (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Notes Table

```sql
- id (UUID)
- location_id (UUID FK)
- title (VARCHAR)
- content (TEXT)
- note_type (VARCHAR)
- media_urls (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Journeys Table

```sql
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- start_date (TIMESTAMP)
- end_date (TIMESTAMP)
- locations (JSONB) - Array of location IDs
- routes (JSONB) - Array of route IDs
- status (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔑 Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/travel_map_db
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MAPBOX_TOKEN=your_mapbox_token_here
```

### Frontend (.env.local)

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📖 Development Guide

### Adding a New Feature

1. **Update Database Schema** (if needed):
   - Modify migration in `backend/src/scripts/migrate.ts`
   - Run `npm run migrate`

2. **Create Backend Endpoint**:
   - Add route in `backend/src/routes/`
   - Use TypeScript interfaces from `backend/src/types/`

3. **Update API Client**:
   - Add method to `frontend/src/lib/api.ts`

4. **Create Frontend Component**:
   - Add React component in `frontend/src/components/`
   - Use Zustand store for state

5. **Update Store** (if needed):
   - Modify `frontend/src/store/mapStore.ts`

### Best Practices

- Use TypeScript for type safety
- Follow component composition patterns
- Implement loading and error states
- Add animations for smooth UX
- Test API endpoints with curl or Postman
- Keep API responses consistent
- Use descriptive variable names
- Add comments for complex logic

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is personal and for educational purposes.

## 🙋 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for exploring Himachal Pradesh and beyond**
