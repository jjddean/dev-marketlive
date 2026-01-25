
import React, { useEffect, useState, useMemo } from 'react';
// @ts-ignore
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Ship, Package, Navigation } from 'lucide-react';

interface ShipmentMapProps {
    className?: string;
}

// Geocode city names to coordinates (simplified mapping)
// In a real app, this would use the Mapbox Geocoding API
const CITY_COORDS: Record<string, [number, number]> = {
    'London': [-0.1278, 51.5074], // Lng, Lat for Mapbox
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

interface MapPoint {
    id: string;
    lat: number;
    lng: number;
    label: string;
    status: string;
    origin: string;
    destination: string;
}

export function ShipmentMap({ className = '' }: ShipmentMapProps) {
    // Fetch live shipments
    const liveShipments = useQuery(api.shipments.listShipments, { onlyMine: true });
    const [mapData, setMapData] = useState<MapPoint[]>([]);
    const [popupInfo, setPopupInfo] = useState<MapPoint | null>(null);

    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

    useEffect(() => {
        if (!liveShipments) return;

        // Convert shipments to map data
        const shipmentLocations = liveShipments
            .filter((s: any) => s.shipmentDetails?.origin && s.shipmentDetails?.destination)
            .map((s: any) => {
                const originCity = s.shipmentDetails.origin.split(',')[0].trim();
                const destCity = s.shipmentDetails.destination.split(',')[0].trim();
                // Mapbox uses [Lng, Lat] order for coordinates in constants, but Marker takes simplified props
                // We stored them as [Lng, Lat] in CITY_COORDS
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
            });

        // Fallback to demo data if no shipments
        const displayData = shipmentLocations.length > 0 ? shipmentLocations : [
            { id: '1', lat: 51.5074, lng: -0.1278, label: 'London', status: 'In Transit', origin: 'London, UK', destination: 'Hamburg, DE' },
            { id: '2', lat: 40.7128, lng: -74.0060, label: 'New York', status: 'Delivered', origin: 'Shanghai, CN', destination: 'New York, US' },
            { id: '3', lat: 35.6762, lng: 139.6503, label: 'Tokyo', status: 'In Transit', origin: 'Singapore, SG', destination: 'Tokyo, JP' },
            { id: '4', lat: 1.3521, lng: 103.8198, label: 'Singapore', status: 'Loading', origin: 'Dubai, AE', destination: 'Singapore, SG' },
        ];

        setMapData(displayData);
    }, [liveShipments]);

    // Initial View State
    const initialViewState = {
        longitude: 0,
        latitude: 20,
        zoom: 1.5
    };

    if (!MAPBOX_TOKEN) {
        return (
            <div className={`h-full w-full flex items-center justify-center bg-gray-900 text-white ${className}`}>
                <p>Missing VITE_MAPBOX_TOKEN</p>
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-800 bg-slate-900 ${className}`}>
            <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                attributionControl={false}
            >
                {/* Controls */}
                <NavigationControl position="top-right" />
                <FullscreenControl position="top-right" />

                {/* Markers */}
                {mapData.map((shipment) => (
                    <Marker
                        key={shipment.id}
                        longitude={shipment.lng}
                        latitude={shipment.lat}
                        anchor="bottom"
                        onClick={(e: any) => {
                            // If we let the click propagate, it might close the popup immediately on some implementations
                            e.originalEvent.stopPropagation();
                            setPopupInfo(shipment);
                        }}
                    >
                        <div className="group cursor-pointer relative">
                            {/* Pulse effect for In Transit */}
                            {shipment.status === 'In Transit' && (
                                <div className="absolute -inset-2 bg-blue-500 rounded-full opacity-30 animate-ping group-hover:opacity-50"></div>
                            )}

                            <div className={`p-2 rounded-full shadow-lg transition-transform transform group-hover:scale-110 ${shipment.status === 'Delivered' ? 'bg-green-500 text-white' :
                                shipment.status === 'In Transit' ? 'bg-blue-500 text-white' :
                                    'bg-orange-500 text-white'
                                }`}>
                                <Ship size={16} />
                            </div>
                        </div>
                    </Marker>
                ))}

                {/* Popups */}
                {popupInfo && (
                    <Popup
                        anchor="top"
                        longitude={popupInfo.lng}
                        latitude={popupInfo.lat}
                        onClose={() => setPopupInfo(null)}
                        closeOnClick={false}
                        className="text-black"
                    >
                        <div className="p-1 min-w-[200px]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-sm text-gray-900">{popupInfo.id}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${popupInfo.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    popupInfo.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                    {popupInfo.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-start gap-2">
                                    <div className="w-4 mt-0.5"><Navigation size={12} /></div>
                                    <div>
                                        <span className="block text-[10px] uppercase text-gray-400">Origin</span>
                                        {popupInfo.origin}
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-4 mt-0.5"><Package size={12} /></div>
                                    <div>
                                        <span className="block text-[10px] uppercase text-gray-400">Destination</span>
                                        {popupInfo.destination}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    );
}
