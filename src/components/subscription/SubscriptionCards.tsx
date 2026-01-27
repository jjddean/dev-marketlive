import React, { useState, useEffect } from "react";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils"; // Standard Shadcn utility
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface SubscriptionCardsProps {
    currentTier: string;
    onUpgrade: (priceId: string, planId: string) => void;
}

const plans = [
    {
        id: "free",
        name: "Free",
        price: "0",
        priceId: "price_free", // Placeholder
        features: ["Up to 5 shipments/mo", "Basic support"],
        fullSpecs: { shipments: "5/mo", api: "No access", support: "Email only" }
    },
    {
        id: "pro",
        name: "Pro",
        price: "49",
        priceId: "price_1StLAaElmOA4YPwbAXH9o3Z0",
        features: ["Unlimited shipments", "Priority support", "Advanced Analytics"],
        fullSpecs: { shipments: "Unlimited", api: "1k calls/day", support: "24/7 Priority" }
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "149",
        priceId: "price_1StLDoElmOA4YPwbgS6cTUMP",
        features: ["Dedicated Account Manager", "Custom Integrations", "SLA Guarantees"],
        fullSpecs: { shipments: "Unlimited", api: "Custom", support: "White-glove" }
    },
];

export default function SubscriptionCards({ currentTier, onUpgrade }: SubscriptionCardsProps) {
    // Local state for the "Active/Viewed" card. Default to current tier if valid, else Pro.
    const [selectedPlanId, setSelectedPlanId] = useState("pro");

    // Sync selected plan with current tier on mount/change, if desired. 
    // Or we keep them separate as per user request (Card Click = Info, Button = Action).
    // Let's default to highlighting the current plan if it exists in our list.
    useEffect(() => {
        if (plans.some(p => p.id === currentTier)) {
            setSelectedPlanId(currentTier);
        }
    }, [currentTier]);


    return (
        <div className="space-y-8">
            {/* 1. THE CARDS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                    // "isActive" controls the visual selection (border, shadow, checkmark)
                    const isActive = selectedPlanId === plan.id;
                    const isCurrentPlan = currentTier === plan.id;

                    return (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlanId(plan.id)}
                            className={cn(
                                "relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 flex flex-col h-full",
                                isActive
                                    ? "border-primary bg-white shadow-lg ring-1 ring-primary"
                                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                            )}
                        >
                            {/* Primary Checkmark for Active (Selected) State */}
                            {isActive && (
                                <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 shadow-sm">
                                    <Check size={16} strokeWidth={3} />
                                </div>
                            )}

                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                {plan.name}
                            </h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-2xl font-bold">£{plan.price}</span>
                                <span className="text-xs text-slate-400">/mo</span>
                            </div>

                            <ul className="space-y-2 mb-8 flex-1">
                                {plan.features.map((feat) => (
                                    <li key={feat} className="text-xs flex items-center text-slate-600">
                                        <Check className="mr-2 text-primary" size={14} /> {feat}
                                    </li>
                                ))}
                            </ul>

                            {/* Button Click vs Card Click: Button logic stays separate */}
                            <Button
                                variant={isActive ? "default" : "outline"}
                                className="w-full text-xs h-9 mt-auto"
                                disabled={isCurrentPlan}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents card selection from re-triggering
                                    if (!isCurrentPlan) {
                                        onUpgrade(plan.priceId, plan.id);
                                    }
                                }}
                            >
                                {isCurrentPlan ? "Current Plan" : "Upgrade"}
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* 2. "THE PRO WAY" - DRAWER FOR DATA-RICH SPECS */}
            <div className="flex justify-center">
                <Sheet>
                    <SheetTrigger asChild>
                        <button className="text-xs font-medium text-slate-500 hover:text-primary flex items-center gap-1.5 underline underline-offset-4">
                            <Info size={14} />
                            Compare all technical features & API limits
                        </button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-md bg-white">
                        <SheetHeader>
                            <SheetTitle className="text-lg font-bold">Plan Comparison</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <ComparisonTable activePlanId={selectedPlanId} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}

function ComparisonTable({ activePlanId }: { activePlanId: string }) {
    const specs = [
        { label: "Monthly Shipments", free: "5", pro: "Unlimited", ent: "Unlimited" },
        { label: "API Rate Limit", free: "N/A", pro: "1,000/day", ent: "Unlimited" },
        { label: "GeoRisk Navigator", free: "Limited", pro: "Full Access", ent: "Custom" },
        { label: "Team Members", free: "1", pro: "Up to 10", ent: "Unlimited" },
    ];

    const getValue = (spec: any, planId: string) => {
        if (planId === 'free') return spec.free;
        if (planId === 'pro') return spec.pro;
        if (planId === 'enterprise') return spec.ent;
        return spec.pro;
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b">
                    <tr>
                        <th className="p-3 font-semibold">Feature</th>
                        <th className={cn("p-3", "text-primary")}>
                            {activePlanId.charAt(0).toUpperCase() + activePlanId.slice(1)} Specs
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {specs.map((spec) => (
                        <tr key={spec.label} className="hover:bg-slate-50/50">
                            <td className="p-3 font-medium text-slate-600">{spec.label}</td>
                            <td className="p-3 text-slate-900">{getValue(spec, activePlanId)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
