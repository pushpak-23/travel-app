'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMapStore, Location } from '@/store/mapStore';
import { locationAPI } from '@/lib/api';
import { normalizeStateName } from '@/lib/state';

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
  name: string;
  class?: string;
  type?: string;
  addresstype?: string;
}

const detectCategoryFromSearchResult = (result: SearchResult): Location['category'] => {
  const classValue = (result.class || '').toLowerCase();
  const typeValue = (result.type || '').toLowerCase();
  const addressTypeValue = (result.addresstype || '').toLowerCase();
  const combined = `${typeValue} ${addressTypeValue}`;

  if (classValue === 'amenity' && combined.includes('cafe')) return 'cafe';
  if (combined.includes('hotel') || combined.includes('guest_house') || combined.includes('resort') || combined.includes('hostel')) return 'stay';
  if ((classValue === 'natural' && (combined.includes('peak') || combined.includes('ridge') || combined.includes('valley'))) || combined.includes('trail') || combined.includes('trek')) return 'trek';

  if (combined.includes('city') || combined.includes('metropolis') || combined.includes('municipality')) return 'city';
  if (combined.includes('town')) return 'town';
  if (combined.includes('village') || combined.includes('hamlet') || combined.includes('suburb') || combined.includes('neighbourhood')) return 'village';

  // Default to town for unknown settlements to avoid always biasing to village.
  return 'town';
};

const extractStateFromDisplayName = (displayName: string) => {
  const parts = displayName.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return '';
  }

  const knownCountryTokens = new Set(['india', 'bharat']);
  const filtered = parts.filter((part) => !knownCountryTokens.has(part.toLowerCase()));
  if (filtered.length < 2) {
    return '';
  }

  return filtered[filtered.length - 2] || '';
};

