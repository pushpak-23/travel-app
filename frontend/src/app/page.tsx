'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import LocationCard from '@/components/LocationCard';
import LocationsList from '@/components/LocationsList';
import StateGroupList from '@/components/StateGroupList';
import RoutesList from '@/components/RoutesList';
import AddLocationModal from '@/components/AddLocationModal';
import AddRouteModal from '@/components/AddRouteModal';

// Dynamically import map with no SSR
const InteractiveMap = dynamic(() => import('@/components/InteractiveMap'), {
  ssr: false,
});

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<'locations' | 'routes'>('locations');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');
  const [locationCategories] = useState<string[]>(['all', 'village', 'town', 'trek', 'stay', 'cafe', 'hidden_gem']);

  return (
    <main className="w-full h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950 overflow-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.14) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(14, 116, 144, 0.12) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 40%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="w-full h-full"
        />
      </div>



      <div className="relative z-10 h-full flex gap-4 p-4">
        {/* Sidebar */}
        <motion.div
          animate={{ width: showSidebar ? '380px' : '0px' }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden flex-shrink-0"
        >
          <div className="glass-effect rounded-xl h-full overflow-hidden flex flex-col p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-5 flex-shrink-0 pb-3 border-b border-white/10">
              <h1 className="text-2xl font-bold gradient-text">🗺️ Travel Map</h1>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-400 hover:text-white hover:bg-white/10 smooth-transition text-lg rounded-md p-1"
              >
                ✕
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 bg-white/8 p-1 rounded-lg flex-shrink-0 backdrop-blur">
              <button
                onClick={() => setActiveTab('locations')}
                className={`flex-1 px-2 py-2 rounded-md text-sm font-semibold smooth-transition ${
                  activeTab === 'locations'
                    ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                📍 Locations
              </button>
              <button
                onClick={() => setActiveTab('routes')}
                className={`flex-1 px-2 py-2 rounded-md text-sm font-semibold smooth-transition ${
                  activeTab === 'routes'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                🛤️ Routes
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto min-h-0 mb-3 pr-2">
              {activeTab === 'locations' ? (
                <>
                  {/* View Mode Toggle for Locations */}
                  <div className="flex gap-2 mb-3 bg-white/5 p-1 rounded-lg flex-shrink-0">
                    <button
                      onClick={() => setViewMode('grouped')}
                      className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium smooth-transition ${
                        viewMode === 'grouped'
                          ? 'bg-teal-500/40 text-teal-100 border border-teal-400/50'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      🗂️ Groups
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium smooth-transition ${
                        viewMode === 'list'
                          ? 'bg-emerald-500/40 text-emerald-100 border border-emerald-400/50'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                      }`}
                    >
                      📋 List
                    </button>
                  </div>

                  {/* Locations Content */}
                  <div className="mb-4">
                    {viewMode === 'grouped' ? (
                      <StateGroupList />
                    ) : (
                      <LocationsList filterCategory={filterCategory} onFilterChange={setFilterCategory} />
                    )}
                  </div>

                  {/* Location Details */}
                  <div className="pt-3 border-t border-white/10">
                    <LocationCard />
                  </div>
                </>
              ) : (
                <>
                  {/* Routes List */}
                  <div>
                    <RoutesList />
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons - Context Aware */}
            <div className="space-y-3 flex-shrink-0 pt-2">
              {activeTab === 'locations' ? (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 active:from-blue-700 active:to-cyan-700 smooth-transition px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl text-white"
                >
                  <span className="text-lg">+</span> Add Location
                </button>
              ) : (
                <button
                  onClick={() => setIsRouteModalOpen(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 active:from-green-700 active:to-teal-700 smooth-transition px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl text-white"
                >
                  <span className="text-lg">+</span> Add Route
                </button>
              )}
              
              {/* Filter Button - Expandable Section */}
              {activeTab === 'locations' && (
                <div className="space-y-2">
                  <button 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`w-full smooth-transition px-4 py-2.5 rounded-lg font-semibold text-sm border flex items-center justify-between gap-2 transition-all ${
                      showFilterMenu
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-100'
                        : 'bg-white/10 hover:bg-white/15 border-white/20 text-gray-300 hover:text-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      🎯 {filterCategory !== 'all' ? `${filterCategory.replace('_', ' ')}` : 'Filter'}
                    </span>
                    <motion.span
                      animate={{ rotate: showFilterMenu ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      ▼
                    </motion.span>
                  </button>

                  {/* Filter Options - Inline Pills */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: showFilterMenu ? 'auto' : 0,
                      opacity: showFilterMenu ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                    style={{ pointerEvents: showFilterMenu ? 'auto' : 'none' }}
                  >
                    <div className="flex flex-wrap gap-2 pt-2">
                      {locationCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat);
                          }}
                          className={`px-3 py-1.5 text-xs font-medium smooth-transition flex items-center justify-center gap-1 rounded-full whitespace-nowrap ${
                            filterCategory === cat
                              ? 'bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md'
                              : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-gray-100 border border-white/10'
                          }`}
                        >
                          {filterCategory === cat && <span>✓</span>}
                          <span>{cat === 'all' ? '🎯 All' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Map Container */}
        <motion.div
          layout
          className="flex-1 h-full"
        >
          <div className="relative h-full">
            <InteractiveMap />

            {/* Toggle Sidebar Button */}
            {!showSidebar && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setShowSidebar(true)}
                className="absolute bottom-6 left-6 bg-emerald-600 hover:bg-emerald-700 smooth-transition px-4 py-2 rounded-lg font-semibold z-20 flex items-center gap-2"
              >
                ☰ Menu
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Location Modal */}
      <AddLocationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Add Route Modal */}
      <AddRouteModal isOpen={isRouteModalOpen} onClose={() => setIsRouteModalOpen(false)} />
    </main>
  );
}
