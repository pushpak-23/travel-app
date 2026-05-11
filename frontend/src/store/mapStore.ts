import { create } from 'zustand';
import { normalizeStateName } from '@/lib/state';

export interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: 'city' | 'village' | 'town' | 'trek' | 'stay' | 'cafe' | 'hidden_gem';
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
  clearSelection: () => void;
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
    const filtered = locations.filter((loc) => {
      const locationState = normalizeStateName(loc.state) || 'Unassigned';
      if (state.selectedState && locationState !== normalizeStateName(state.selectedState)) {
        return false;
      }
      if (state.selectedItinerary && (loc.itinerary_name || 'General').trim() !== state.selectedItinerary) {
        return false;
      }
      return true;
    });
    return { locations, filteredLocations: filtered };
  }),
  setRoutes: (routes) => set({ routes }),
  selectLocation: (location) => set({ selectedLocation: location }),
  setLoading: (loading) => set({ isLoading: loading }),
  setMapCenter: (center) => set({ mapCenter: center }),
  setMapZoom: (zoom) => set({ mapZoom: zoom }),
  addLocation: (location) => set((state) => ({
    locations: [...state.locations, {
      ...location,
      state: normalizeStateName(location.state) || undefined,
      itinerary_name: (location.itinerary_name || 'General').trim() || 'General',
    }],
    filteredLocations: [...state.locations, {
      ...location,
      state: normalizeStateName(location.state) || undefined,
      itinerary_name: (location.itinerary_name || 'General').trim() || 'General',
    }].filter((loc) => {
      const locationState = normalizeStateName(loc.state) || 'Unassigned';
      if (state.selectedState && locationState !== normalizeStateName(state.selectedState)) {
        return false;
      }
      if (state.selectedItinerary && (loc.itinerary_name || 'General').trim() !== state.selectedItinerary) {
        return false;
      }
      return true;
    }),
  })),
  removeLocation: (id) => set((state) => ({
    locations: state.locations.filter((loc) => loc.id !== id),
    filteredLocations: state.filteredLocations.filter((loc) => loc.id !== id),
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
    const selectedState = normalizeStateName(state) || null;
    const selectedItinerary = null; // Reset itinerary when changing state
    
    // Filter locations by selected state
    const filtered = selectedState 
      ? store.locations.filter((loc) => normalizeStateName(loc.state) === selectedState)
      : store.locations;
    
    return { selectedState, selectedItinerary, filteredLocations: filtered };
  }),
  selectItinerary: (itinerary) => set((store) => {
    const selectedItinerary = itinerary ? itinerary.trim() : null;
    
    // Filter locations by selected state and itinerary
    let filtered = store.locations;
    if (store.selectedState) {
      filtered = filtered.filter((loc) => normalizeStateName(loc.state) === store.selectedState);
    }
    if (selectedItinerary) {
      filtered = filtered.filter((loc) => (loc.itinerary_name || 'General').trim() === selectedItinerary);
    }
    
    return { selectedItinerary, filteredLocations: filtered };
  }),
  clearSelection: () => set((state) => ({
    selectedState: null,
    selectedItinerary: null,
    filteredLocations: state.locations,
  })),
  updateFilteredLocations: () => set((state) => {
    let filtered = state.locations;
    if (state.selectedState) {
      filtered = filtered.filter((loc) => normalizeStateName(loc.state) === state.selectedState);
    }
    if (state.selectedItinerary) {
      filtered = filtered.filter((loc) => (loc.itinerary_name || 'General').trim() === state.selectedItinerary);
    }
    return { filteredLocations: filtered };
  }),
}));
