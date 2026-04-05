"use client";

import Link from "next/link";
import { Globe, MessageSquare, Handshake, Play, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { analytics } from '@/lib/analytics';

export default function Home() {

    return (
        <div className="flex flex-col min-h-screen">
            {/* 1. Hero Section */}
            <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-4 overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent pointer-events-none" />

                <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
                    <div className="mb-8 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                        🚀 The real-time watercooler for your city
                    </div>

                    <h1 className="mb-6 text-5xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-white leading-tight">
                        Connect Locally.<br />Network Globally.
                    </h1>

                    <p className="mb-10 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
                        Discover professionals, join local chat rooms, and build meaningful connections in seconds. The next generation of professional networking is real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link
                            href="/discover"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                        >
                            Start Connecting <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            href="/chat"
                            className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/30 backdrop-blur-sm"
                        >
                            <Play className="mr-2 h-4 w-4" /> Explore Rooms
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. Feature Overview Section */}
            <section className="py-24 px-4 bg-zinc-950 border-y border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Why Join the Circle?</h2>
                        <p className="text-muted max-w-2xl mx-auto">We're stripping away the algorithm feed and bringing back genuine, serendipitous connections with people right around you.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature Cards */}
                        {[
                            {
                                icon: <Globe className="h-6 w-6 text-primary" />,
                                title: "Local Discovery",
                                description: "Find professionals within your immediate vicinity and industry instantly.",
                            },
                            {
                                icon: <MessageSquare className="h-6 w-6 text-primary" />,
                                title: "Real-time Rooms",
                                description: "Drop into active conversations happening in your city right now.",
                            },
                            {
                                icon: <Handshake className="h-6 w-6 text-primary" />,
                                title: "Meaningful Connections",
                                description: "Move beyond superficial matching to genuine professional networking.",
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group flex flex-col p-8 rounded-2xl bg-[#0A0A0A] border border-[#27272a] hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 font-display">{feature.title}</h3>
                                <p className="text-muted leading-relaxed flex-grow">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. Live Product Preview & Social Proof */}
            <section className="py-24 px-4 overflow-hidden relative">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            {/* Abstract Mock UI Frame */}
                            <div className="relative rounded-2xl border border-[#27272a] bg-[#0A0A0A] shadow-2xl p-2 aspect-[4/3] flex flex-col overflow-hidden">
                                <div className="h-8 border-b border-[#27272a] flex items-center px-4 gap-2 mb-4 bg-zinc-950 absolute top-0 left-0 right-0">
                                    <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="mt-12 flex-grow p-4 space-y-4">
                                    {/* Mock Chat bubbles */}
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex-shrink-0 relative">
                                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0A0A0A] bg-success"></div>
                                        </div>
                                        <div className="bg-[#111827] border border-[#27272a] rounded-2xl rounded-tl-sm p-4 animate-pulse">
                                            <div className="h-2 w-24 bg-zinc-700 mx-auto rounded-full mb-2"></div>
                                            <div className="h-2 w-48 bg-zinc-800 mx-auto rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 flex-row-reverse">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex-shrink-0"></div>
                                        <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-tr-sm p-4 text-sm text-white max-w-[80%]">
                                            Anyone going to the Tech Mixer tonight in SF?
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 relative">
                                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0A0A0A] bg-success"></div>
                                        </div>
                                        <div className="bg-[#111827] border border-[#27272a] rounded-2xl rounded-tl-sm p-4 text-sm text-white max-w-[80%]">
                                            Yes! I'll be there around 7 PM. Let's sync up! We're looking for a React developer too.
                                        </div>
                                    </div>
                                </div>
                                {/* Gradient fade overlay */}
                                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none"></div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">Currently <span className="text-primary">1,240+</span> professionals talking in <span className="text-primary">45</span> active rooms.</h2>
                            <p className="text-xl text-muted mb-8 leading-relaxed">
                                Don't miss out on local opportunities. IntelliCircle creates spontaneous, high-value networking sessions based on location and professional interests.
                            </p>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center text-white">
                                    <ShieldCheck className="h-5 w-5 text-success mr-3" /> Encrypted direct messaging
                                </li>
                                <li className="flex items-center text-white">
                                    <Zap className="h-5 w-5 text-success mr-3" /> Real-time location-based rooms
                                </li>
                            </ul>

                            <Link
                                href="/chat"
                                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-black transition-all hover:bg-zinc-200"
                            >
                                Jump into a Room <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Final CTA */}
            <section className="py-24 px-4 bg-primary/5 border-t border-primary/20 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Ready to expand your circle?</h2>
                    <p className="text-xl text-muted mb-10">Join thousands of professionals already accelerating their careers through meaningful local connections.</p>
                    <Link
                        href="/auth"
                        onClick={() => analytics.waitlistJoined()}
                        className="inline-flex h-14 items-center justify-center rounded-full bg-primary px-10 text-base font-semibold text-white transition-all hover:bg-primary/90 hover:scale-105 shadow-xl shadow-primary/25"
                    >
                        Create Free Account
                    </Link>
                </div>
            </section>
        </div>
    );
}
