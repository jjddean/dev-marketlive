
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ShipmentMapProps {
    className?: string;
}

// Geocode city names to coordinates (simplified mapping)
const CITY_COORDS: Record<string, [number, number]> = {
    'London': [51.5074, -0.1278],
    'Hamburg': [53.5511, 9.9937],
    'Shanghai': [31.2304, 121.4737],
    'Felixstowe': [51.9642, 1.3515],
    'Rotterdam': [51.9244, 4.4777],
    'Singapore': [1.3521, 103.8198],
    'Miami': [25.7617, -80.1918],
    'Southampton': [50.9097, -1.4044],
    'New York': [40.7128, -74.0060],
    'Tokyo': [35.6762, 139.6503],
    'Dubai': [25.2048, 55.2708],
    'Long Beach': [33.7701, -118.1937],
};

export function ShipmentMap({ className = '' }: ShipmentMapProps) {
    // Fetch live shipments from Convex
    const liveShipments = useQuery(api.shipments.listShipments, { onlyMine: true });
    const [mapData, setMapData] = useState<any[]>([]);

    useEffect(() => {
        if (!liveShipments) return;

        // Convert shipments to map data
        const shipmentLocations = liveShipments
            .filter((s: any) => s.shipmentDetails?.origin && s.shipmentDetails?.destination)
            .map((s: any) => {
                const originCity = s.shipmentDetails.origin.split(',')[0].trim();
                const destCity = s.shipmentDetails.destination.split(',')[0].trim();
                const coords = CITY_COORDS[destCity] || CITY_COORDS[originCity] || [0, 0];

                return {
                    id: s.shipmentId,
                    lat: coords[0],
                    lng: coords[1],
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

    // Calculate center based on all points (simple average)
    const centerLab = mapData.length > 0
        ? [mapData.reduce((sum, p) => sum + p.lat, 0) / mapData.length, mapData.reduce((sum, p) => sum + p.lng, 0) / mapData.length] as [number, number]
        : [20, 0] as [number, number];

    return (
        <div className={`h-full w-full relative z-0 ${className}`}>
            <MapContainer center={centerLab} zoom={2} style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {mapData.map((shipment) => (
                    <Marker
                        key={shipment.id}
                        position={[shipment.lat, shipment.lng]}
                    >
                        <Popup>
                            <div className="p-2">
                                <div className="font-semibold mb-1">{shipment.id}</div>
                                <div className="text-gray-600 text-xs mb-1">{shipment.label}</div>
                                <div className={`text-xs font-medium ${shipment.status === 'Delivered' ? 'text-green-600' :
                                    shipment.status === 'In Transit' ? 'text-blue-600' : 'text-orange-600'
                                    }`}>
                                    {shipment.status}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Draw lines between origin/dest if we had full coords for both, 
                    but for now we just marker the destination/current location */}
            </MapContainer>
        </div>
    );
}
