"use client";

import { useState } from "react";
import { Camera, MapPin, Briefcase, Edit, Settings, LayoutGrid, Activity, Calendar } from "lucide-react";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Overview", icon: <LayoutGrid className="w-4 h-4 mr-2" /> },
        { id: "activity", label: "Activity", icon: <Activity className="w-4 h-4 mr-2" /> },
        { id: "sessions", label: "Sessions", icon: <Calendar className="w-4 h-4 mr-2" /> },
        { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4 mr-2" /> },
    ];

    return (
        <div className="flex-grow flex flex-col w-full">
            {/* 1. Profile Header Hero */}
            <div className="w-full bg-[#111827] border-b border-[#27272a] relative">
                {/* Cover Gradient */}
                <div className="h-48 w-full bg-gradient-to-r from-primary/40 via-purple-500/20 to-primary/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pb-8">
                    {/* Avatar Block */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-20 sm:mb-6 mb-4 gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-background bg-zinc-800 flex items-center justify-center overflow-hidden relative shadow-xl">
                                {/* Placeholder Avatar */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-primary"></div>
                                <span className="text-4xl font-bold text-white relative z-10 font-display">AJ</span>

                                {/* Overlay on hover for edit */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-20">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            {/* Online Indicator */}
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-success border-4 border-background rounded-full"></div>
                        </div>

                        <button className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                            <Edit className="w-4 h-4" /> Edit Profile
                        </button>
                    </div>

                    {/* Bio Block */}
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-display font-bold text-white mb-2">Alex Johnson</h1>
                        <div className="flex flex-wrap items-center gap-4 text-muted font-medium mb-4">
                            <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> Senior Frontend Developer</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> San Francisco, CA</span>
                        </div>
                        <p className="text-lg text-zinc-300 leading-relaxed border-l-2 border-primary pl-4">
                            Building intuitive digital experiences. Passionate about real-time networking, React architecture, and open source. Open to collaborations and tech chats!
                        </p>
                    </div>

                    {/* 2. Stats Block */}
                    <div className="flex flex-wrap items-center gap-8 mt-8 py-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-2xl font-display font-bold text-white">142</span>
                            <span className="text-sm font-medium text-muted">Connections</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-display font-bold text-white">34</span>
                            <span className="text-sm font-medium text-muted">Sessions Joined</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-display font-bold text-white">1,024</span>
                            <span className="text-sm font-medium text-muted">Messages Sent</span>
                        </div>
                        <div className="flex flex-col ml-auto">
                            <span className="text-sm text-muted">Member since Oct 2025</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Navigation Tabs */}
            <div className="w-full border-b border-[#27272a] bg-background sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors outline-none ${activeTab === tab.id
                                        ? "border-primary text-white"
                                        : "border-transparent text-muted hover:text-white hover:border-white/20"
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* 4. Tab Content Area */}
            <div className="w-full bg-background flex-grow py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Fade Transition Wrapper */}
                    <div className="animate-in fade-in duration-500">
                        {activeTab === "settings" && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {/* Settings Sidebar (Desktop) */}
                                <div className="hidden md:flex flex-col gap-2 col-span-1">
                                    <div className="font-semibold text-white mb-2 px-3">Account Settings</div>
                                    <button className="text-left px-3 py-2 rounded-md bg-white/5 text-white font-medium">Personal Details</button>
                                    <button className="text-left px-3 py-2 rounded-md text-muted hover:bg-white/5 hover:text-white transition-colors">Privacy & Security</button>
                                    <button className="text-left px-3 py-2 rounded-md text-muted hover:bg-white/5 hover:text-white transition-colors">Notifications</button>
                                </div>

                                {/* Settings Form Content */}
                                <div className="col-span-1 md:col-span-3 space-y-8">
                                    <div className="bg-[#111827] border border-[#27272a] rounded-xl p-6 shadow-sm">
                                        <h3 className="text-xl font-display font-bold text-white mb-6">Personal Details</h3>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Display Name</label>
                                                    <input
                                                        type="text"
                                                        defaultValue="Alex Johnson"
                                                        className="w-full bg-[#0A0A0A] border border-[#27272a] rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Role/Title</label>
                                                    <input
                                                        type="text"
                                                        defaultValue="Senior Frontend Developer"
                                                        className="w-full bg-[#0A0A0A] border border-[#27272a] rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-zinc-300 mb-2">Location</label>
                                                <input
                                                    type="text"
                                                    defaultValue="San Francisco, CA"
                                                    className="w-full bg-[#0A0A0A] border border-[#27272a] rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
                                                <textarea
                                                    rows={4}
                                                    defaultValue="Building intuitive digital experiences. Passionate about real-time networking, React architecture, and open source. Open to collaborations and tech chats!"
                                                    className="w-full bg-[#0A0A0A] border border-[#27272a] rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                                />
                                            </div>

                                            <div className="pt-4 border-t border-[#27272a] flex justify-end">
                                                <button className="px-6 py-2.5 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Privacy Section Preview */}
                                    <div className="bg-[#111827] border border-[#27272a] rounded-xl p-6 shadow-sm">
                                        <h3 className="text-xl font-display font-bold text-white mb-6">Privacy & Discovery</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between py-2">
                                                <div>
                                                    <p className="font-medium text-white">Show Online Status</p>
                                                    <p className="text-sm text-muted">Let others see when you are active in the app.</p>
                                                </div>
                                                {/* Custom Toggle Switch */}
                                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary cursor-pointer transition-colors">
                                                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-2 text-opacity-50">
                                                <div>
                                                    <p className="font-medium text-white">Allow Direct Messages</p>
                                                    <p className="text-sm text-muted">Receive messages from people outside your connections.</p>
                                                </div>
                                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#27272a] cursor-pointer transition-colors">
                                                    <span className="inline-block h-4 w-4 transform rounded-full bg-muted transition-transform translate-x-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab !== "settings" && (
                            <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#27272a] rounded-2xl bg-white/5">
                                <div className="h-16 w-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    {tabs.find(t => t.id === activeTab)?.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2 font-display capitalize">{activeTab}</h3>
                                <p className="text-muted max-w-md">
                                    The {activeTab} section will display relevant user data and feeds here once fully connected to the backend API.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
