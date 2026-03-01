"use client";

import { useState, useEffect } from "react";
import { Camera, MapPin, Briefcase, Edit, Settings, LayoutGrid, Activity, Calendar } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState("overview");
    const [activeSettingsTab, setActiveSettingsTab] = useState("personal"); // personal | privacy | notifications
    const { user, isAuthenticated, updateProfile } = useAuthStore();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    // Profile State
    const [displayName, setDisplayName] = useState("");
    const [role, setRole] = useState("");
    const [location, setLocation] = useState("San Francisco, CA"); // Fallback default
    const [bio, setBio] = useState("Building intuitive digital experiences. Passionate about real-time networking, React architecture, and open source. Open to collaborations and tech chats!");
    const [profilePicUrl, setProfilePicUrl] = useState<string | null>(user?.avatar || null);

    // Privacy State
    const [showOnlineStatus, setShowOnlineStatus] = useState(true);
    const [allowDirectMessages, setAllowDirectMessages] = useState(false);

    // Stats State (mocked from API for now)
    const [stats, setStats] = useState({ connections: 0, sessions: 0, messages: 0 });

    useEffect(() => {
        setMounted(true);
        if (mounted && !isAuthenticated) {
            router.push("/");
        } else if (user) {
            setDisplayName(user.username);
            setRole(user.role || "Member");
            setProfilePicUrl(user.avatar || null);
        }
    }, [mounted, isAuthenticated, router, user]);

    if (!mounted || !user) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setProfilePicUrl(url);
            updateProfile({ avatar: url }); // Sync with global store immediately
        }
    };

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
                                {/* Abstract Fallback Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-primary"></div>

                                {profilePicUrl ? (
                                    <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover relative z-10" />
                                ) : (
                                    <span className="text-4xl font-bold text-white relative z-10 font-display">{displayName.charAt(0).toUpperCase()}</span>
                                )}

                                {/* Overlay on hover for edit */}
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-20">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    <Camera className="w-8 h-8 text-white" />
                                </label>
                            </div>
                            {/* Online Indicator */}
                            {showOnlineStatus && (
                                <div className="absolute bottom-2 right-2 w-5 h-5 bg-success border-4 border-background rounded-full transition-all duration-300"></div>
                            )}
                        </div>

                        <button
                            onClick={() => { setActiveTab("settings"); setActiveSettingsTab("personal"); }}
                            className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                        >
                            <Edit className="w-4 h-4" /> Edit Profile
                        </button>
                    </div>

                    {/* Bio Block */}
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-display font-bold text-white mb-2">{displayName}</h1>
                        <div className="flex flex-wrap items-center gap-4 text-muted font-medium mb-4">
                            <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5" /> {role}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {location}</span>
                        </div>
                        <p className="text-lg text-zinc-300 leading-relaxed border-l-2 border-primary pl-4">
                            {bio}
                        </p>
                    </div>

                    {/* 2. Stats Block */}
                    <div className="flex flex-wrap items-center gap-8 mt-8 py-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-2xl font-display font-bold text-white">{stats.connections}</span>
                            <span className="text-sm font-medium text-muted">Connections</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-display font-bold text-white">{stats.sessions}</span>
                            <span className="text-sm font-medium text-muted">Sessions Joined</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-display font-bold text-white">{stats.messages}</span>
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
                                    <button
                                        onClick={() => setActiveSettingsTab("personal")}
                                        className={`text-left px-3 py-2 rounded-md font-medium transition-colors ${activeSettingsTab === "personal" ? "bg-white/5 text-white" : "text-muted hover:bg-white/5 hover:text-white"}`}
                                    >
                                        Personal Details
                                    </button>
                                    <button
                                        onClick={() => setActiveSettingsTab("privacy")}
                                        className={`text-left px-3 py-2 rounded-md font-medium transition-colors ${activeSettingsTab === "privacy" ? "bg-white/5 text-white" : "text-muted hover:bg-white/5 hover:text-white"}`}
                                    >
                                        Privacy & Security
                                    </button>
                                    <button
                                        onClick={() => setActiveSettingsTab("notifications")}
                                        className={`text-left px-3 py-2 rounded-md font-medium transition-colors ${activeSettingsTab === "notifications" ? "bg-white/5 text-white" : "text-muted hover:bg-white/5 hover:text-white"}`}
                                    >
                                        Notifications
                                    </button>
                                </div>

                                {/* Settings Form Content */}
                                <div className="col-span-1 md:col-span-3 space-y-8">
                                    {activeSettingsTab === "personal" && (
                                        <div className="bg-[#111827] border border-[#27272a] rounded-xl p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                            <h3 className="text-xl font-display font-bold text-white mb-6">Personal Details</h3>

                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-zinc-300 mb-2">Display Name</label>
                                                        <input
                                                            type="text"
                                                            value={displayName}
                                                            onChange={(e) => setDisplayName(e.target.value)}
                                                            className="w-full bg-[#0A0A0A] border border-[#27272a] rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-zinc-300 mb-2">Role/Title</label>
                                                        <input
                                                            type="text"
                                                            value={role}
                                                            onChange={(e) => setRole(e.target.value)}
                                                            className="w-full bg-[#0A0A0A] border border-[#27272a] rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Location</label>
                                                    <input
                                                        type="text"
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        className="w-full bg-[#0A0A0A] border border-[#27272a] rounded-md px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
                                                    <textarea
                                                        rows={4}
                                                        value={bio}
                                                        onChange={(e) => setBio(e.target.value)}
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
                                    )}

                                    {/* Privacy Section Preview */}
                                    {activeSettingsTab === "privacy" && (
                                        <div className="bg-[#111827] border border-[#27272a] rounded-xl p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                            <h3 className="text-xl font-display font-bold text-white mb-6">Privacy & Discovery</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between py-2">
                                                    <div>
                                                        <p className="font-medium text-white">Show Online Status</p>
                                                        <p className="text-sm text-muted">Let others see when you are active in the app.</p>
                                                    </div>
                                                    {/* Custom Toggle Switch */}
                                                    <div
                                                        onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${showOnlineStatus ? 'bg-primary' : 'bg-[#27272a]'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showOnlineStatus ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </div>
                                                </div>
                                                <div className={`flex items-center justify-between py-2 transition-opacity duration-200 ${allowDirectMessages ? 'text-opacity-100' : 'text-opacity-50'}`}>
                                                    <div>
                                                        <p className="font-medium text-white">Allow Direct Messages</p>
                                                        <p className="text-sm text-muted">Receive messages from people outside your connections.</p>
                                                    </div>
                                                    <div
                                                        onClick={() => setAllowDirectMessages(!allowDirectMessages)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${allowDirectMessages ? 'bg-primary' : 'bg-[#27272a]'}`}
                                                    >
                                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowDirectMessages ? 'translate-x-6' : 'translate-x-1'}`} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Notifications Section Preview */}
                                    {activeSettingsTab === "notifications" && (
                                        <div className="bg-[#111827] border border-[#27272a] rounded-xl p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center justify-center py-12 text-center">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                                <Settings className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">Notification Preferences</h3>
                                            <p className="text-muted text-sm max-w-sm">
                                                Control how and when you receive alerts for messages, room activity, and system updates. Coming soon with push notification integration!
                                            </p>
                                        </div>
                                    )}
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
