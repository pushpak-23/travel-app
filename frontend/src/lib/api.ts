import axios from 'axios';
import { Location, Route } from '@/store/mapStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Location API
export const locationAPI = {
  getAll: () => api.get<Location[]>('/locations'),
  getById: (id: string) => api.get<Location>(`/locations/${id}`),
  create: (data: Omit<Location, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Location>('/locations', data),
  update: (id: string, data: Partial<Location>) =>
    api.put<Location>(`/locations/${id}`, data),
  delete: (id: string) => api.delete(`/locations/${id}`),
};

// Route API
export const routeAPI = {
  getAll: () => api.get<Route[]>('/routes'),
  getById: (id: string) => api.get<Route>(`/routes/${id}`),
  create: (data: Omit<Route, 'id' | 'created_at' | 'updated_at'>) =>
    api.post<Route>('/routes', data),
  update: (id: string, data: Partial<Route>) =>
    api.put<Route>(`/routes/${id}`, data),
  delete: (id: string) => api.delete(`/routes/${id}`),
};

// Note API
export const noteAPI = {
  getByLocationId: (locationId: string) =>
    api.get(`/notes/location/${locationId}`),
  create: (data: any) => api.post('/notes', data),
  update: (id: string, data: any) => api.put(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
};

// Journey API
export const journeyAPI = {
  getAll: () => api.get('/journeys'),
  getById: (id: string) => api.get(`/journeys/${id}`),
  create: (data: any) => api.post('/journeys', data),
  update: (id: string, data: any) => api.put(`/journeys/${id}`, data),
  delete: (id: string) => api.delete(`/journeys/${id}`),
};

export default api;
