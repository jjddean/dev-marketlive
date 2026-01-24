import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Ship, CheckCircle2, ArrowRight, ShieldCheck, Globe, Zap } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { InteractiveHero } from './InteractiveHero';
import { LiveRiskWidget } from '@/components/marketing/LiveRiskWidget';
import { LandedCostWidget } from '@/components/marketing/LandedCostWidget';

const WaitlistPage = () => {
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Capture UTM params if available
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const source = searchParams.get('utm_source') || 'direct';
    const refCode = searchParams.get('ref') || undefined;

    const joinWaitlist = useMutation(api.marketing.joinWaitlist);

    // State for success dashboard
    const [referralData, setReferralData] = useState<{ code: string; position: number } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        setLoading(true);
        try {
            const result = await joinWaitlist({
                email,
                company: company || 'Unknown',
                role: role || 'other',
                source,
                ref: refCode
            });

            // @ts-ignore - The mutation returns extra data now
            if (result.success) {
                // @ts-ignore
                setReferralData({ code: result.referralCode, position: result.position });
                setSubmitted(true);
                toast.success("You're on the list!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted && referralData) {
        const shareUrl = `${window.location.origin}/access?ref=${referralData.code}`;

        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500"></div>

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 rounded-full mb-6 relative">
                            <span className="text-4xl">🚀</span>
                            <div className="absolute -bottom-2 -right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                                #{referralData.position}
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-primary-900 mb-2">You're in the queue!</h2>
                        <p className="text-slate-600">
                            Current Position: <span className="font-bold text-primary-800">#{referralData.position}</span>
                        </p>
                    </div>

                    <div className="bg-primary-50 rounded-xl p-6 mb-8 border border-primary-100">
                        <h3 className="text-primary-900 font-bold mb-2 flex items-center gap-2">
                            <span className="text-xl">🎟️</span> Your Golden Ticket
                        </h3>
                        <p className="text-primary-700/80 text-sm mb-4">
                            Refer 5 friends to skip the line and get instant access to the Rate Engine.
                        </p>

                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-primary-200">
                            <code className="flex-1 font-mono text-sm text-primary-700 px-2 truncate">
                                {shareUrl}
                            </code>
                            <Button
                                size="sm"
                                className="bg-primary hover:bg-primary-800 text-white"
                                onClick={() => {
                                    navigator.clipboard.writeText(shareUrl);
                                    toast.success("Link copied!");
                                }}
                            >
                                Copy
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <div className="text-2xl font-bold text-slate-900">0</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Referrals</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg opacity-50">
                            <div className="text-2xl font-bold text-slate-400">5</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Goal</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg opacity-50">
                            <div className="text-2xl font-bold text-slate-400">Locked</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Access</div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="w-full h-12 text-slate-600 hover:text-primary hover:border-primary"
                        onClick={() => window.location.href = 'https://linkedin.com/in/jason-heo'}
                    >
                        Connect with Founder on LinkedIn 🤝
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header Removed - Using Global Navbar */}

            {/* Hero Section */}
            <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wide mb-6">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-primary">
                            Limited Early Access 2026
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-primary-950 tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
                        Next-Generation <br className="hidden md:block" />
                        <span className="text-primary">Freight Operating System</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Streamline global operations with AI-driven quotes, real-time visibility, and automated compliance. The complete operating system for modern forwarders.
                    </p>
                </div>



                {/* VISUAL HOOK: Interactive Map */}
                <div className="mb-24">
                    <InteractiveHero />
                </div>

                {/* "HIDDEN GEMS" Feature Showcase */}
                <div className="mb-24 space-y-20">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wide mb-4">
                            <span className="text-lg">🛡️</span> Enterprise Infrastructure
                        </div>
                        <h2 className="text-2xl font-bold text-primary-900 mb-4">Operational Efficiency & Control</h2>
                        <p className="text-base text-slate-600">A hybrid platform designed for scale, compliance, and proactive risk mitigation.</p>
                    </div>

                    {/* Feature 1: Landed Cost */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                            {/* LIVE COMPONENT REPLACEMENT */}
                            <div className="relative transform group-hover:-translate-y-1 transition duration-500">
                                <LandedCostWidget />
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 shadow-sm shadow-primary-200">
                                <span className="text-2xl">🧮</span>
                            </div>
                            <h3 className="text-2xl font-bold text-primary-900 mb-4">Financial Precision. <span className="text-primary-600">Automated.</span></h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Instant landed cost calculations including Duty, VAT, and insurance for complete margin visibility.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-slate-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-primary" /> Auto-calculated UK Duty Rates 🇬🇧
                                </li>
                                <li className="flex items-center gap-2 text-slate-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-primary" /> VAT & Deferment tracking 📊
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Feature 2: Risk Engine */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6 shadow-sm shadow-primary-200">
                                <span className="text-2xl">🌪️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-primary-900 mb-4">Predictive Risk Modeling</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Data-driven analysis of port congestion, weather patterns, and global disruption events.
                            </p>
                            <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                                <p className="text-sm text-primary-800 font-medium flex gap-2">
                                    <span>⚠️</span> "Save 48 hours of delay by avoiding JFK Terminal 4 this week."
                                </p>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                            {/* LIVE COMPONENT REPLACEMENT */}
                            <div className="relative transform group-hover:-translate-y-1 transition duration-500">
                                <LiveRiskWidget />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Services Section - Integrated from HomePage */}
                <div className="pt-24 pb-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wide mb-6">
                                <span className="text-lg">📦</span> Everything You Need
                            </div>
                            <h2 className="text-3xl font-bold text-primary-900 mb-4">Core Services</h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Comprehensive freight forwarding solutions designed for modern global trade
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-primary/20 group">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="text-secondary text-2xl">📋</span>
                                </div>
                                <h3 className="text-lg font-bold text-primary-900 mb-3">Quote & Booking</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Instant quotes for UK-EU, UK-US, UK-Asia shipping lanes with direct booking capability.</p>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-primary/20 group">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="text-secondary text-2xl">📄</span>
                                </div>
                                <h3 className="text-lg font-bold text-primary-900 mb-3">Digital Docs</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Streamlined creation and exchange of Bills of Lading, Air Waybills, and commercial invoices.</p>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-primary/20 group">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="text-secondary text-2xl">📍</span>
                                </div>
                                <h3 className="text-lg font-bold text-primary-900 mb-3">Real-Time Track</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Live shipment updates integrated with carrier APIs for complete visibility.</p>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-primary/20 group">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="text-secondary text-2xl">💳</span>
                                </div>
                                <h3 className="text-lg font-bold text-primary-900 mb-3">Secure Payments</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Integrated payment processing with transparent invoicing and billing management.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Waitlist Form Section */}
                <div id="waitlist-form" className="max-w-xl mx-auto bg-white rounded-3xl p-10 border border-primary/10 shadow-2xl shadow-primary/5 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none"></div>

                    <div className="relative text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-4 text-2xl shadow-sm">🚀</div>
                        <h2 className="text-3xl font-bold text-primary-900 mb-2">Join the Inner Circle</h2>
                        <p className="text-slate-500">Unlock the Rate Engine. Secure your early access spot.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                type="text"
                                placeholder="Full Name"
                                className="h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                            // We'd add name state here if we wanted, for now just focus on company
                            />
                            <Input
                                type="text"
                                placeholder="Company Name"
                                className="h-12 bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                required
                            />
                        </div>
                        <Input
                            type="email"
                            placeholder="work@company.com"
                            className="h-12 text-lg bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all font-medium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Select onValueChange={setRole}>
                            <SelectTrigger className="h-12 text-slate-600 text-base bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all">
                                <SelectValue placeholder="I am a..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="freight_forwarder">Freight Forwarder</SelectItem>
                                <SelectItem value="broker">Broker</SelectItem>
                                <SelectItem value="shipper">Shipper</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button size="lg" className="h-14 text-lg font-bold bg-primary hover:bg-primary-700 w-full shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]" disabled={loading}>
                            {loading ? 'Securing Spot...' : 'Get Early Access'}
                            {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                        </Button>
                    </form>
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-primary" /> No spam. Unsubscribe anytime.
                    </div>
                </div>


            </div>



            {/* Footer */}
            <footer className="py-8 text-center text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} MarketLive Logistics. Manchester, UK.
            </footer>
        </div>
    );
};



export default WaitlistPage;
