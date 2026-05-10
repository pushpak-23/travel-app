# Travel Map - Switched to Free OpenStreetMap + Leaflet

## ✅ Changes Made

### Frontend Dependencies Updated

- **Removed**: `mapbox-gl` (requires paid API token)
- **Added**: `leaflet` + `react-leaflet` (free, open-source)
- **Added**: `@types/leaflet` (TypeScript support)

### Map Component Replaced

- **Old**: Mapbox GL JS with 3D effects
- **New**: Leaflet with OpenStreetMap tiles
- **Tiles**: Free OSM tiles (no token needed, publicly available)
- **Features**:
  - ✅ Interactive pan & zoom
  - ✅ Custom colored markers by category
  - ✅ Popup on marker click
  - ✅ Dark theme overlay
  - ✅ Smooth animations
  - ✅ Fully client-rendered (SSR-safe)

### Configuration Simplified

- **Removed**: `NEXT_PUBLIC_MAPBOX_TOKEN` env var
- **Backend**: No Mapbox token needed
- **Frontend**: `.env.local` only needs `NEXT_PUBLIC_API_URL`

### Styling Updated

- Added Leaflet CSS support
- Dark theme for OpenStreetMap tiles
- Custom popup styling
- Dark overlay filter on tiles for visibility

## 🎯 How It Works

### Map Data Flow

```
User Browser
    ↓
  Leaflet JS Library
    ↓
OpenStreetMap Tile Servers (free, public)
    ↓
Display map tiles in dark theme
    ↓
Custom markers for each location
```

### No Rate Limits or Costs

- ✅ OpenStreetMap tiles are free
- ✅ No API keys required
- ✅ Unlimited requests
- ✅ Self-hosted alternative available

## 🚀 Running Now

**Frontend**: http://localhost:3001  
**Backend**: http://localhost:5000  
**Database**: PostgreSQL (Docker)

## 📍 Marker Colors by Category

| Category   | Color     | Icon |
| ---------- | --------- | ---- |
| village    | Green 🟢  | 📍   |
| town       | Blue 🔵   | 📍   |
| trek       | Orange 🟠 | 📍   |
| stay       | Purple 🟣 | 📍   |
| cafe       | Yellow 🟡 | 📍   |
| hidden_gem | Pink 🔴   | 📍   |

## ✨ Features

- ✅ Smooth map animations with Framer Motion
- ✅ Click markers to select locations
- ✅ View location details in sidebar
- ✅ Dark themed map for better visibility
- ✅ Fully responsive design
- ✅ No external API dependencies

## 🔄 Self-Hosting Option

If you want even more control, you can run your own map tile server:

```bash
# Using Docker with Overpass API
docker run -d -p 6080:80 overpassapi/osm3s:latest

# Or use Maptiles self-hosted solution
# https://github.com/openmaptiles/docker-compose
```

## 📊 Comparison

| Feature      | Mapbox GL     | Leaflet + OSM |
| ------------ | ------------- | ------------- |
| Cost         | $5-500+/month | FREE          |
| API Key      | Required      | Not needed    |
| 3D Support   | Yes           | No (2D)       |
| Tile Sources | Proprietary   | Open/Free     |
| Setup        | Complex       | Simple        |
| Self-hosting | No            | Yes           |

## 🎨 Customization

You can customize the map by editing:

**InteractiveMap.tsx**:

- Change tile provider (line 30-35)
- Modify marker colors (line 67-74)
- Adjust popup styling (line 76-82)

**globals.css**:

- Change dark theme overlay (filter: invert + hue-rotate)
- Customize Leaflet control styling

## 🌐 Alternative Tile Providers

```javascript
// Different free tile providers:

// OpenStreetMap (current)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

// CartoDB Dark
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png");

// USGS
L.tileLayer(
  "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
);

// Stamen Terrain
L.tileLayer(
  "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
);
```

## ✅ What's Still Working

- ✅ All CRUD operations (Create, Read, Update, Delete locations)
- ✅ Database saves and retrieval
- ✅ Location categorization
- ✅ Priority ratings
- ✅ Tag system
- ✅ Note attachments
- ✅ Journey creation
- ✅ Dark theme UI

## 📝 Next Steps

1. **Access the app**: http://localhost:3001
2. **Add locations**: Click "+ Add Location"
3. **Set your coordinates**: Use latitude/longitude
4. **Pick a category**: (village, town, trek, stay, cafe, hidden_gem)
5. **Visualize your journey**!

---

**Enjoy your free, privacy-friendly travel map!** 🗺️✨
