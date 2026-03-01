"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Search, Plus, Users, Hash, Clock, MapPin } from "lucide-react";

export default function ChatRoomsHub() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth");
        }
    }, [isAuthenticated, router]);

    // Mock Data for demonstration since the API isn't fully integrated here yet
    const dummyRooms = [
        { id: 1, name: "Tech Mixer SF", description: "Discussing the latest in React, Next.js, and frontend architecture.", users: 12, tags: ["react", "frontend"], time: "2 mins ago" },
        { id: 2, name: "Founders Circle", description: "Early stage startup founders sharing growth strategies and fundraising tips.", users: 8, tags: ["startups", "growth"], time: "15 mins ago" },
        { id: 3, name: "Design Critique", description: "Drop your Figma links and get live feedback from local UI/UX designers.", users: 24, tags: ["design", "uiux"], time: "Just now" },
        { id: 4, name: "Coffee & Code", description: "General chatting, pair programming, and networking.", users: 5, tags: ["casual", "networking"], time: "1 hour ago" },
        { id: 5, name: "AI/ML Enthusiasts", description: "Talking about LLMs, RAG, and the future of AI agents.", users: 42, tags: ["ai", "machine-learning"], time: "Live" }
    ];

    const filteredRooms = dummyRooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (!isAuthenticated) return null;

    return (
        <div className="flex-1 w-full bg-background flex flex-col pt-10 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-white mb-3">
                            Active <span className="text-primary">Chat Rooms</span>
                        </h1>
                        <p className="text-lg text-muted max-w-2xl">
                            Jump into live conversations happening around you right now. Connect, collaborate, and expand your network.
                        </p>
                    </div>

                    <button className="whitespace-nowrap inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:scale-105 shadow-lg shadow-primary/20">
                        <Plus className="mr-2 h-5 w-5" /> Create Room
                    </button>
                </div>

                {/* Sub-Header / Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-grow max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search rooms by name or tag..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111827] border border-[#27272a] rounded-full pl-12 pr-4 py-3 text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <button className="inline-flex h-[50px] items-center justify-center rounded-full bg-[#111827] border border-[#27272a] px-6 text-sm font-medium text-white transition-all hover:bg-[#1f2937] hover:border-white/20">
                        <MapPin className="mr-2 h-4 w-4 text-primary" /> Near Me
                    </button>
                </div>

                {/* Rooms Grid */}
                {filteredRooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.map((room) => (
                            <Link
                                href={`/chat/${room.id}`}
                                key={room.id}
                                className="group flex flex-col p-6 rounded-2xl bg-[#0A0A0A] border border-[#27272a] hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Hash className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="inline-flex items-center text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse"></span>
                                            {room.time}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 font-display group-hover:text-primary transition-colors line-clamp-1">{room.name}</h3>
                                <p className="text-muted text-sm leading-relaxed mb-6 flex-grow line-clamp-2">{room.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
                                    <div className="flex gap-2">
                                        {room.tags.map(tag => (
                                            <span key={tag} className="text-xs font-medium text-zinc-400 bg-white/5 px-2 py-1 rounded-md">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center text-sm font-medium text-zinc-300 bg-[#111827] px-3 py-1 rounded-full border border-[#27272a]">
                                        <Users className="w-4 h-4 mr-1.5 text-indigo-400" />
                                        {room.users}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[#27272a] rounded-2xl bg-[#0A0A0A]">
                        <Search className="w-12 h-12 text-zinc-700 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No rooms found</h3>
                        <p className="text-muted max-w-sm">
                            We couldn't find any active chat rooms matching "{searchQuery}". Try a different search term or create a new room!
                        </p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="mt-6 text-primary hover:text-indigo-400 font-medium transition-colors"
                        >
                            Clear search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
