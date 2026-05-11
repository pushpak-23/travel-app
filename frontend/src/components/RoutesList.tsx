'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMapStore } from '@/store/mapStore';
import { routeAPI } from '@/lib/api';

export const RoutesList: React.FC = () => {
  const { routes, locations, setRoutes } = useMapStore();
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('grouped');
  const [editingRoute, setEditingRoute] = useState<{
    id: string;
    description: string;
    difficulty: string;
    distance_km: string;
    travel_time_hours: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const routeMeta: { [key: string]: { label: string; icon: string; tone: string } } = {
    road: { label: 'Road', icon: '🛣️', tone: 'text-sky-200 border-sky-400/30 bg-sky-500/10' },
    trek: { label: 'Trek', icon: '🥾', tone: 'text-amber-200 border-amber-400/30 bg-amber-500/10' },
    scenic: { label: 'Scenic', icon: '🌄', tone: 'text-emerald-200 border-emerald-400/30 bg-emerald-500/10' },
    off_road: { label: 'Off-Road', icon: '🏜️', tone: 'text-orange-200 border-orange-400/30 bg-orange-500/10' },
    train: { label: 'Train', icon: '🚆', tone: 'text-cyan-200 border-cyan-400/30 bg-cyan-500/10' },
    flight: { label: 'Flight', icon: '✈️', tone: 'text-indigo-200 border-indigo-400/30 bg-indigo-500/10' },
  };

  const groupedRoutes = useMemo(() => {
    const groups: Record<string, { label: string; routes: typeof routes }> = {};

    routes.forEach((route) => {
      const startLoc = locations.find((location) => location.id === route.start_location_id);
      const endLoc = locations.find((location) => location.id === route.end_location_id);
      if (!startLoc || !endLoc) return;

      const startState = startLoc.state || 'Unassigned';
      const endState = endLoc.state || 'Unassigned';
      const label = startState === endState ? startState : `${startState} → ${endState}`;

      if (!groups[label]) {
        groups[label] = { label, routes: [] };
      }
      groups[label].routes.push(route);
    });

    return Object.values(groups).sort((a, b) => a.label.localeCompare(b.label));
  }, [routes, locations]);

  const handleDeleteRoute = async (id: string) => {
    const confirmed = window.confirm('Delete this route?');
    if (!confirmed) return;

    try {
      await routeAPI.delete(id);
      setRoutes(routes.filter((route) => route.id !== id));
    } catch (error) {
      console.error('Failed to delete route:', error);
      window.alert('Failed to delete route. Please try again.');
    }
  };

  const openEditModal = (route: any) => {
    setEditingRoute({
      id: route.id,
      description: route.description || '',
      difficulty: route.difficulty || 'easy',
      distance_km: String(Number(route.distance_km) || 0),
      travel_time_hours: String(Number(route.travel_time_hours) || 0),
    });
  };

  const handleEditRouteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingRoute) return;

    const parsedDistance = Number(editingRoute.distance_km);
    const parsedTime = Number(editingRoute.travel_time_hours);

    const distance_km = Number.isFinite(parsedDistance) && parsedDistance >= 0 ? parsedDistance : 0;
    const travel_time_hours = Number.isFinite(parsedTime) && parsedTime >= 0 ? parsedTime : 0;

    try {
      setIsSaving(true);
      const response = await routeAPI.update(editingRoute.id, {
        description: editingRoute.description.trim(),
        difficulty: editingRoute.difficulty.trim().toLowerCase() || 'easy',
        distance_km,
        travel_time_hours,
      } as any);

      setRoutes(routes.map((route) => (route.id === editingRoute.id ? response.data : route)));
      setEditingRoute(null);
    } catch (error) {
      console.error('Failed to edit route:', error);
      window.alert('Failed to update route. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (routes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-3xl mb-2">🗺️</div>
        <p className="text-xs">No routes yet</p>
        <p className="text-xs text-gray-500">Add a route to get started</p>
      </div>
    );
  }

  const renderRouteCard = (route: (typeof routes)[number]) => {
    const startLoc = locations.find((l) => l.id === route.start_location_id);
    const endLoc = locations.find((l) => l.id === route.end_location_id);
    const routeInfo = routeMeta[route.route_type] || {
      label: 'Route',
      icon: '🧭',
      tone: 'text-slate-200 border-slate-400/30 bg-slate-500/10',
    };

    if (!startLoc || !endLoc) return null;

    return (
      <motion.div
        key={route.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/35 via-slate-900/50 to-slate-950/60 hover:from-emerald-900/35 hover:via-slate-900/60 hover:to-slate-950/70 smooth-transition border border-emerald-500/20 hover:border-emerald-400/50 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{routeInfo.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${routeInfo.tone}`}>
                {routeInfo.label}
              </span>
            </div>
            <p className="text-sm font-semibold text-white truncate">{startLoc.name}</p>
            <p className="text-xs text-slate-400 my-0.5">to</p>
            <p className="text-sm font-semibold text-white truncate">{endLoc.name}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
              {route.distance_km > 0 && (
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">📏 {route.distance_km} km</span>
              )}
              {route.travel_time_hours > 0 && (
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">⏱️ {route.travel_time_hours}h</span>
              )}
              {route.difficulty && (
                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">💪 {route.difficulty}</span>
              )}
            </div>
          </div>
        </div>
        {route.description && (
          <p className="text-xs text-slate-300/80 mt-3 italic max-h-10 overflow-hidden">{route.description}</p>
        )}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            onClick={() => openEditModal(route)}
            className="flex-1 px-2 py-1.5 text-xs rounded-md bg-sky-500/15 border border-sky-400/30 text-sky-100 hover:bg-sky-500/25 smooth-transition"
          >
            ✏️ Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeleteRoute(route.id)}
            className="flex-1 px-2 py-1.5 text-xs rounded-md bg-rose-500/15 border border-rose-400/30 text-rose-100 hover:bg-rose-500/25 smooth-transition"
          >
            🗑️ Delete
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="flex gap-2 mb-3 bg-white/5 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setViewMode('grouped')}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium smooth-transition ${
            viewMode === 'grouped'
              ? 'bg-green-500/40 text-green-100 border border-green-400/50'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          🗂️ By State
        </button>
        <button
          type="button"
          onClick={() => setViewMode('flat')}
          className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium smooth-transition ${
            viewMode === 'flat'
              ? 'bg-emerald-500/40 text-emerald-100 border border-emerald-400/50'
              : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
        >
          📋 All Routes
        </button>
      </div>

      <div className="space-y-4">
        {viewMode === 'grouped' ? (
          groupedRoutes.map((group) => (
            <div key={group.label} className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-green-200/80 font-semibold px-1">
                {group.label}
              </div>

              <div className="space-y-3">
                {group.routes.map((route) => renderRouteCard(route))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-3">
            {routes.map((route) => renderRouteCard(route))}
          </div>
        )}
      </div>

      {editingRoute && (
        <div
          className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            if (!isSaving) setEditingRoute(null);
          }}
        >
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleEditRouteSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-emerald-400/30 bg-slate-950/95 p-5 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-emerald-200">Edit Route</h3>

            <label className="block">
              <span className="text-xs text-slate-300">Description</span>
              <textarea
                value={editingRoute.description}
                onChange={(e) => setEditingRoute({ ...editingRoute, description: e.target.value })}
                rows={3}
                className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-slate-300">Difficulty</span>
                <select
                  value={editingRoute.difficulty}
                  onChange={(e) => setEditingRoute({ ...editingRoute, difficulty: e.target.value })}
                  className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                </select>
              </label>

              <label className="block">
                <span className="text-xs text-slate-300">Distance (km)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={editingRoute.distance_km}
                  onChange={(e) => setEditingRoute({ ...editingRoute, distance_km: e.target.value })}
                  className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs text-slate-300">Travel time (hours)</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={editingRoute.travel_time_hours}
                onChange={(e) => setEditingRoute({ ...editingRoute, travel_time_hours: e.target.value })}
                className="mt-1 w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setEditingRoute(null)}
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

export default RoutesList;
