"use client";

import React from "react";

interface ShipmentMapProps {
    shipments: any[];
    focusedId?: string | null;
    className?: string;
    height?: number;
}

export default function ShipmentMap({
    shipments,
    focusedId,
    className,
    height = 360,
}: ShipmentMapProps) {
    return (
        <div className={className} style={{ height }}>
            <div className="flex items-center justify-center h-full bg-slate-50 text-slate-500 rounded-lg border border-slate-200">
                <div className="text-center">
                    <span className="text-2xl block mb-2">🗺️</span>
                    <span className="text-sm">Map visualization temporarily unavailable</span>
                </div>
            </div>
        </div>
    );
}
