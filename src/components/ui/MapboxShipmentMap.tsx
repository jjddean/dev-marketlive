import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxShipmentMapProps {
    className?: string;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Geocode city names to coordinates (simplified mapping)
const CITY_COORDS: Record<string, [number, number]> = {
    'London': [-0.1278, 51.5074],
    'Hamburg': [9.9937, 53.5511],
    'Shanghai': [121.4737, 31.2304],
    'Felixstowe': [1.3515, 51.9642],
    'Rotterdam': [4.4777, 51.9244],
    'Singapore': [103.8198, 1.3521],
    'Miami': [-80.1918, 25.7617],
    'Southampton': [-1.4044, 50.9097],
    'New York': [-74.0060, 40.7128],
    'Tokyo': [139.6503, 35.6762],
    'Dubai': [55.2708, 25.2048],
    'Long Beach': [-118.1937, 33.7701],
};

export function MapboxShipmentMap({ className = '' }: MapboxShipmentMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    // Fetch live shipments from Convex
    const liveShipments = useQuery(api.shipments.listShipments, { onlyMine: true });

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        // Initialize map
        mapboxgl.accessToken = MAPBOX_TOKEN;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [0, 20],
            zoom: 1.5,
            projection: { name: 'globe' } as any
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Update markers when shipments change
    useEffect(() => {
        if (!map.current || !liveShipments) return;

        // Wait for map to load
        if (!map.current.loaded()) {
            map.current.on('load', () => updateMapData());
        } else {
            updateMapData();
        }

        function updateMapData() {
            if (!map.current) return;

            // Clear existing markers and layers
            const markers = document.querySelectorAll('.mapbox-marker');
            markers.forEach(m => m.remove());

            if (map.current.getLayer('route')) {
                map.current.removeLayer('route');
            }
            if (map.current.getSource('route')) {
                map.current.removeSource('route');
            }

            // Convert shipments to map data
            const shipmentLocations = liveShipments
                ?.filter(s => s.shipmentDetails?.origin && s.shipmentDetails?.destination)
                .map(s => {
                    const originCity = s.shipmentDetails.origin.split(',')[0].trim();
                    const destCity = s.shipmentDetails.destination.split(',')[0].trim();
                    const coords = CITY_COORDS[destCity] || CITY_COORDS[originCity] || [0, 0];

                    return {
                        id: s.shipmentId,
                        lng: coords[0],
                        lat: coords[1],
                        label: destCity || originCity || 'Unknown',
                        status: s.status,
                        origin: s.shipmentDetails.origin,
                        destination: s.shipmentDetails.destination
                    };
                }) || [];

            // Fallback to demo data if no shipments
            const displayData = shipmentLocations.length > 0 ? shipmentLocations : [
                { id: '1', lat: 51.5074, lng: -0.1278, label: 'London', status: 'In Transit', origin: 'London, UK', destination: 'Hamburg, DE' },
                { id: '2', lat: 40.7128, lng: -74.0060, label: 'New York', status: 'Delivered', origin: 'Shanghai, CN', destination: 'New York, US' },
                { id: '3', lat: 35.6762, lng: 139.6503, label: 'Tokyo', status: 'In Transit', origin: 'Singapore, SG', destination: 'Tokyo, JP' },
                { id: '4', lat: 1.3521, lng: 103.8198, label: 'Singapore', status: 'Loading', origin: 'Dubai, AE', destination: 'Singapore, SG' },
            ];

            // Add route lines
            if (displayData.length > 1) {
                const coordinates = displayData.map(s => [s.lng, s.lat]);

                map.current!.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: coordinates
                        }
                    }
                });

                map.current!.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#003057',
                        'line-width': 2,
                        'line-opacity': 0.6
                    }
                });
            }

            // Add markers
            displayData.forEach((shipment) => {
                const el = document.createElement('div');
                el.className = 'mapbox-marker';
                el.style.width = '32px';
                el.style.height = '32px';
                el.style.borderRadius = '50%';
                el.style.cursor = 'pointer';
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
                el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

                // Color based on status
                if (shipment.status === 'Delivered') {
                    el.style.backgroundColor = '#10B981';
                } else if (shipment.status === 'In Transit') {
                    el.style.backgroundColor = '#3B82F6';
                } else {
                    el.style.backgroundColor = '#F59E0B';
                }

                el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
          <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
          <path d="M12 10v4"/>
          <path d="M12 2v3"/>
        </svg>`;

                const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
                    `<div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${shipment.id}</div>
            <div style="color: #666; font-size: 12px; margin-bottom: 2px;">${shipment.label}</div>
            <div style="color: #666; font-size: 11px;">${shipment.status}</div>
          </div>`
                );

                new mapboxgl.Marker(el)
                    .setLngLat([shipment.lng, shipment.lat])
                    .setPopup(popup)
                    .addTo(map.current!);
            });
        }
    }, [liveShipments]);

    return <div ref={mapContainer} className={`mapbox-container ${className}`} />;
}
