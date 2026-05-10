'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMapStore } from '@/store/mapStore';
import { locationAPI, routeAPI } from '@/lib/api';

interface LocationsListProps {
  filterCategory?: string;
  onFilterChange?: (category: string) => void;
}

export const LocationsList: React.FC<LocationsListProps> = ({ filterCategory = 'all', onFilterChange }) => {
  const { locations, setLocations, setRoutes, selectLocation } = useMapStore();
  const [loading, setLoading] = useState(true);
  const [editingLocation, setEditingLocation] = useState<{
    id: string;
    name: string;
    description: string;
    priority: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const categoryLabel = (category: string) => category.replace('_', ' ');
  const categoryIcon = (category: string) => {
    switch (category) {
      case 'village':
        return '🏡';
      case 'town':
        return '🏘️';
      case 'trek':
        return '🥾';
      case 'stay':
        return '🛖';
      case 'cafe':
        return '☕';
      case 'hidden_gem':
        return '💎';
      default:
        return '📍';
    }
  };

  const handleDeleteLocation = async (id: string) => {
    const confirmed = window.confirm('Delete this location? Related routes will also be removed.');
    if (!confirmed) return;

    try {
      await locationAPI.delete(id);
      setLocations(locations.filter((loc) => loc.id !== id));

      // Refresh routes because backend cascades route deletion for removed locations.
      const routeResponse = await routeAPI.getAll();
      setRoutes(routeResponse.data);
    } catch (error) {
      console.error('Failed to delete location:', error);
      window.alert('Failed to delete location. Please try again.');
    }
  };

  const openEditModal = (location: any) => {
    setEditingLocation({
      id: location.id,
      name: location.name || '',
      description: location.description || '',
      priority: String(location.priority || 3),
    });
  };

  const handleEditLocationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingLocation) return;

    const parsedPriority = Number(editingLocation.priority);
    const safePriority = Number.isFinite(parsedPriority)
      ? Math.min(5, Math.max(1, Math.round(parsedPriority)))
      : 3;

    try {
      setIsSaving(true);
      const response = await locationAPI.update(editingLocation.id, {
        name: editingLocation.name.trim() || 'Untitled Location',
        description: editingLocation.description.trim(),
        priority: safePriority,
      });

      setLocations(locations.map((loc) => (loc.id === editingLocation.id ? response.data : loc)));
      setEditingLocation(null);
    } catch (error) {
      console.error('Failed to edit location:', error);
      window.alert('Failed to update location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locResponse, routeResponse] = await Promise.all([
          locationAPI.getAll(),
          routeAPI.getAll(),
        ]);
        setLocations(locResponse.data);
        setRoutes(routeResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setLocations, setRoutes]);

  const filteredLocations =
    filterCategory === 'all'
      ? locations
      : locations.filter((loc) => loc.category === filterCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-3">
        {filteredLocations.map((location, idx) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => selectLocation(location)}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900/50 to-slate-950/60 hover:from-emerald-900/40 hover:via-slate-900/60 hover:to-slate-950/70 smooth-transition cursor-pointer border border-emerald-500/20 hover:border-emerald-400/50 shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{categoryIcon(location.category)}</span>
                  <h4 className="font-semibold text-white truncate">{location.name}</h4>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-emerald-200/80">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 border border-emerald-400/20">
                    {categoryLabel(location.category)}
                  </span>
                  <span className="text-slate-400">Priority {location.priority}</span>
                </div>
                {location.description && (
                  <p className="mt-2 text-xs text-slate-300/80 max-h-10 overflow-hidden">
                    {location.description}
                  </p>
                )}
              </div>
              <div className="text-sm text-amber-300">{'★'.repeat(Math.min(location.priority, 5))}</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(location);
                }}
                className="flex-1 px-2 py-1.5 text-xs rounded-md bg-sky-500/15 border border-sky-400/30 text-sky-100 hover:bg-sky-500/25 smooth-transition"
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLocation(location.id);
                }}
                className="flex-1 px-2 py-1.5 text-xs rounded-md bg-rose-500/15 border border-rose-400/30 text-rose-100 hover:bg-rose-500/25 smooth-transition"
              >
                🗑️ Delete
              </button>
            </div>
          </motion.div>
        ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No locations found in this category.</p>
          </div>
        )}
      </div>

      {editingLocation && (
        <div
          className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            if (!isSaving) setEditingLocation(null);
          }}
        >
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleEditLocationSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-emerald-400/30 bg-slate-950/95 p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-emerald-200">Edit Location</h3>

            <label className="block">
              <span className="text-xs text-slate-300">Name</span>
              <input
                type="text"
                value={editingLocation.name}
                onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs text-slate-300">Description</span>
              <textarea
                value={editingLocation.description}
                onChange={(e) => setEditingLocation({ ...editingLocation, description: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </label>

            <label className="block">
              <span className="text-xs text-slate-300">Priority (1-5)</span>
              <input
                type="number"
                min="1"
                max="5"
                step="1"
                value={editingLocation.priority}
                onChange={(e) => setEditingLocation({ ...editingLocation, priority: e.target.value })}
                className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setEditingLocation(null)}
                className="flex-1 rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 smooth-transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 rounded-md border border-emerald-400/40 bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 smooth-transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </>
  );
};

export default LocationsList;
