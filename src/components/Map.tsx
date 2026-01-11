'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { Pub } from '@/types';
import { formatPrice } from '@/lib/utils';

interface MapProps {
  pubs: Pub[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPubSelect?: (pub: Pub) => void;
}

export default function Map({ pubs, center, zoom = 13, onPubSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [selectedPub, setSelectedPub] = useState<Pub | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Default center: Dublin city center
  const defaultCenter = center || { lat: 53.3498, lng: -6.2603 };

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError('Google Maps API key is not configured');
      return;
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
    });

    loader
      .load()
      .then(() => {
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom,
            styles: [
              { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#666666' }] },
              {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d4d4d4' }],
              },
              {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#666666' }],
              },
              {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#263c3f' }],
              },
              {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#6b9a76' }],
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#38414e' }],
              },
              {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#212a37' }],
              },
              {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9ca5b3' }],
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#169b62' }],
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#0f7a4b' }],
              },
              {
                featureType: 'road.highway',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#f3d19c' }],
              },
              {
                featureType: 'transit',
                elementType: 'geometry',
                stylers: [{ color: '#2f3948' }],
              },
              {
                featureType: 'transit.station',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }],
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }],
              },
              {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#515c6d' }],
              },
              {
                featureType: 'water',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#17263c' }],
              },
            ],
          });

          setMap(mapInstance);
        }
      })
      .catch((e) => {
        setError('Failed to load Google Maps');
        console.error(e);
      });
  }, [defaultCenter, zoom]);

  // Add markers when map is ready
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));

    // Create new markers
    const newMarkers = pubs
      .filter((pub) => pub.latitude && pub.longitude)
      .map((pub) => {
        const marker = new google.maps.Marker({
          position: { lat: pub.latitude!, lng: pub.longitude! },
          map,
          title: pub.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#169b62',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          setSelectedPub(pub);
          if (onPubSelect) {
            onPubSelect(pub);
          }
        });

        return marker;
      });

    setMarkers(newMarkers);

    // Fit bounds if we have markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach((marker) => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds);

      // Don't zoom in too much
      const listener = google.maps.event.addListener(map, 'idle', () => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom > 16) {
          map.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, pubs, onPubSelect]);

  if (error) {
    return (
      <div className="bg-stout-800 rounded-lg border border-stout-700 p-8 text-center">
        <p className="text-stout-400">{error}</p>
        <p className="text-sm text-stout-500 mt-2">
          Please check your Google Maps API configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Selected pub info */}
      {selectedPub && (
        <div className="absolute bottom-4 left-4 right-4 bg-stout-800 rounded-lg border border-stout-700 p-4 max-w-sm">
          <button
            onClick={() => setSelectedPub(null)}
            className="absolute top-2 right-2 text-stout-400 hover:text-cream-100"
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
            href={`/pubs/${selectedPub.id}`}
            className="inline-block bg-irish-green-600 hover:bg-irish-green-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            View Details
          </a>
        </div>
      )}
    </div>
  );
}
