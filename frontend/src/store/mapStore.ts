import { create } from 'zustand';

export interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: 'village' | 'town' | 'trek' | 'stay' | 'cafe' | 'hidden_gem';
  subcategory?: string;
  state?: string;
  itinerary_name?: string;
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
  
  // Grouping state
  locationGroups: Record<string, Record<string, Location[]>>;
  selectedState: string | null;
  selectedItinerary: string | null;
  filteredLocations: Location[];
  
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
  
  // Group management
  setLocationGroups: (groups: Record<string, Record<string, Location[]>>) => void;
  selectState: (state: string | null) => void;
  selectItinerary: (itinerary: string | null) => void;
  updateFilteredLocations: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  locations: [],
  routes: [],
  selectedLocation: null,
  isLoading: false,
  mapCenter: [22.5937, 78.9629], // India center
  mapZoom: 5,
  
  // Grouping state
  locationGroups: {},
  selectedState: null,
  selectedItinerary: null,
  filteredLocations: [],
  
  setLocations: (locations) => set((state) => {
    // Update filtered locations when setting new locations
    const filtered = state.selectedState 
      ? locations.filter((loc) => loc.state === state.selectedState)
      : locations;
    return { locations, filteredLocations: filtered };
  }),
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
  
  // Group management
  setLocationGroups: (groups) => set({ locationGroups: groups }),
  selectState: (state) => set((store) => {
    const selectedState = state;
    const selectedItinerary = null; // Reset itinerary when changing state
    
    // Filter locations by selected state
    const filtered = selectedState 
      ? store.locations.filter((loc) => loc.state === selectedState)
      : store.locations;
    
    return { selectedState, selectedItinerary, filteredLocations: filtered };
  }),
  selectItinerary: (itinerary) => set((store) => {
    const selectedItinerary = itinerary;
    
    // Filter locations by selected state and itinerary
    let filtered = store.locations;
    if (store.selectedState) {
      filtered = filtered.filter((loc) => loc.state === store.selectedState);
    }
    if (selectedItinerary) {
      filtered = filtered.filter((loc) => loc.itinerary_name === selectedItinerary);
    }
    
    return { selectedItinerary, filteredLocations: filtered };
  }),
  updateFilteredLocations: () => set((state) => {
    let filtered = state.locations;
    if (state.selectedState) {
      filtered = filtered.filter((loc) => loc.state === state.selectedState);
    }
    if (state.selectedItinerary) {
      filtered = filtered.filter((loc) => loc.itinerary_name === state.selectedItinerary);
    }
    return { filteredLocations: filtered };
  }),
}));
