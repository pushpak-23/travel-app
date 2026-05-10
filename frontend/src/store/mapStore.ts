import { create } from 'zustand';

export interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: 'village' | 'town' | 'trek' | 'stay' | 'cafe' | 'hidden_gem';
  subcategory?: string;
  visited: boolean;
  priority: number;
  tags: string[];
}

export interface Route {
  id: string;
  name?: string;
  description?: string;
  start_location_id: string;
  end_location_id: string;
  coordinates: [number, number][];
  distance_km: number;
  travel_time_hours: number;
  route_type: string;
  difficulty?: string;
}

interface MapStore {
  locations: Location[];
  routes: Route[];
  selectedLocation: Location | null;
  isLoading: boolean;
  mapCenter: [number, number];
  mapZoom: number;
  
  setLocations: (locations: Location[]) => void;
  setRoutes: (routes: Route[]) => void;
  selectLocation: (location: Location | null) => void;
  setLoading: (loading: boolean) => void;
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  addLocation: (location: Location) => void;
  removeLocation: (id: string) => void;
  addRoute: (route: Route) => void;
  removeRoute: (id: string) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  locations: [],
  routes: [],
  selectedLocation: null,
  isLoading: false,
  mapCenter: [22.5937, 78.9629], // India center
  mapZoom: 5,
  
  setLocations: (locations) => set({ locations }),
  setRoutes: (routes) => set({ routes }),
  selectLocation: (location) => set({ selectedLocation: location }),
  setLoading: (loading) => set({ isLoading: loading }),
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  addLocation: (location) => set((state) => ({
    locations: [...state.locations, location],
  })),
  removeLocation: (id) => set((state) => ({
    locations: state.locations.filter((loc) => loc.id !== id),
  })),
  addRoute: (route) => set((state) => ({
    routes: [...state.routes, route],
  })),
  removeRoute: (id) => set((state) => ({
    routes: state.routes.filter((route) => route.id !== id),
  })),
}));