const reverseGeocodeState = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    if (!response.ok) {
      return '';
    }

    const data = await response.json();
    const address = data?.address || {};
    return (
      address.state ||
      address.state_district ||
      address.county ||
      address.region ||
      ''
    );
  } catch (error) {
    console.error('Reverse geocode failed:', error);
    return '';
  }
};

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addLocation } = useMapStore();
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    category: Location['category'];
    priority: number;
    tags: string;
    state?: string;
    itinerary_name?: string;
  }>({
    name: '',
    description: '',
    latitude: 31.7683,
    longitude: 77.1734,
    category: 'village',
    priority: 3,
    tags: '',
    state: '',
    itinerary_name: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(true);
  const [categoryDetectionHint, setCategoryDetectionHint] = useState('');

  const categoryOptions: Location['category'][] = ['city', 'town', 'village', 'trek', 'stay', 'cafe', 'hidden_gem'];

  // Search places using Nominatim API (free, no API key needed)
  useEffect(() => {
    const searchPlaces = async () => {
      if (searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}&limit=5&countrycodes=IN`
        );
        const results = await response.json();
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchPlaces, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectPlace = (result: SearchResult) => {
    const detectedCategory = detectCategoryFromSearchResult(result);
    const detectedState = normalizeStateName(extractStateFromDisplayName(result.display_name));

    setFormData((prev) => ({
      ...prev,
      name: result.name || result.display_name.split(',')[0],
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      category: detectedCategory,
      state: detectedState,
      itinerary_name: 'General', // Default itinerary for auto-added locations
    }));

    setCategoryDetectionHint(
      `Auto-selected: ${detectedCategory.replace('_', ' ')}${detectedState ? ` in ${detectedState}` : ''}`
    );
    setSearchQuery('');
    setSearchResults([]);
    setShowManualEntry(true); // Show the form so user can review/edit before submitting
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Location name is required');
      return;
    }

    setIsLoading(true);

    try {
      const tags = formData.tags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);

      const resolvedState = normalizeStateName(
        formData.state?.trim() ||
        (await reverseGeocodeState(
          parseFloat(String(formData.latitude)) || 31.7683,
          parseFloat(String(formData.longitude)) || 77.1734
        ))
      );

      const response = await locationAPI.create({
        name: formData.name.trim(),
        description: formData.description.trim(),
        latitude: parseFloat(String(formData.latitude)) || 31.7683,
        longitude: parseFloat(String(formData.longitude)) || 77.1734,
        category: formData.category,
        priority: Math.min(5, Math.max(1, parseInt(String(formData.priority)) || 3)),
        tags,
        state: resolvedState || undefined,
        itinerary_name: formData.itinerary_name?.trim() || undefined,
        visited: false,
      } as any);

      addLocation(response.data);
      onClose();
      setFormData({
        name: '',
        description: '',
        latitude: 31.7683,
        longitude: 77.1734,
        category: 'village',
        priority: 3,
        tags: '',
        state: '',
        itinerary_name: '',
      });
      setSearchQuery('');
      setCategoryDetectionHint('');
    } catch (error: any) {
      console.error('Failed to create location:', error);
      setError(
        error.response?.data?.message || 'Failed to create location. Please try again.'
      );
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
            <div className="glass-effect p-5 rounded-2xl space-y-2 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto">
              <h2 className="text-xl font-bold gradient-text">Add New Location</h2>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-2 pb-1">
                {/* Quick Search */}
                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-1">
                    🔍 Search Place (Himachal Pradesh)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                      placeholder="e.g., Shimla, Manali, Triund..."
                    />
                    {isSearching && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        ⟳
                      </span>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto w-96 max-w-[calc(100vw-2rem)]">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPlace(result)}
                          className="w-full text-left px-3 py-2 hover:bg-white/10 smooth-transition border-b border-white/5 last:border-b-0"
                        >
                          <div className="text-xs font-semibold text-blue-300">
                            {result.name || result.display_name.split(',')[0]}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {result.display_name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Select Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className={`text-xs px-2 py-1.5 rounded-lg font-semibold smooth-transition ${
                      showManualEntry
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    📍 Manual Entry
                  </button>
                  <button
                    type="button"
                    disabled
                    className="text-xs px-2 py-1.5 rounded-lg font-semibold bg-white/10 text-gray-500 cursor-not-allowed opacity-50"
                  >
                    🗺️ Map Select (Soon)
                  </button>
                </div>

                {/* Manual Entry Fields */}
                {showManualEntry && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-200 block mb-1">
                        Location Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                        placeholder="e.g., Triund Trek"
                      />
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
                        placeholder="Add notes about this location..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-200 block mb-1">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={isNaN(formData.latitude) ? '' : formData.latitude}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              latitude:
                                e.target.value === '' ? 31.7683 : parseFloat(e.target.value) || 31.7683,
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-200 block mb-1">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          value={isNaN(formData.longitude) ? '' : formData.longitude}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              longitude:
                                e.target.value === '' ? 77.1734 : parseFloat(e.target.value) || 77.1734,
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-200 block mb-1">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              category: e.target.value as any,
                            });
                            setCategoryDetectionHint('Category selected manually');
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                        >
                          {categoryOptions.map((option) => (
                            <option key={option} value={option}>
                              {option === 'hidden_gem'
                                ? 'Hidden Gem'
                                : option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-200 block mb-1">
                          Priority (1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={isNaN(formData.priority) ? '' : formData.priority}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priority: e.target.value === '' ? 3 : parseInt(e.target.value) || 3,
                            })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                        />
                        {categoryDetectionHint && (
                          <p className="text-[11px] text-emerald-300 mt-1">{categoryDetectionHint}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-200 block mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) =>
                          setFormData({ ...formData, tags: e.target.value })
                        }
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                        placeholder="e.g., hiking, scenic, must-visit"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-semibold text-gray-200 block mb-1">
                          State/Region
                        </label>
                        <input
                          type="text"
                          value={formData.state || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                          placeholder="e.g., Himachal Pradesh"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-200 block mb-1">
                          Itinerary/Route Name
                        </label>
                        <input
                          type="text"
                          value={formData.itinerary_name || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, itinerary_name: e.target.value })
                          }
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 smooth-transition text-xs"
                          placeholder="e.g., Summer Trek 2024"
                        />
                      </div>
                    </div>
                  </>
                )}

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
                    {isLoading ? 'Adding...' : '✓ Add Location'}
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

export default AddLocationModal;
