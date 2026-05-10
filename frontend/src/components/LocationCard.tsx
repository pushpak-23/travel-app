'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMapStore } from '@/store/mapStore';

export const LocationCard: React.FC = () => {
  const { selectedLocation } = useMapStore();

  if (!selectedLocation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="glass-effect p-6 text-center text-gray-300"
      >
        <p>Select a location on the map to view details</p>
      </motion.div>
    );
  }

  const categoryColors: { [key: string]: string } = {
    village: 'bg-emerald-600',
    town: 'bg-sky-600',
    trek: 'bg-amber-600',
    stay: 'bg-cyan-600',
    cafe: 'bg-yellow-600',
    hidden_gem: 'bg-teal-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 rounded-xl space-y-4 bg-gradient-to-br from-emerald-950/35 via-slate-900/55 to-slate-950/60 border border-emerald-500/20"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            {selectedLocation.name}
          </h3>
          <div className="flex gap-2 flex-wrap">
            <span
              className={`${
                categoryColors[selectedLocation.category] || 'bg-gray-500'
              } text-white text-xs px-3 py-1 rounded-full font-semibold`}
            >
              {selectedLocation.category}
            </span>
            {selectedLocation.visited && (
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                ✓ Visited
              </span>
            )}
          </div>
        </div>
        <div className="text-3xl">
          {'⭐'.repeat(selectedLocation.priority)}
        </div>
      </div>

      <p className="text-gray-200 text-sm">
        {selectedLocation.description}
      </p>

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
        <div>
          <p className="text-xs text-gray-400">Latitude</p>
          <p className="text-sm font-mono text-cyan-300">
            {parseFloat(String(selectedLocation.latitude)).toFixed(4)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Longitude</p>
          <p className="text-sm font-mono text-cyan-300">
            {parseFloat(String(selectedLocation.longitude)).toFixed(4)}
          </p>
        </div>
      </div>

      {selectedLocation.tags.length > 0 && (
        <div className="pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {selectedLocation.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-white/10 text-xs px-2 py-1 rounded text-gray-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-3">
        <button 
          onClick={() => alert(`📍 ${selectedLocation.name}\n\n${selectedLocation.description || 'No description'}\n\nCategory: ${selectedLocation.category}\nPriority: ${selectedLocation.priority}/5`)}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700 smooth-transition px-3 py-2 rounded-lg text-xs font-semibold"
        >
          📋 Details
        </button>
        <button 
          onClick={() => alert('📝 Note feature coming soon!')}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 smooth-transition px-3 py-2 rounded-lg text-xs font-semibold"
        >
          📝 Notes
        </button>
      </div>
    </motion.div>
  );
};

export default LocationCard;
