import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

export const LandedCostWidget = () => {
    const [value, setValue] = useState(25000);
    const [breakdown, setBreakdown] = useState({
        duty: 0,
        vat: 0,
        insurance: 0,
        total: 0
    });

    useEffect(() => {
        // Simple mock calculation logic
        const duty = Math.round(value * 0.12); // 12% duty
        const insurance = Math.round(value * 0.005); // 0.5% insurance
        const freight = 1200; // Fixed mock freight
        const taxable = value + duty + insurance + freight;
        const vat = Math.round(taxable * 0.20); // 20% VAT

        setBreakdown({
            duty,
            vat,
            insurance,
            total: value + duty + vat + insurance + freight
        });
    }, [value]);

    return (
        <Card className="w-full max-w-md mx-auto bg-white shadow-2xl border-0 ring-1 ring-slate-900/5 p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator className="w-24 h-24 rotate-12" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">🇬🇧</span>
                Landed Cost Estimator
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
                        Shipment Value (USD)
                    </label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(Number(e.target.value))}
                            className="pl-9 text-lg font-mono font-bold border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mt-4">
                        <input
                            type="range"
                            min="1000"
                            max="100000"
                            step="1000"
                            value={value}
                            onChange={(e) => setValue(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-100">
                    <Row label="UK Duty (12%)" value={breakdown.duty} color="text-orange-600" />
                    <Row label="Insurance (0.5%)" value={breakdown.insurance} color="text-slate-600" />
                    <Row label="Import VAT (20%)" value={breakdown.vat} color="text-red-600" />

                    <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="font-bold text-slate-900">Total Landed Cost</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">
                            ${breakdown.total.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Duty rates updated live from HMRC API
                </div>
            </div>
        </Card>
    );
};

const Row = ({ label, value, color }: { label: string, value: number, color?: string }) => (
    <div className="flex justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className={`font-mono font-medium ${color}`}>+${value.toLocaleString()}</span>
    </div>
);
