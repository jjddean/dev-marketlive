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
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-6 relative">
                            <span className="text-4xl">🚀</span>
                            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
                                #{referralData.position}
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">You're in the queue!</h2>
                        <p className="text-slate-600">
                            Current Position: <span className="font-bold text-[#003057]">#{referralData.position}</span>
                        </p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
                        <h3 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
                            <span className="text-xl">🎟️</span> Your Golden Ticket
                        </h3>
                        <p className="text-blue-700/80 text-sm mb-4">
                            Refer 5 friends to skip the line and get instant access to the Rate Engine.
                        </p>

                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-200">
                            <code className="flex-1 font-mono text-sm text-slate-600 px-2 truncate">
                                {shareUrl}
                            </code>
                            <Button
                                size="sm"
                                className="bg-[#003057] hover:bg-[#002040] text-white"
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
                        className="w-full h-12 text-slate-600 hover:text-[#003057] hover:border-[#003057]"
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003057]/10 border border-[#003057]/20 text-[#003057] text-xs font-semibold uppercase tracking-wide mb-6">
                        <span className="w-2 h-2 rounded-full bg-[#003057] animate-pulse"></span>
                        <span className="text-[#003057]">
                            Limited Early Access 2026
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight max-w-4xl mx-auto">
                        Freight Forwarding That Actually <br className="hidden md:block" />
                        <span className="text-[#003057]">Gives You Control</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Instant quotes. Real-time tracking. Platform oversight on every high-risk step.
                        Built for forwarders who want software power without losing the human safety net.
                    </p>
                </div>

                {/* TRUST SIGNALS: Logos */}
                <div className="mb-20 pt-8 border-t border-slate-100">
                    <p className="text-center text-xs font-semibold text-[#003057]/80 uppercase tracking-widest mb-8 flex items-center justify-center gap-2">
                        Trusted by modern logistics teams at 🤝
                    </p>
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-70 hover:opacity-100 transition-all duration-500">
                        {/* Logos now using Brand Blue */}
                        <div className="h-8 font-bold text-slate-800 hover:text-[#003057] text-xl flex items-center gap-2 transition-colors"><Globe className="w-6 h-6 text-[#003057]" /> GlobalFreight</div>
                        <div className="h-8 font-bold text-slate-800 hover:text-[#003057] text-xl flex items-center gap-2 transition-colors"><Ship className="w-6 h-6 text-[#003057]" /> OceanBlue</div>
                        <div className="h-8 font-bold text-slate-800 hover:text-[#003057] text-xl flex items-center gap-2 transition-colors"><Zap className="w-6 h-6 text-[#003057]" /> FastTrack</div>
                        <div className="h-8 font-bold text-slate-800 hover:text-[#003057] text-xl flex items-center gap-2 transition-colors"><ShieldCheck className="w-6 h-6 text-[#003057]" /> SecureCargo</div>
                    </div>
                </div>

                {/* VISUAL HOOK: Interactive Map */}
                <div className="mb-24">
                    <InteractiveHero />
                </div>

                {/* "HIDDEN GEMS" Feature Showcase */}
                <div className="mb-24 space-y-20">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide mb-4">
                            <span className="text-lg">👁️</span> Hidden Features
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Software That Sees What You Miss</h2>
                        <p className="text-lg text-slate-600">Most platforms just show you where your ship is. We tell you what it costs and if it's going to be late.</p>
                    </div>

                    {/* Feature 1: Landed Cost */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                            <img
                                src="/features/landed-cost.png"
                                alt="Landed Cost Calculator"
                                className="relative rounded-xl shadow-2xl border border-slate-200 transform group-hover:-translate-y-1 transition duration-500"
                            />
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="w-12 h-12 bg-[#003057]/10 rounded-xl flex items-center justify-center mb-6 shadow-sm shadow-blue-200">
                                <span className="text-2xl">🧮</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Total Landed Cost. <span className="text-[#003057]">Before You Book.</span></h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Stop guessing your margins. MarketLive calculates Duty, VAT, and Insurance alongside freight costs instantly.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-slate-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-[#003057]" /> Auto-calculated UK Duty Rates 🇬🇧
                                </li>
                                <li className="flex items-center gap-2 text-slate-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-[#003057]" /> VAT & Deferment tracking 📊
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Feature 2: Risk Engine */}
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 shadow-sm shadow-blue-200">
                                <span className="text-2xl">🌪️</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">See the Storm <span className="text-[#003057]">Before it Hits.</span></h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Our Predictive Risk Engine analyzes weather patterns, strikes, and port congestion.
                            </p>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-800 font-medium flex gap-2">
                                    <span>⚠️</span> "Save 48 hours of delay by avoiding JFK Terminal 4 this week."
                                </p>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                            <img
                                src="/features/risk-engine.png"
                                alt="Predictive Risk Engine"
                                className="relative rounded-xl shadow-2xl border border-slate-200 transform group-hover:-translate-y-1 transition duration-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Waitlist Form Section */}
                <div id="waitlist-form" className="max-w-xl mx-auto bg-slate-50 rounded-2xl p-10 border border-slate-200 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#003057] via-blue-800 to-[#003057]"></div>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Join the Inner Circle 🚀</h2>
                        <p className="text-slate-500">Unlock the Rate Engine. Secure your early access spot.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                type="text"
                                placeholder="Full Name 👤"
                                className="h-12 bg-white border-slate-200 focus:border-[#003057] focus:ring-[#003057]"
                            // We'd add name state here if we wanted, for now just focus on company
                            />
                            <Input
                                type="text"
                                placeholder="Company Name 🏢"
                                className="h-12 bg-white border-slate-200 focus:border-[#003057] focus:ring-[#003057]"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                required
                            />
                        </div>
                        <Input
                            type="email"
                            placeholder="work@company.com 📧"
                            className="h-12 text-lg bg-white border-slate-200 focus:border-[#003057] focus:ring-[#003057]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Select onValueChange={setRole}>
                            <SelectTrigger className="h-12 text-slate-600 text-base bg-white border-slate-200 focus:border-[#003057] focus:ring-[#003057]">
                                <SelectValue placeholder="I am a... 💼" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="freight_forwarder">Freight Forwarder</SelectItem>
                                <SelectItem value="broker">Broker</SelectItem>
                                <SelectItem value="shipper">Shipper</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button size="lg" className="h-14 text-lg font-bold bg-[#003057] hover:bg-[#002040] w-full shadow-lg shadow-slate-300 transition-all hover:scale-[1.01]" disabled={loading}>
                            {loading ? 'Securing Spot...' : 'Get Early Access ⚡'}
                            {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                        </Button>
                    </form>
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                        <ShieldCheck className="w-3 h-3 text-[#003057]" /> No spam. Unsubscribe anytime.
                    </div>
                </div>

                {/* Social Proof / Wall of Love */}
                <div className="pt-24 pb-8">
                    <h3 className="text-center font-bold text-slate-900 mb-12 flex items-center justify-center gap-2">
                        <span className="text-2xl">💙</span> Loved by early adopters
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <TestimonialCard
                            quote="Finally, a platform that doesn't feel like Windows 95. The rate lookup is insanely fast."
                            author="Sarah J."
                            role="Head of Logistics, TechImport"
                        />
                        <TestimonialCard
                            quote="The risk engine saved us from a massive delay at Felixstowe. Paid for itself instantly."
                            author="David M."
                            role="Freight Manager, EuroTrade"
                        />
                        <TestimonialCard
                            quote="Landed cost calculator is a game changer for our DDP shipments."
                            author="Alex R."
                            role="Ops Director, FastFwd"
                        />
                    </div>
                </div>
            </div>

            {/* Feature Grid (Secondary) */}
            <div className="bg-slate-50 py-20 border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<ShieldCheck className="w-6 h-6 text-[#003057]" />}
                        title="AI Compliance"
                        desc="Auto-check sanctions and parsing documents in seconds."
                    />
                    <FeatureCard
                        icon={<Globe className="w-6 h-6 text-indigo-600" />}
                        title="Real-time Tracking"
                        desc="Hybrid visibility for Air, Sea, and Land freight."
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6 text-amber-500" />}
                        title="Instant Quotes"
                        desc="Dynamic pricing engine with margin management."
                    />
                </div>
            </div>

            {/* Footer */}
            <footer className="py-8 text-center text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} MarketLive Logistics. Manchester, UK.
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm">{desc}</p>
    </div>
);

const TestimonialCard = ({ quote, author, role }: any) => (
    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative shadow-sm hover:shadow-md transition-all">
        <div className="text-4xl text-[#003057]/20 font-serif absolute top-4 left-4 font-bold opacity-30">“</div>
        <p className="text-slate-700 italic mb-6 relative z-10 pt-4 leading-relaxed">"{quote}"</p>
        <div className="flex items-center gap-3 border-t border-slate-200 pt-4">
            <div className="w-10 h-10 bg-[#003057]/10 rounded-full flex items-center justify-center font-bold text-[#003057] text-sm ring-2 ring-white shadow-sm">
                {author.charAt(0)}
            </div>
            <div>
                <p className="font-bold text-slate-900 text-sm">{author}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{role}</p>
            </div>
        </div>
    </div>
);

export default WaitlistPage;
