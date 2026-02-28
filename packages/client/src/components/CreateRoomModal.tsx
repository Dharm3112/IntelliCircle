"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, MapPin } from "lucide-react";
import { api } from "@/lib/api";

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentLat: number | null;
    currentLng: number | null;
}

export function CreateRoomModal({ isOpen, onClose, onSuccess, currentLat, currentLng }: CreateRoomModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [interests, setInterests] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            if (interests.length >= 5) {
                setError("Maximum 5 interest tags allowed.");
                return;
            }
            if (!interests.includes(currentTag.trim().toLowerCase())) {
                setInterests([...interests, currentTag.trim().toLowerCase()]);
            }
            setCurrentTag("");
            setError("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setInterests(interests.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!currentLat || !currentLng) {
            setError("Cannot create a room without GPS lock.");
            return;
        }

        if (interests.length === 0) {
            setError("Please add at least one interest tag.");
            return;
        }

        setIsLoading(true);

        try {
            await api.post("/rooms", {
                name,
                description,
                lat: currentLat,
                lng: currentLng,
                interests
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to create room.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
                >
                    <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                        <h2 className="text-xl font-bold text-white">Create a Circle</h2>
                        <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-indigo-100">Location Locked</h4>
                                <p className="text-xs text-indigo-300/70">
                                    Your new hub will be anchored to coordinates [{currentLat?.toFixed(4)}, {currentLng?.toFixed(4)}]
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Hub Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-zinc-600"
                                placeholder="e.g., Downtown Web3 Hackers"
                                required
                                minLength={3}
                                maxLength={64}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-zinc-600 h-24 resize-none"
                                placeholder="What is this channel about?"
                                maxLength={500}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Interests (Tags)</label>
                            <div className="w-full bg-black/50 border border-white/10 rounded-lg p-2 focus-within:ring-2 focus-within:ring-emerald-500 min-h-[46px] flex flex-wrap gap-2 items-center text-white">
                                {interests.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded text-sm">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    type="text"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    className="bg-transparent border-none focus:outline-none focus:ring-0 w-[120px] text-sm placeholder:text-zinc-600"
                                    placeholder={interests.length < 5 ? "Type and press Enter" : "Limit reached"}
                                    disabled={interests.length >= 5}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !name || interests.length === 0}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium bg-white text-black hover:bg-zinc-200 focus:ring-4 focus:ring-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Launch Orbit Hub
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
