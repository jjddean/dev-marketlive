import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, CloudRain, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const LiveRiskWidget = () => {
    const [analyzing, setAnalyzing] = useState(true);
    const [riskScore, setRiskScore] = useState(0);

    // Simulate analysis on mount
    useEffect(() => {
        const interval = setInterval(() => {
            setAnalyzing(prev => !prev);
        }, 5000);

        // Initial animation
        let start = 0;
        const animateScore = setInterval(() => {
            start += 2;
            if (start >= 84) {
                clearInterval(animateScore);
                setAnalyzing(false);
            }
            setRiskScore(start);
        }, 30);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="w-full max-w-md mx-auto overflow-hidden bg-white shadow-2xl border-0 ring-1 ring-slate-900/5 transform transition-all hover:scale-[1.02] hover:shadow-3xl">
            {/* Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${analyzing ? 'bg-amber-400 animate-ping' : 'bg-green-500'}`}></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {analyzing ? 'AI Analyzing Route...' : 'Prediction Ready'}
                    </span>
                </div>
                <Sparkles className="w-4 h-4 text-purple-600" />
            </div>

            <div className="p-6">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-1">Delay Probability</h3>
                        <div className="text-5xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1">
                            {riskScore}%
                            <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full transform -translate-y-4">High Risk</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-400">Target ETA</div>
                        <div className="font-mono text-slate-700">AUG 12</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-8">
                    <div
                        className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-100 ease-out"
                        style={{ width: `${riskScore}%` }}
                    />
                </div>

                {/* Risk Factors */}
                <div className="space-y-3">
                    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-500 ${analyzing ? 'opacity-50 blur-[1px]' : 'opacity-100 bg-red-50/50 border-red-100'}`}>
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900">Port Congestion</h4>
                            <p className="text-xs text-slate-600">JFK Terminal 4 dwell time up 48h.</p>
                        </div>
                    </div>

                    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-700 delay-100 ${analyzing ? 'opacity-50 blur-[1px]' : 'opacity-100 bg-orange-50/50 border-orange-100'}`}>
                        <CloudRain className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900">Weather Alert</h4>
                            <p className="text-xs text-slate-600">Atlantic storm front moving East.</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-green-50/50 border-green-100 opacity-100">
                        <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-slate-900">Compliance OK</h4>
                            <p className="text-xs text-slate-600">Sanctions check passed.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};
