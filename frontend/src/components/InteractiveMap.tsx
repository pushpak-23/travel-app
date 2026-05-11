'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapStore } from '@/store/mapStore';
import { motion } from 'framer-motion';

// Fix for missing marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const InteractiveMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const polylinesRef = useRef<{ [key: string]: L.Polyline }>({});

  const { locations, routes, selectedLocation, mapCenter, mapZoom, selectLocation, filteredLocations, selectedState } = useMapStore();

  const toFiniteNumber = (value: unknown): number | null => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const toLatLngPair = (lat: unknown, lng: unknown): [number, number] | null => {
    const safeLat = toFiniteNumber(lat);
    const safeLng = toFiniteNumber(lng);
    if (safeLat === null || safeLng === null) return null;
    return [safeLat, safeLng];
  };

  const buildFlightArc = (
    start: [number, number],
    end: [number, number]
  ): [number, number][] => {
    const points: [number, number][] = [];
    const [lat1, lng1] = start;
    const [lat2, lng2] = end;
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;

    // Perpendicular offset for a smooth curved flight arc.
    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    const curvature = 0.2;
    const controlLat = midLat + (-dx / length) * length * curvature;
    const controlLng = midLng + (dy / length) * length * curvature;

    for (let t = 0; t <= 1; t += 0.025) {
      const lat = (1 - t) * (1 - t) * lat1 + 2 * (1 - t) * t * controlLat + t * t * lat2;
      const lng = (1 - t) * (1 - t) * lng1 + 2 * (1 - t) * t * controlLng + t * t * lng2;
      points.push([lat, lng]);
    }

    return points;
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map with OpenStreetMap tiles (disable default zoom controls)
    map.current = L.map(mapContainer.current, { zoomControl: false }).setView(mapCenter as L.LatLngExpression, mapZoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
      className: 'leaflet-tiles-dark',
    }).addTo(map.current);

    // Add zoom controls
    L.control.zoom({ position: 'topright' }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add/update markers when locations change
  useEffect(() => {
    if (!map.current) return;

    const visibleLocations = selectedState ? filteredLocations : locations;

    visibleLocations.forEach((location) => {
      // Remove old marker if exists
      if (markersRef.current[location.id]) {
        map.current!.removeLayer(markersRef.current[location.id]);
      }

      // Create custom marker with category color
      const categoryColors: { [key: string]: string } = {
        city: '#0ea5e9',      // sky
        village: '#10b981',    // green
        town: '#3b82f6',       // blue
        trek: '#f97316',       // orange
        stay: '#8b5cf6',       // purple
        cafe: '#eab308',       // yellow
        hidden_gem: '#ec4899', // pink
      };

      const color = categoryColors[location.category] || '#6366f1';

      const customIcon = L.divIcon({
        html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">📍</div>`,
        iconSize: [30, 30],
        className: 'custom-marker',
      });

      const marker = L.marker([location.latitude, location.longitude], {
        icon: customIcon,
      })
        .bindPopup(`
          <div style="font-weight: bold; margin-bottom: 5px;">${location.name}</div>
          <div style="font-size: 12px; color: #666;">${location.category}</div>
          <div style="font-size: 12px; margin-top: 5px;">Priority: ${'⭐'.repeat(location.priority)}</div>
        `)
        .on('click', () => {
          selectLocation(location);
        })
        .addTo(map.current!);

      markersRef.current[location.id] = marker;
    });
  }, [locations, filteredLocations, selectedState, selectLocation]);

  // Add/update routes when routes change
  useEffect(() => {
    if (!map.current) return;

    // Remove old polylines
    Object.values(polylinesRef.current).forEach((polyline) => {
      map.current!.removeLayer(polyline);
    });
    polylinesRef.current = {};

    // Route type colors
    const routeColors: { [key: string]: string } = {
      road: '#3b82f6',      // blue
      trek: '#f97316',      // orange
      scenic: '#10b981',    // green
      off_road: '#ef4444',  // red
      train: '#f59e0b',     // amber
      flight: '#a855f7',    // violet
    };

    const fetchAndDrawRoutes = async () => {
      for (const route of routes) {
        const startLocation = locations.find((l) => l.id === route.start_location_id);
        const endLocation = locations.find((l) => l.id === route.end_location_id);

        if (selectedState) {
          if (startLocation?.state !== selectedState && endLocation?.state !== selectedState) {
            continue;
          }
        }

        if (!startLocation || !endLocation) continue;

        const startPoint = toLatLngPair(startLocation.latitude, startLocation.longitude);
        const endPoint = toLatLngPair(endLocation.latitude, endLocation.longitude);
        if (!startPoint || !endPoint) continue;

        const color = routeColors[route.route_type] || '#6366f1';

        if (route.route_type === 'flight') {
          const arcCoordinates = buildFlightArc(
            startPoint,
            endPoint
          );

          const flightPolyline = L.polyline(arcCoordinates, {
            color,
            weight: 3,
            opacity: 0.85,
            dashArray: '10, 8',
          })
            .bindPopup(`
              <div style="font-weight: bold; margin-bottom: 5px;">
                ✈️ ${startLocation.name} → ${endLocation.name}
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Type: <strong>${route.route_type}</strong>
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Distance: <strong>${route.distance_km || 0}km</strong>
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Time: <strong>${route.travel_time_hours || 0}h</strong>
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Difficulty: <strong>${route.difficulty || 'unknown'}</strong>
              </div>
              ${route.description ? `<div style="font-size: 12px; margin: 5px 0; font-style: italic;">${route.description}</div>` : ''}
            `)
            .addTo(map.current!);

          polylinesRef.current[route.id] = flightPolyline;
          continue;
        }

        if (route.route_type === 'off_road') {
          const offRoadPolyline = L.polyline(
            [
              startPoint,
              endPoint,
            ],
            {
              color,
              weight: 3,
              opacity: 0.8,
              dashArray: '3, 8',
            }
          )
            .bindPopup(`
              <div style="font-weight: bold; margin-bottom: 5px;">
                ${startLocation.name} → ${endLocation.name}
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Type: <strong>${route.route_type}</strong>
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Distance: <strong>${route.distance_km || 0}km</strong>
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Time: <strong>${route.travel_time_hours || 0}h</strong>
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Difficulty: <strong>${route.difficulty || 'unknown'}</strong>
              </div>
              ${route.description ? `<div style="font-size: 12px; margin: 5px 0; font-style: italic;">${route.description}</div>` : ''}
            `)
            .addTo(map.current!);

          polylinesRef.current[route.id] = offRoadPolyline;
          continue;
        }

        const profile = route.route_type === 'trek' ? 'foot' : 'driving';

        try {
          // Fetch route from OSRM (Open Street Routing Machine)
          const coords = `${startPoint[1]},${startPoint[0]};${endPoint[1]},${endPoint[0]}`;
          const osrmResponse = await fetch(
            `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson`
          );
          const osrmData = await osrmResponse.json();

          if (osrmData.routes && osrmData.routes.length > 0) {
            // Extract coordinates from OSRM response
            const routeCoordinates = osrmData.routes[0].geometry.coordinates
              .map((coord: [number, number]) => toLatLngPair(coord[1], coord[0]))
              .filter((coord: [number, number] | null): coord is [number, number] => coord !== null);

            if (routeCoordinates.length < 2) {
              continue;
            }

            const polyline = L.polyline(routeCoordinates, {
              color,
              weight: route.route_type === 'train' ? 4 : 3,
              opacity: 0.8,
              dashArray:
                route.route_type === 'trek'
                  ? '5, 5'
                  : route.route_type === 'train'
                  ? '8, 6'
                  : 'none',
            })
              .bindPopup(`
                <div style="font-weight: bold; margin-bottom: 5px;">
                  ${startLocation.name} → ${endLocation.name}
                </div>
                <div style="font-size: 12px; margin: 5px 0;">
                  Type: <strong>${route.route_type}</strong>
                </div>
                <div style="font-size: 12px; margin: 5px 0;">
                  Distance: <strong>${route.distance_km || 0}km</strong>
                </div>
                <div style="font-size: 12px; margin: 5px 0;">
                  Time: <strong>${route.travel_time_hours || 0}h</strong>
                </div>
                <div style="font-size: 12px; margin: 5px 0;">
                  Difficulty: <strong>${route.difficulty || 'unknown'}</strong>
                </div>
                ${route.description ? `<div style="font-size: 12px; margin: 5px 0; font-style: italic;">${route.description}</div>` : ''}
              `)
              .addTo(map.current!);

            polylinesRef.current[route.id] = polyline;
          }
        } catch (error) {
          console.error('Failed to fetch route from OSRM:', error);
          // Fallback to straight line if OSRM fails
          const polyline = L.polyline(
            [
              [startLocation.latitude, startLocation.longitude],
              [endLocation.latitude, endLocation.longitude],
            ],
            {
              color,
              weight: 3,
              opacity: 0.8,
              dashArray: route.route_type === 'trek' ? '5, 5' : 'none',
            }
          )
            .bindPopup(`
              <div style="font-weight: bold; margin-bottom: 5px;">
                ${startLocation.name} → ${endLocation.name}
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Type: <strong>${route.route_type}</strong>
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Distance: <strong>${route.distance_km || 0}km</strong>
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Time: <strong>${route.travel_time_hours || 0}h</strong>
              </div>
              <div style="font-size: 12px; margin: 5px 0;">
                Difficulty: <strong>${route.difficulty || 'unknown'}</strong>
              </div>
              ${route.description ? `<div style="font-size: 12px; margin: 5px 0; font-style: italic;">${route.description}</div>` : ''}
            `)
            .addTo(map.current!);

          polylinesRef.current[route.id] = polyline;
        }
      }
    };

    fetchAndDrawRoutes();
  }, [routes, locations, selectedState]);


  // Update map when selected location changes
  useEffect(() => {
    if (selectedLocation && map.current) {
      map.current.flyTo([selectedLocation.latitude, selectedLocation.longitude], 14, {
        duration: 0.8,
      });
    }
  }, [selectedLocation]);

  // Fix map resize when container dimensions change (e.g., sidebar collapse)
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (map.current) {
        setTimeout(() => map.current?.invalidateSize(), 50);
      }
    });

    if (mapContainer.current) {
      observer.observe(mapContainer.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      ref={mapContainer}
      className="w-full h-full rounded-xl overflow-hidden shadow-2xl"
      style={{ zIndex: 1 }}
    />
  );
};

export default InteractiveMap;
