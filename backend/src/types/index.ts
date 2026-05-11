export interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: 'city' | 'village' | 'town' | 'trek' | 'stay' | 'cafe' | 'hidden_gem';
  subcategory?: 'dorm' | 'hostel' | 'hotel' | 'cafe';
  visited: boolean;
  priority: 1 | 2 | 3 | 4 | 5; // 5 = must visit
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  start_location_id: string;
  end_location_id: string;
  coordinates: [number, number][]; // GeoJSON format
  distance_km: number;
  travel_time_hours: number;
  route_type: 'road' | 'trek' | 'scenic' | 'off_road';
  difficulty?: 'easy' | 'moderate' | 'difficult';
  created_at: Date;
  updated_at: Date;
}

export interface Note {
  id: string;
  location_id: string;
  title: string;
  content: string;
  note_type: 'memory' | 'inspiration' | 'tip' | 'warning' | 'accommodation';
  media_urls: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Journey {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date?: Date;
  locations: string[]; // Array of location IDs in order
  routes: string[]; // Array of route IDs
  status: 'planned' | 'in_progress' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}
