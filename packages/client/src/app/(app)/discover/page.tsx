"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useGeolocation } from "@/hooks/useGeolocation";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2, MapPin, Compass, AlertCircle, PlusCircle } from "lucide-react";
import { CreateRoomModal } from "@/components/CreateRoomModal";

interface Room {
    id: number;
    name: string;
    description: string;
    interests: string[];
    distanceMeters?: number;
}

export default function DiscoverPage() {
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const { coordinates, loading: geoLoading, error: geoError } = useGeolocation();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    const [searchRadius, setSearchRadius] = useState(50); // Default 50km
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Feed Fetcher (extract to callable function)
    const fetchNearbyRooms = async () => {
        if (!coordinates || geoLoading) return;
        setIsFetching(true);
        try {
            const res = await api.get(`/rooms/nearby`, {
                params: {
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                    radiusKm: searchRadius
                }
            });
            setRooms((res.data as any).data.rooms || []);
        } catch (error) {
            console.error("Failed to fetch nearby rooms", error);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchGlobalRooms = async () => {
        setIsFetching(true);
        try {
            const res = await api.get(`/rooms/global`);
            setRooms((res.data as any).data.rooms || []);
        } catch (error) {
            console.error("Failed to fetch global rooms", error);
        } finally {
            setIsFetching(false);
        }
    };

    // Security Gate
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth");
        }
    }, [isAuthenticated, router]);

    // Feed Fetcher Effect
    useEffect(() => {
        if (geoError) {
            fetchGlobalRooms();
        } else if (coordinates) {
            fetchNearbyRooms();
        }
    }, [coordinates, geoLoading, geoError, searchRadius]);

    if (!isAuthenticated) return null; // Gate render until redirect loop catches

    return (
        <div className="min-h-screen bg-black text-white relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none" />

            <main className="max-w-5xl mx-auto px-4 py-12 relative z-10">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Discover</h1>
                        <p className="text-zinc-400">Find active circles mathematically near your position.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-zinc-200 transition-colors"
                    >
                        <PlusCircle className="w-5 h-5" />
                        <span>Create Circle</span>
                    </button>

                    <CreateRoomModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={() => fetchNearbyRooms()}
                        currentLat={coordinates?.lat || null}
                        currentLng={coordinates?.lng || null}
                    />
                </header>

                {/* State Managers */}
                {geoLoading ? (
                    <div className="flex flex-col items-center justify-center p-24 border border-white/5 rounded-3xl bg-white/5 backdrop-blur-sm">
                        <Compass className="w-12 h-12 animate-spin text-zinc-500 mb-4" />
                        <p className="text-zinc-400 font-medium">Acquiring satellite lock...</p>
                    </div>
                ) : (
                    <div className="space-y-6">

                        {geoError ? (
                            <div className="flex flex-col items-center p-8 border border-orange-500/20 rounded-3xl bg-orange-500/5 mb-8">
                                <AlertCircle className="w-10 h-10 text-orange-400 mb-3" />
                                <h2 className="text-lg font-bold text-orange-100 mb-1">Global Fallback Mode Active</h2>
                                <p className="text-orange-200/70 text-center max-w-md text-sm">
                                    {geoError} We cannot map you to physical rooms. Displaying all virtual hubs globally.
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-white/5 border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-full">
                                        <MapPin className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">Current Vector</p>
                                        <p className="text-xs text-zinc-500 font-mono">
                                            {coordinates?.lat.toFixed(4)}, {coordinates?.lng.toFixed(4)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-zinc-400">Radius: {searchRadius}km</span>
                                    <input
                                        type="range"
                                        min="5"
                                        max="500"
                                        value={searchRadius}
                                        onChange={(e) => setSearchRadius(Number(e.target.value))}
                                        className="accent-indigo-500"
                                    />
                                </div>
                            </div>
                        )}

                        {isFetching ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
                            </div>
                        ) : rooms.length === 0 ? (
                            <div className="p-24 text-center border border-dashed border-white/10 rounded-3xl">
                                <p className="text-zinc-500">No active circles found in this vector.</p>
                                {!geoError && <button className="mt-4 text-sm text-indigo-400 hover:text-indigo-300">Increase radius</button>}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {rooms.map((room, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={room.id}
                                        onClick={() => router.push(`/chat/${room.id}`)}
                                        className="bg-black/40 border border-white/10 hover:border-white/20 transition-colors rounded-2xl p-6 cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Compass className="w-24 h-24 transform translate-x-6 -translate-y-6 rotate-12" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                                                    {room.name}
                                                </h3>
                                                {room.distanceMeters !== undefined && (
                                                    <span className="text-xs font-mono font-medium bg-white/10 text-zinc-300 px-2 py-1 rounded-md">
                                                        {(room.distanceMeters / 1000).toFixed(1)} km
                                                    </span>
                                                )}
                                                {room.distanceMeters === undefined && (
                                                    <span className="text-xs font-mono font-medium bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md">
                                                        Global
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm text-zinc-400 mb-6 line-clamp-2">
                                                {room.description || "No description provided."}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {room.interests.map(tag => (
                                                    <span key={tag} className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
