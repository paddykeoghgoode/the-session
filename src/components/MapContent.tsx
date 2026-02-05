'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { Pub } from '@/types';
import { formatPrice, getDistanceKm } from '@/lib/utils';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix for default marker icons in Leaflet with webpack
const createCustomIcon = (color: string = '#169b62') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24s12-15 12-24c0-6.627-5.373-12-12-12z" fill="${color}"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>
    `,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
};

const pubIcon = createCustomIcon('#169b62'); // Irish green
const userIcon = createCustomIcon('#3b82f6'); // Blue for user location
const dealIcon = createCustomIcon('#f59e0b'); // Amber for deals

interface MapContentProps {
  pubs: Pub[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPubSelect?: (pub: Pub) => void;
  showUserLocation?: boolean;
  radiusKm?: number;
}

// Component to recenter map when center changes
function MapRecenter({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [map, center.lat, center.lng, zoom]);

  return null;
}

// Component to fit bounds to all markers
function FitBounds({ pubs }: { pubs: Pub[] }) {
  const map = useMap();

  useEffect(() => {
    const validPubs = pubs.filter(pub => pub.latitude && pub.longitude);
    if (validPubs.length > 0) {
      const bounds = L.latLngBounds(
        validPubs.map(pub => [pub.latitude!, pub.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [map, pubs]);

  return null;
}

export default function MapContent({
  pubs,
  center,
  zoom = 13,
  onPubSelect,
  showUserLocation = false,
  radiusKm,
}: MapContentProps) {
  const [selectedPub, setSelectedPub] = useState<Pub | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Default center: Dublin city center
  const defaultCenter = center || { lat: 53.3498, lng: -6.2603 };

  // Get user location if requested
  useEffect(() => {
    if (showUserLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Could not get user location:', error.message);
        }
      );
    }
  }, [showUserLocation]);

  // Filter pubs by radius if user location and radius are set
  const filteredPubs = useMemo(() => {
    if (!userLocation || !radiusKm) return pubs;

    return pubs.filter(pub => {
      if (!pub.latitude || !pub.longitude) return false;
      const distance = getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        pub.latitude,
        pub.longitude
      );
      return distance <= radiusKm;
    });
  }, [pubs, userLocation, radiusKm]);

  const handlePubClick = (pub: Pub) => {
    setSelectedPub(pub);
    if (onPubSelect) {
      onPubSelect(pub);
    }
  };

  // Determine which icon to use for a pub
  const getIconForPub = (pub: Pub) => {
    // Use deal icon if pub has a cheapest price that seems like a deal
    if (pub.cheapest_guinness && pub.cheapest_guinness < 5.5) {
      return dealIcon;
    }
    return pubIcon;
  };

  const mapCenter = userLocation && showUserLocation ? userLocation : defaultCenter;

  return (
    <div className="relative h-full">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        className="w-full h-full rounded-lg"
        style={{ background: '#1a1a1a' }}
      >
        {/* Dark theme tile layer using CartoDB dark matter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* User location marker */}
        {userLocation && showUserLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>
                <div className="text-sm font-medium">Your Location</div>
              </Popup>
            </Marker>

            {/* Radius circle */}
            {radiusKm && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: '#169b62',
                  fillColor: '#169b62',
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            )}
          </>
        )}

        {/* Pub markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            const size = count < 10 ? 'small' : count < 50 ? 'medium' : 'large';
            return L.divIcon({
              html: `<div class="cluster-marker cluster-${size}">${count}</div>`,
              className: 'custom-cluster-icon',
              iconSize: L.point(40, 40, true),
            });
          }}
        >
          {filteredPubs
            .filter(pub => pub.latitude && pub.longitude)
            .map(pub => (
              <Marker
                key={pub.id}
                position={[pub.latitude!, pub.longitude!]}
                icon={getIconForPub(pub)}
                eventHandlers={{
                  click: () => handlePubClick(pub),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-semibold text-sm mb-1">{pub.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{pub.address}</p>
                    {pub.cheapest_guinness && (
                      <p className="text-xs text-green-600 font-medium mb-2">
                        Guinness: {formatPrice(pub.cheapest_guinness)}
                      </p>
                    )}
                    {userLocation && pub.latitude && pub.longitude && (
                      <p className="text-xs text-gray-500 mb-2">
                        {getDistanceKm(userLocation.lat, userLocation.lng, pub.latitude, pub.longitude).toFixed(1)} km away
                      </p>
                    )}
                    <a
                      href={`/pubs/${pub.slug || pub.id}`}
                      className="inline-block text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                    >
                      View Details
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>

        {/* Fit bounds to all pubs */}
        {filteredPubs.length > 1 && <FitBounds pubs={filteredPubs} />}
      </MapContainer>

      {/* Selected pub info card (mobile-friendly) */}
      {selectedPub && (
        <div className="absolute bottom-4 left-4 right-4 bg-stout-800 rounded-lg border border-stout-700 p-4 max-w-sm z-[1000]">
          <button
            onClick={() => setSelectedPub(null)}
            className="absolute top-2 right-2 text-stout-400 hover:text-cream-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-cream-100 mb-1 pr-6">{selectedPub.name}</h3>
          <p className="text-sm text-stout-400 mb-2">{selectedPub.address}</p>
          {selectedPub.cheapest_guinness && (
            <p className="text-sm text-irish-green-500 mb-3">
              Guinness: {formatPrice(selectedPub.cheapest_guinness)}
            </p>
          )}
          <a
            href={`/pubs/${selectedPub.slug || selectedPub.id}`}
            className="inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            View Details
          </a>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute top-4 right-4 bg-stout-800/90 backdrop-blur-sm rounded-lg border border-stout-700 p-3 z-[1000]">
        <div className="text-xs text-cream-100 font-medium mb-2">Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-stout-300">
            <div className="w-3 h-3 rounded-full bg-irish-green-500"></div>
            <span>Pub</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stout-300">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Good Deal</span>
          </div>
          {showUserLocation && (
            <div className="flex items-center gap-2 text-xs text-stout-300">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>You</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
