"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Compass, MessageSquare, Users, Activity, ChevronRight, Zap, Target } from "lucide-react";

export default function Dashboard() {
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth");
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated || !user) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-white/10 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-white/10 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full bg-background flex flex-col">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
                {/* Header Section */}
                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
                        Welcome back, <span className="text-primary">{user.username}</span>
                    </h1>
                    <p className="text-muted text-lg">
                        Here's what's happening in your local professional network today.
                    </p>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Quick Actions & Primary Stats (Takes up 2/3 space on large screens) */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Action Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/discover" className="group p-6 rounded-2xl bg-[#111827] border border-[#27272a] hover:border-primary/50 transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.1)] hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none"></div>
                                <Compass className="w-8 h-8 text-white mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Discover Hub</h3>
                                <p className="text-muted text-sm mb-4">Explore the live map to find active professionals in your exact vicinity.</p>
                                <div className="flex items-center text-primary text-sm font-medium">
                                    Open Map <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>

                            <Link href="/chat" className="group p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-[#111827] border border-primary/30 hover:border-primary transition-all hover:shadow-[0_0_25px_rgba(79,70,229,0.2)] hover:-translate-y-1 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
                                <MessageSquare className="w-8 h-8 text-primary mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Active Rooms</h3>
                                <p className="text-indigo-200/70 text-sm mb-4">Jump straight into the highest velocity conversations happening right now.</p>
                                <div className="flex items-center text-primary text-sm font-medium">
                                    Join a Chat <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>

                        {/* Recent Activity/Feed Section */}
                        <div className="bg-[#111827] rounded-2xl border border-[#27272a] p-6 flex flex-col flex-grow">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-primary" /> Live Network Pulse
                                </h3>
                                <button className="text-sm font-medium text-muted hover:text-white transition-colors">
                                    View All
                                </button>
                            </div>

                            {/* Empty/Placeholder State for Feed */}
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-[#27272a] rounded-xl bg-background/50">
                                <Zap className="w-10 h-10 text-zinc-700 mb-3" />
                                <p className="text-white font-medium mb-1">It's a little quiet here.</p>
                                <p className="text-sm text-muted max-w-sm">
                                    Once you start joining rooms and interacting on the map, your activity feed will populate here.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Profile Summary & Suggestions */}
                    <div className="flex flex-col gap-6">
                        {/* Mini Profile Card */}
                        <div className="bg-[#111827] rounded-2xl border border-[#27272a] p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-primary mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white shadow-lg overflow-hidden border-2 border-[#111827] relative">
                                {user.username.charAt(0).toUpperCase()}
                                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-success border-2 border-[#111827] rounded-full"></div>
                            </div>
                            <h3 className="text-lg font-bold text-white">{user.username}</h3>
                            <p className="text-sm text-muted mb-6">Online & Ready to connect</p>

                            <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                                <div>
                                    <div className="text-2xl font-bold text-white">0</div>
                                    <div className="text-xs text-muted uppercase tracking-wider font-semibold">Connections</div>
                                </div>
                                <div className="border-l border-white/10">
                                    <div className="text-2xl font-bold text-white">0</div>
                                    <div className="text-xs text-muted uppercase tracking-wider font-semibold">Rooms Joined</div>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions Block */}
                        <div className="bg-[#111827] rounded-2xl border border-[#27272a] p-6 flex-grow">
                            <h3 className="text-lg font-bold text-white flex items-center mb-4">
                                <Target className="w-5 h-5 mr-2 text-primary" /> Recommended
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    { title: "Complete your profile", desc: "Add a bio and role to increase visibility.", action: "Edit Profile", link: "/profile" },
                                    { title: "Join 'Tech Mixer SF'", desc: "5 locals are talking about React right now.", action: "Join Room", link: "/chat" },
                                ].map((item, idx) => (
                                    <li key={idx} className="bg-background/80 p-4 rounded-xl border border-white/5">
                                        <h4 className="font-semibold text-white text-sm mb-1">{item.title}</h4>
                                        <p className="text-xs text-muted mb-3">{item.desc}</p>
                                        <Link href={item.link} className="inline-flex items-center text-xs font-semibold text-primary hover:text-indigo-400">
                                            {item.action} <ChevronRight className="w-3 h-3 ml-1" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
