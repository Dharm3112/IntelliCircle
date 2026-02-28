"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { User, LogIn, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AuthModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated, user, setAuth, logout } = useAuthStore();

    const handleAnonymousLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await api.post("/auth/anonymous", { username });
            const data = res.data as any;
            if (data.success) {
                setAuth(data.data.accessToken, data.data.user);
                setIsOpen(false);
            }
        } catch (error: any) {
            setError(error.response?.data?.message || "Failed to authenticate. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            // Ignore logout errors
        } finally {
            logout();
        }
    };

    // If authenticated, show user profile blurb
    if (isAuthenticated && user) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-medium text-white">{user.username}</span>
                    <span className="text-xs text-white/50">{user.role}</span>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-ic-accent to-ic-primary flex items-center justify-center text-white font-bold shadow-lg shadow-ic-accent/20 cursor-pointer transition-transform hover:scale-105" onClick={handleLogout} title="Click to logout">
                    {user.username.charAt(0).toUpperCase()}
                </div>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
            >
                <LogIn className="h-4 w-4" />
                <span>Enter IntelliCircle</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-ic-surface/80 p-8 shadow-2xl shadow-black/50 backdrop-blur-2xl"
                        >
                            <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-ic-accent/20 blur-[64px]" />
                            <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-ic-primary/20 blur-[64px]" />

                            <div className="relative">
                                <div className="mb-8 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-transparent shadow-inner border border-white/10">
                                        <User className="h-8 w-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight text-white font-space">
                                        Frictionless Entry
                                    </h2>
                                    <p className="mt-2 text-sm text-white/60">
                                        Claim a unique username to instantly join the global matrix. No passwords required.
                                    </p>
                                </div>

                                <form onSubmit={handleAnonymousLogin} className="space-y-4">
                                    <div>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                                <span className="text-white/40 font-mono">@</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                                                className="block w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-10 pr-4 text-white placeholder-white/30 outline-none transition-all focus:border-ic-accent focus:bg-black/40 focus:ring-1 focus:ring-ic-accent"
                                                placeholder="choose_your_handle"
                                                required
                                                minLength={3}
                                                maxLength={20}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-red-400 text-center">
                                            {error}
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading || username.length < 3}
                                        className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-ic-accent to-ic-primary py-3.5 font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Initialize Session</span>
                                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
