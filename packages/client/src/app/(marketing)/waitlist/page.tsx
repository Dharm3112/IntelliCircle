"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import {
    Rocket,
    MapPin,
    Briefcase,
    Mail,
    CheckCircle2,
    Loader2,
    Sparkles,
    ArrowRight,
    ShieldCheck
} from "lucide-react";
import Link from 'next/link';
import toast, { Toaster } from "react-hot-toast";

export default function WaitlistPage() {
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [profession, setProfession] = useState("");
    const [location, setLocation] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");

    // Honeypot field (hidden from real users via CSS, blocks bots who auto-fill it)
    const [botField, setBotField] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            if (interests.length >= 5) {
                toast.error("Maximum 5 interest tags allowed.");
                return;
            }
            if (!interests.includes(currentTag.trim().toLowerCase())) {
                setInterests([...interests, currentTag.trim().toLowerCase()]);
            }
            setCurrentTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setInterests(interests.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Basic Bot Trap
        if (botField !== "") {
            // Fake success to trick bot net
            setSuccess(true);
            return;
        }

        if (interests.length === 0) {
            toast.error("Please add at least one professional interest.");
            return;
        }

        setIsLoading(true);

        try {
            await api.post("/waitlist", {
                email,
                fullName,
                profession,
                location,
                interests
            });

            setSuccess(true);
            toast.success("Successfully joined the waitlist!");
        } catch (err: any) {
            if (err.response?.status === 409) {
                toast.success("Good news! You are already on the waitlist.");
                setSuccess(true);
            } else if (err.response?.status === 429) {
                toast.error("You are sending too many requests. Please slow down.");
            } else {
                toast.error(err.response?.data?.message || err.message || "Failed to join waitlist.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col">
            <Toaster position="bottom-center" toastOptions={{
                style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
            }} />

            {/* SEO Metadata */}
            <title>IntelliCircle | Waitlist - Geolocation based Networking</title>
            <meta name="description" content="Stop swiping. Start meeting. Physical proximity graphs map you into local curated professional hubs based on shared interests." />
            <meta property="og:title" content="IntelliCircle | Geolocation Networking" />
            <meta property="og:description" content="Stop swiping. Start meeting. Physical proximity graphs map you into local curated professional hubs." />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="IntelliCircle | Private Beta" />
            <meta name="twitter:description" content="Stop swiping. Start meeting. Spatial social graphs map you into local curated professional hubs based on shared interests." />

            {/* Background Decorative Elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Navigation Ribbon */}
            <nav className="relative z-10 w-full px-6 py-6 max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">IntelliCircle</span>
                </div>
                <Link href="/auth" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                    Beta Login
                </Link>
            </nav>

            {/* Main Content */}
            <main className="flex-1 relative z-10 flex items-center justify-center px-4 py-12 lg:py-0">
                <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left Column: Mission / Copy */}
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                            <Rocket className="w-3.5 h-3.5" />
                            <span>Private Beta Opening Soon</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                            Networking, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                                Re-Engineered.
                            </span>
                        </h1>

                        <p className="text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            Stop swiping. Start meeting. IntelliCircle calculates physical proximity graphs to instantly map you into local, highly-curated professional hubs based entirely on shared interests.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4 max-w-lg mx-auto lg:mx-0">
                            <div className="space-y-2">
                                <h3 className="font-bold text-white text-xl">10k+</h3>
                                <p className="text-sm text-zinc-500 font-medium">Founders waitlisted</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-white text-xl">Spatial Sync</h3>
                                <p className="text-sm text-zinc-500 font-medium">Sub-meter accuracy</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Lead Capture Form */}
                    <div className="w-full max-w-md mx-auto relative group">
                        {/* Glow effect behind the card */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                        <div className="relative bg-zinc-950 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
                            <AnimatePresence mode="wait">
                                {success ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="py-12 flex flex-col items-center text-center space-y-4"
                                    >
                                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 text-emerald-400">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold">You're on the list!</h3>
                                        <p className="text-zinc-400 leading-relaxed">
                                            We've locked your spot in the queue. Keep an eye on <strong>{email}</strong> for your exclusive beta invite code.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-bold mb-2">Reserve Your Access</h2>
                                            <p className="text-sm text-zinc-400">Join the waitlist to get early notification when hubs open in your city.</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            {/* HONEYPOT - Bot Trap */}
                                            <div className="hidden absolute opacity-0 -z-50 shrink-0 select-none">
                                                <label htmlFor="website">Website (Leave Blank)</label>
                                                <input
                                                    type="text"
                                                    id="website"
                                                    name="website"
                                                    tabIndex={-1}
                                                    autoComplete="off"
                                                    value={botField}
                                                    onChange={(e) => setBotField(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Full Name</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <ShieldCheck className="h-5 w-5 text-zinc-600" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder:text-zinc-600 outline-none"
                                                        placeholder="Jane Doe"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email Address</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Mail className="h-5 w-5 text-zinc-600" />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder:text-zinc-600 outline-none"
                                                        placeholder="jane@startup.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Profession</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Briefcase className="h-4 w-4 text-zinc-600" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={profession}
                                                            onChange={(e) => setProfession(e.target.value)}
                                                            className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors placeholder:text-zinc-600 outline-none text-sm"
                                                            placeholder="Founder"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">City</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <MapPin className="h-4 w-4 text-zinc-600" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={location}
                                                            onChange={(e) => setLocation(e.target.value)}
                                                            className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors placeholder:text-zinc-600 outline-none text-sm"
                                                            placeholder="SF, CA"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Top Interests</label>
                                                <div className="w-full bg-white/5 border border-white/10 rounded-xl p-2 min-h-[50px] flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-indigo-500 transition-colors">
                                                    {interests.map(tag => (
                                                        <span key={tag} className="flex items-center gap-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-1 rounded text-xs">
                                                            {tag}
                                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                                                                &times;
                                                            </button>
                                                        </span>
                                                    ))}
                                                    <input
                                                        type="text"
                                                        value={currentTag}
                                                        onChange={(e) => setCurrentTag(e.target.value)}
                                                        onKeyDown={handleAddTag}
                                                        className="bg-transparent border-none focus:outline-none focus:ring-0 w-[140px] text-sm placeholder:text-zinc-600 px-2"
                                                        placeholder={interests.length === 0 ? "Web3, FinTech..." : (interests.length < 5 ? "Add more..." : "Limit 5")}
                                                        disabled={interests.length >= 5}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-zinc-600 pl-1">Press Enter to add tags (Max 5)</p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full relative group overflow-hidden bg-white text-black font-bold text-sm py-4 rounded-xl hover:scale-[1.02] focus:scale-[0.98] transition-transform disabled:opacity-70 disabled:hover:scale-100 mt-2 flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <span>Join the Waitlist</span>
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}

                                                {/* Button inner shine effect */}
                                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-shimmer" />
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
