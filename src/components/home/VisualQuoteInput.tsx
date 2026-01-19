import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Search, Plane, Ship, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- GEOLOCATION MOCK ---
// In a real app, we'd use OpenCage or Google Places API
const PORTS: Record<string, [number, number]> = {
    'London': [51.5074, -0.1278],
    'New York': [40.7128, -74.0060],
    'Shanghai': [31.2304, 121.4737],
    'Singapore': [1.3521, 103.8198],
    'Dubai': [25.2048, 55.2708],
    'Los Angeles': [34.0522, -118.2437],
    'Hamburg': [53.5511, 9.9937],
    'Mumbai': [19.0760, 72.8777]
};

// Component to adjust map view bounds automatically
function MapController({ p1, p2 }: { p1?: [number, number], p2?: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (p1 && p2) {
            const bounds = L.latLngBounds([p1, p2]);
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        } else if (p1) {
            map.flyTo(p1, 5, { animate: true });
        }
    }, [p1, p2, map]);
    return null;
}

interface VisualQuoteInputProps {
    onSearch: (data: { origin: string; destination: string }) => void;
}

export const VisualQuoteInput: React.FC<VisualQuoteInputProps> = ({ onSearch }) => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [searching, setSearching] = useState(false);

    // Coordinates
    const coordsOrigin = PORTS[Object.keys(PORTS).find(k => k.toLowerCase() === origin.toLowerCase()) || ''];
    const coordsDest = PORTS[Object.keys(PORTS).find(k => k.toLowerCase() === destination.toLowerCase()) || ''];

    const handleSearch = () => {
        if (!origin || !destination) {
            toast.error("Please enter both Origin and Destination");
            return;
        }

        setSearching(true);
        // Simulate "calculating routes"
        setTimeout(() => {
            setSearching(false);
            onSearch({ origin, destination });
        }, 1500);
    };

    return (
        <div className="relative w-full h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-slate-50">
            {/* 1. The Interactive Map Background */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    zoomControl={false}
                >
                    <TileLayer
                        // CartoDB Voyager is cleaner for UI backgrounds than OSM
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    {/* Visual Markers */}
                    {coordsOrigin && <Marker position={coordsOrigin}></Marker>}
                    {coordsDest && <Marker position={coordsDest}></Marker>}

                    {/* The Line (Route) */}
                    {coordsOrigin && coordsDest && (
                        <Polyline
                            positions={[coordsOrigin, coordsDest]}
                            pathOptions={{ color: '#003366', weight: 3, dashArray: '10, 10', opacity: 0.7 }}
                        />
                    )}

                    <MapController p1={coordsOrigin} p2={coordsDest} />
                </MapContainer>
            </div>

            {/* 2. Floating Glassmorphism Input Bar */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl z-10">
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/50 space-y-4">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-primary-900">Where are you shipping?</h2>
                        <p className="text-slate-500">Instant multi-modal quotes powered by AI.</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center relative">
                        {/* Origin */}
                        <div className="flex-1 relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                            </div>
                            <input
                                type="text"
                                list="ports"
                                className="block w-full pl-8 pr-3 py-4 text-lg border-transparent bg-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Origin (e.g. London)"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                            />
                        </div>

                        {/* Connector Arrow */}
                        <div className="hidden md:flex text-slate-400">
                            <ArrowRight className="w-6 h-6" />
                        </div>

                        {/* Destination */}
                        <div className="flex-1 relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                            </div>
                            <input
                                type="text"
                                list="ports"
                                className="block w-full pl-8 pr-3 py-4 text-lg border-transparent bg-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                placeholder="Destination (e.g. New York)"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />
                        </div>

                        {/* Action Button */}
                        <Button
                            size="lg"
                            className="w-full md:w-auto h-14 px-8 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105"
                            onClick={handleSearch}
                            disabled={searching}
                        >
                            {searching ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Calculating...</>
                            ) : (
                                <><Search className="w-5 h-5 mr-2" /> Search Rates</>
                            )}
                        </Button>
                    </div>

                    {/* Quick Mode Selectors (Visual Only for now) */}
                    <div className="flex justify-center gap-6 pt-4 text-sm text-slate-500 border-t border-slate-100 mt-4">
                        <span className="flex items-center gap-2"><Ship className="w-4 h-4" /> Ocean Freight</span>
                        <span className="flex items-center gap-2"><Plane className="w-4 h-4" /> Air Freight</span>
                    </div>

                </div>
            </div>

            {/* Datalist for Autocomplete Mock */}
            <datalist id="ports">
                {Object.keys(PORTS).map(port => (
                    <option key={port} value={port} />
                ))}
            </datalist>

        </div>
    );
};
