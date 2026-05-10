'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore } from '@/store/mapStore';
import { routeAPI } from '@/lib/api';

interface AddRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RouteType = 'road' | 'trek' | 'scenic' | 'off_road' | 'train' | 'flight';
type DifficultyType = 'easy' | 'medium' | 'hard';

interface RouteFormData {
  start_location_id: string;
  end_location_id: string;
  route_type: RouteType;
  distance_km: number;
  travel_time_hours: number;
  difficulty: DifficultyType;
  description: string;
}

export const AddRouteModal: React.FC<AddRouteModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { locations, addRoute } = useMapStore();
  const [formData, setFormData] = useState<RouteFormData>({
    start_location_id: '',
    end_location_id: '',
    route_type: 'road',
    distance_km: 0,
    travel_time_hours: 0,
    difficulty: 'easy',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState('');

  const autoCalculatedTypes = ['road', 'scenic', 'train', 'flight'];

  const haversineDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Auto-calculate distance for city-to-city transport modes.
  useEffect(() => {
    const calculateDistance = async () => {
      if (!autoCalculatedTypes.includes(formData.route_type)) {
        return;
      }

      if (!formData.start_location_id || !formData.end_location_id) {
        return;
      }

      const startLoc = locations.find((l) => l.id === formData.start_location_id);
      const endLoc = locations.find((l) => l.id === formData.end_location_id);

      if (!startLoc || !endLoc) return;

      setIsCalculating(true);

      try {
        if (formData.route_type === 'flight') {
          const flightDistance = haversineDistanceKm(
            startLoc.latitude,
            startLoc.longitude,
            endLoc.latitude,
            endLoc.longitude
          );
          // Approximate commercial flight speed + overhead for boarding/taxi.
          const flightTime = flightDistance / 700 + 0.75;

          setFormData((prev) => ({
            ...prev,
            distance_km: parseFloat(flightDistance.toFixed(2)),
            travel_time_hours: parseFloat(flightTime.toFixed(2)),
          }));
          return;
        }

        const profile = 'driving';
        const coords = `${startLoc.longitude},${startLoc.latitude};${endLoc.longitude},${endLoc.latitude}`;
        const osrmResponse = await fetch(
          `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full`
        );
        const osrmData = await osrmResponse.json();

        if (osrmData.routes && osrmData.routes.length > 0) {
          const route = osrmData.routes[0];
          let distanceKm = route.distance / 1000;
          let travelHours = route.duration / 3600;

          // Train uses road distance as proxy and average rail speed estimate.
          if (formData.route_type === 'train') {
            distanceKm = distanceKm * 1.1;
            travelHours = distanceKm / 70;
          }

          setFormData((prev) => ({
            ...prev,
            distance_km: parseFloat(distanceKm.toFixed(2)),
            travel_time_hours: parseFloat(travelHours.toFixed(2)),
          }));
        }
      } catch (err) {
        console.error('Failed to calculate distance:', err);
      } finally {
        setIsCalculating(false);
      }
    };

    const timer = setTimeout(calculateDistance, 500);
    return () => clearTimeout(timer);
  }, [formData.start_location_id, formData.end_location_id, formData.route_type, locations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.start_location_id || !formData.end_location_id) {
      setError('Both start and end locations are required');
      return;
    }

    if (formData.start_location_id === formData.end_location_id) {
      setError('Start and end locations must be different');
      return;
    }

    // Road/scenic/train/flight are auto-calculated. Trek/off-road are manual.
    if (formData.distance_km <= 0) {
      setError('Distance must be greater than 0');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await routeAPI.create({
        start_location_id: formData.start_location_id,
        end_location_id: formData.end_location_id,
        route_type: formData.route_type,
        distance_km: parseFloat(String(formData.distance_km)) || 0,
        travel_time_hours: parseFloat(String(formData.travel_time_hours)) || 0,
        difficulty: formData.difficulty,
        description: formData.description.trim(),
        coordinates: [],
      } as any);

      addRoute(response.data);
      onClose();
      setFormData({
        start_location_id: '',
        end_location_id: '',
        route_type: 'road',
        distance_km: 0,
        travel_time_hours: 0,
        difficulty: 'easy',
        description: '',
      });
    } catch (error: any) {
      console.error('Failed to create route:', error);
      setError(error.response?.data?.message || 'Failed to create route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 p-4 flex items-center justify-center"
          >
            <div className="glass-effect p-5 rounded-2xl space-y-2.5 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto">
              <h2 className="text-xl font-bold gradient-text">Add New Route</h2>

              {/* Info Box */}
              <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 text-xs px-3 py-2 rounded-lg">
                <p className="font-semibold mb-1">💡 How it works:</p>
                <p>
                  🛣️ <strong>Road/Scenic:</strong> Auto from real roads
                </p>
                <p>
                  🚆 <strong>Train:</strong> Auto-estimated from city distance
                </p>
                <p>
                  ✈️ <strong>Flight:</strong> Auto-estimated straight-line distance
                </p>
                <p>
                  🥾 <strong>Trek/Off-Road:</strong> Enter manually
                </p>
              </div>
              
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2 pb-1">
                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-1">
                    From Location *
                  </label>
                  <select
                    required
                    value={formData.start_location_id}
                    onChange={(e) =>
                      setFormData({ ...formData, start_location_id: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                  >
                    <option value="">Select start location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-1">
                    To Location *
                  </label>
                  <select
                    required
                    value={formData.end_location_id}
                    onChange={(e) =>
                      setFormData({ ...formData, end_location_id: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                  >
                    <option value="">Select end location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-200 block mb-1">
                      Route Type
                    </label>
                    <select
                      value={formData.route_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          route_type: e.target.value as any,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                    >
                      <option value="road">Road</option>
                      <option value="trek">Trek</option>
                      <option value="scenic">Scenic</option>
                      <option value="train">Train</option>
                      <option value="flight">Flight</option>
                      <option value="off_road">Off Road</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-200 block mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficulty: e.target.value as any,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-200 block mb-1">
                      Distance (km) {autoCalculatedTypes.includes(formData.route_type) ? '📏 Auto' : '✏️ Manual'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        disabled={autoCalculatedTypes.includes(formData.route_type)}
                        value={isNaN(formData.distance_km) ? '' : formData.distance_km}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            distance_km: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0,
                          })
                        }
                        className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 smooth-transition text-xs ${
                          autoCalculatedTypes.includes(formData.route_type)
                            ? 'opacity-70 cursor-not-allowed'
                            : ''
                        }`}
                        placeholder={
                          autoCalculatedTypes.includes(formData.route_type)
                            ? 'Calculating...'
                            : 'Enter distance'
                        }
                      />
                      {isCalculating && autoCalculatedTypes.includes(formData.route_type) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-200 block mb-1">
                      Travel Time (hrs) {autoCalculatedTypes.includes(formData.route_type) ? '🕐 Auto' : '✏️ Manual'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        disabled={autoCalculatedTypes.includes(formData.route_type)}
                        value={isNaN(formData.travel_time_hours) ? '' : formData.travel_time_hours}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            travel_time_hours: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0,
                          })
                        }
                        className={`w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 smooth-transition text-xs ${
                          autoCalculatedTypes.includes(formData.route_type)
                            ? 'opacity-70 cursor-not-allowed'
                            : ''
                        }`}
                        placeholder={
                          autoCalculatedTypes.includes(formData.route_type)
                            ? 'Calculating...'
                            : 'Enter time'
                        }
                      />
                      {isCalculating && autoCalculatedTypes.includes(formData.route_type) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 smooth-transition h-14 text-xs resize-none"
                    placeholder="Route details..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-white/10 hover:bg-white/20 smooth-transition px-3 py-1.5 rounded-lg font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 smooth-transition px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50 text-xs"
                  >
                    {isLoading ? 'Adding...' : 'Add Route'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddRouteModal;
