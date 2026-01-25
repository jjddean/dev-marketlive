import { useState, useMemo, useEffect } from "react";
// @ts-ignore
import Map, { Source, Layer, Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Ship, Plane, Search, ArrowRight, TrendingUp } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Default to World View
const INITIAL_VIEW_STATE = {
    longitude: -20,
    latitude: 30,
    zoom: 1.5,
};

const ROUTES: Record<string, { start: [number, number], end: [number, number] }> = {
    "shanghai": {
        start: [121.4737, 31.2304], // Shanghai
        end: [-2.2426, 53.4808],    // Manchester
    },
    "new_york": {
        start: [-74.006, 40.7128],  // NYC
        end: [-2.2426, 53.4808],    // Manchester
    }
};

export const InteractiveHero = () => {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
    const [activeRoute, setActiveRoute] = useState<any>(null);
    const [showResults, setShowResults] = useState(false);

    // Mock "Search" Effect
    const handleSearch = () => {
        if (!origin) return; // Only require Origin for the demo hook

        // Simulate "Finding Route"
        const routeKey = origin.toLowerCase().includes("shanghai") ? "shanghai" : "new_york";
        const route = ROUTES[routeKey] || ROUTES["shanghai"]; // Default fallbacks 

        // Set line geometry
        const geojson = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [route.start, route.end]
            }
        };

        setActiveRoute(geojson);

        // Zoom to route bounds (simplified pan for now)
        setViewState({
            longitude: (route.start[0] + route.end[0]) / 2,
            latitude: (route.start[1] + route.end[1]) / 2,
            zoom: 3
        });

        setTimeout(() => setShowResults(true), 1500); // Reveal cards after map animation
    };

    return (
        <div className="relative w-full h-[600px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
            {/* Mapbox Layer */}
            {MAPBOX_TOKEN ? (
                <Map
                    {...viewState}
                    onMove={(evt: any) => setViewState(evt.viewState)}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    scrollZoom={false}
                >
                    {activeRoute && (
                        <Source id="route" type="geojson" data={activeRoute}>
                            <Layer
                                id="route-line"
                                type="line"
                                layout={{ "line-join": "round", "line-cap": "round" }}
                                paint={{ "line-color": "#003366", "line-width": 4, "line-opacity": 0.8 }}
                            />
                        </Source>
                    )}
                </Map>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                    Mapbox Token Missing
                </div>
            )}

            {/* Overlay UI: Quote Search */}
            <div className="absolute top-8 left-8 z-10 w-[380px]">
                <Card className="bg-white/95 backdrop-blur shadow-xl border-0">
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Live Rate Engine</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Get Instant Quotes</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-slate-500 ml-1">Origin</label>
                                <Input
                                    placeholder="e.g. Shanghai, China"
                                    className="bg-slate-50 border-slate-200"
                                    value={origin}
                                    onChange={e => setOrigin(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 ml-1">Destination</label>
                                <Input
                                    placeholder="e.g. Manchester, UK"
                                    className="bg-slate-50 border-slate-200"
                                    value={destination}
                                    onChange={e => setDestination(e.target.value)}
                                />
                            </div>
                            <Button size="lg" className="w-full bg-primary hover:bg-primary-700" onClick={handleSearch}>
                                <Search className="w-4 h-4 mr-2" />
                                Search Routes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Simulated Results - "The Hook" */}
            {showResults && (
                <div className="absolute bottom-6 right-6 z-10 w-[360px] animate-in slide-in-from-bottom-5 fade-in duration-500">
                    <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-blue-100/50">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                                </span>
                                <h3 className="font-bold text-slate-800 text-sm">Live Rates Found</h3>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">ID: Q-29482</span>
                        </div>
                        <div className="space-y-3">
                            <MockQuoteCard
                                carrier="Maersk Line"
                                type="sea"
                                days="32 days"
                                price="$1,240"
                                badges={['Direct', 'Carbon Neutral']}
                                logo="🚢"
                            />
                            <MockQuoteCard
                                carrier="Qatar Airways"
                                type="air"
                                days="3 days"
                                price="$4,850"
                                badges={['Express', 'Door-to-Door']}
                                logo="✈️"
                            />
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100/50 text-center">
                            <Button
                                size="sm"
                                className="w-full bg-primary hover:bg-primary-700 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                                onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                Unlock & Book these Rates
                                <ArrowRight className="w-3 h-3 ml-1.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MockQuoteCard = ({ carrier, type, days, price, badges, logo }: any) => (
    <div className="flex items-center justify-between p-3.5 bg-white rounded-lg border border-slate-100 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group">
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${type === 'sea' ? 'bg-primary-50' : 'bg-secondary-50'}`}>
                {logo}
            </div>
            <div>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1">
                    {carrier}
                    {type === 'air' && <Zap className="w-3 h-3 text-secondary-500 fill-secondary-500" />}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium text-slate-500">{days}</span>
                    <div className="flex gap-1">
                        {badges.map((b: string) => (
                            <span key={b} className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                                {b}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className="text-right">
            <p className="font-bold text-primary-600 text-base">{price}</p>
            <span className="text-[10px] text-slate-400 font-medium">USD</span>
        </div>
    </div>
);
