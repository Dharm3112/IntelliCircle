"use client";

import Link from "next/link";
import { Users, Globe2, Cpu, ArrowRight, Zap, ShieldCheck, Sparkles } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="flex-1 w-full bg-background flex flex-col min-h-screen">

            {/* 1. Hero Section with Cyber Grid */}
            <section className="relative flex flex-col items-center justify-center min-h-[70vh] px-4 overflow-hidden border-b border-white/5 pt-20 pb-16">
                {/* Visual Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e510_1px,transparent_1px),linear-gradient(to_bottom,#4f46e510_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

                <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
                    <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                        <Sparkles className="w-4 h-4 mr-2" /> Our Mission
                    </div>

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-white mb-8 leading-tight">
                        Networking, <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
                            Reimagined for the Present.
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
                        We're stripping away the algorithm feed and bringing back genuine, serendipitous connections with people right around you.
                    </p>
                </div>
            </section>

            {/* 2. Core Pillars - BENTO GRID STYLE */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">The IntelliCircle Pillars</h2>
                        <p className="text-muted max-w-2xl mx-auto">Built on a foundation of presence, privacy, and authentic value.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)] relative z-10">
                        <div className="md:col-span-2 group p-8 rounded-3xl bg-gradient-to-br from-[#111827] to-[#0A0A0A] border border-[#27272a] hover:border-primary/50 transition-all duration-500 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                            <Globe2 className="w-10 h-10 text-primary mb-6" />
                            <h3 className="text-2xl font-bold text-white font-display mb-4">Hyper-Local Discovery</h3>
                            <p className="text-muted leading-relaxed text-lg max-w-xl">
                                Networking shouldn't just happen online. We connect you with professionals in your immediate vicinity, turning digital chats into real-world collaborations over coffee.
                            </p>
                        </div>

                        <div className="group p-8 rounded-3xl bg-[#0A0A0A] border border-[#27272a] hover:border-primary/50 transition-all duration-500 overflow-hidden relative">
                            <Cpu className="w-10 h-10 text-primary mb-6" />
                            <h3 className="text-xl font-bold text-white font-display mb-4">Instantaneous</h3>
                            <p className="text-muted leading-relaxed">
                                No waiting for connection requests. Drop directly into active chat rooms.
                            </p>
                        </div>

                        <div className="group p-8 rounded-3xl bg-[#0A0A0A] border border-[#27272a] hover:border-primary/50 transition-all duration-500 overflow-hidden relative">
                            <ShieldCheck className="w-10 h-10 text-primary mb-6" />
                            <h3 className="text-xl font-bold text-white font-display mb-4">Privacy First</h3>
                            <p className="text-muted leading-relaxed">
                                Encrypted direct messaging and explicit location sharing controls. You own your data.
                            </p>
                        </div>

                        <div className="md:col-span-2 group p-8 rounded-3xl bg-gradient-to-tr from-[#111827] to-[#0A0A0A] border border-[#27272a] hover:border-primary/50 transition-all duration-500 overflow-hidden relative">
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors" />
                            <Users className="w-10 h-10 text-primary mb-6" />
                            <h3 className="text-2xl font-bold text-white font-display mb-4">Community over Algorithms</h3>
                            <p className="text-muted leading-relaxed text-lg max-w-xl">
                                Built by developers, for professionals. We prioritize authentic interaction and meaningful discovery over engagement metrics and infinite scrolling.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. The Manifesto / Story */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-y border-white/5 relative overflow-hidden">
                <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-4xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                    <div className="md:col-span-12 lg:col-span-5 text-center lg:text-left">
                        <h2 className="text-4xl font-display font-bold text-white mb-6">Our Story</h2>
                        <div className="h-1 w-20 bg-primary rounded-full mb-8 mx-auto lg:mx-0" />
                        <p className="text-xl text-zinc-300 font-medium italic mb-6 leading-relaxed">
                            "We realized the best networking happens spontaneously — like bumping into someone at a conference. We wanted to digitize that exact experience."
                        </p>
                    </div>

                    <div className="md:col-span-12 lg:col-span-7 space-y-6 text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                        <p>
                            The modern professional landscape is more fragmented than ever. Despite having countless "social networks," finding relevant people to collaborate with locally remains incredibly difficult.
                        </p>
                        <p>
                            Traditional platforms optimize for endless scrolling. You send a connection request, wait days for a response, and eventually exchange pleasantries that rarely lead to genuine collaboration.
                        </p>
                        <p className="text-white font-medium border-l-2 border-primary pl-4">
                            That's why we built IntelliCircle. By focusing on real-time presence and geo-location, we enable professionals to bypass the formalities and jump straight into high-context conversations.
                        </p>
                    </div>
                </div>
            </section>

            {/* 4. Bottom CTA */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-primary/20 via-indigo-900/40 to-[#0A0A0A] border border-primary/30 rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.1)]">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

                    <Zap className="w-12 h-12 text-primary mx-auto mb-6 relative z-10" />
                    <h2 className="text-4xl font-display font-bold text-white mb-4 relative z-10">Join the movement.</h2>
                    <p className="text-xl text-indigo-100/70 mb-10 max-w-2xl mx-auto relative z-10">
                        Stop collecting connections. Start building a community. Experience IntelliCircle today.
                    </p>

                    <Link
                        href="/auth"
                        className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-base font-bold text-black transition-all hover:bg-zinc-200 hover:scale-105 shadow-xl shadow-white/10 relative z-10"
                    >
                        Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
