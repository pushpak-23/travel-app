import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMapStore } from '@/store/mapStore';

export default function StateGroupList() {
  const { 
    locationGroups, 
    selectedState, 
    selectedItinerary,
    selectState, 
    selectItinerary,
    setLocationGroups,
    isLoading 
  } = useMapStore();

  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());

  // Fetch grouped locations on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/grouped`);
        if (response.ok) {
          const data = await response.json();
          setLocationGroups(data);
          // Expand first state by default
          const firstState = Object.keys(data)[0];
          if (firstState) {
            setExpandedStates(new Set([firstState]));
          }
        }
      } catch (error) {
        console.error('Error fetching grouped locations:', error);
      }
    };

    fetchGroups();
  }, [setLocationGroups]);

  const toggleStateExpanded = (state: string) => {
    setExpandedStates((prev) => {
      const next = new Set(prev);
      if (next.has(state)) {
        next.delete(state);
      } else {
        next.add(state);
      }
      return next;
    });
  };

  const handleStateClick = (state: string) => {
    selectState(state === selectedState ? null : state);
    if (state !== selectedState) {
      toggleStateExpanded(state);
    }
  };

  const handleItineraryClick = (itinerary: string) => {
    selectItinerary(itinerary === selectedItinerary ? null : itinerary);
  };

  const states = Object.keys(locationGroups).sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {states.length === 0 ? (
        <div className="text-gray-400 text-sm py-4 text-center">No locations grouped yet</div>
      ) : (
        states.map((state) => {
          const isExpanded = expandedStates.has(state);
          const isSelected = selectedState === state;
          const itineraries = locationGroups[state];
          const totalLocations = Object.values(itineraries).reduce(
            (sum, locs) => sum + locs.length,
            0
          );

          return (
            <div key={state} className="space-y-1">
              {/* State Group Header */}
              <motion.button
                onClick={() => handleStateClick(state)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-sm smooth-transition ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-400/50 text-emerald-100'
                    : 'bg-white/8 hover:bg-white/12 text-gray-200 hover:text-gray-100 border border-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 flex-1 text-left">
                  <motion.span
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▶
                  </motion.span>
                  <span className="text-base">📍</span>
                  <div className="flex-1">
                    <div>{state}</div>
                    <div className="text-xs text-gray-400">{totalLocations} locations</div>
                  </div>
                </div>
              </motion.button>

              {/* Itineraries - Collapsible */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: isExpanded ? 'auto' : 0,
                  opacity: isExpanded ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden space-y-1 pl-4"
              >
                {Object.entries(itineraries).map(([itinerary, locations]) => (
                  <motion.button
                    key={`${state}-${itinerary}`}
                    onClick={() => handleItineraryClick(itinerary)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm smooth-transition ${
                      selectedItinerary === itinerary && selectedState === state
                        ? 'bg-gradient-to-r from-teal-500/40 to-cyan-500/40 border border-teal-400/50 text-teal-100'
                        : 'bg-white/5 hover:bg-white/8 text-gray-300 hover:text-gray-100 border border-white/5'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 flex-1 text-left">
                      <span className="text-xs">{'•'}</span>
                      <div className="flex-1">
                        <div className="font-medium">{itinerary}</div>
                        <div className="text-xs text-gray-400">{locations.length} places</div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          );
        })
      )}
    </div>
  );
}
