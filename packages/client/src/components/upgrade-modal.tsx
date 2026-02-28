"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Shield, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const UpgradeAccountModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated || !user || user.role !== "user") {
        return null; // Only show to basic authenticated generic users
    }

    const handleUpgrade = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data } = await api.post("/auth/upgrade", { email, password });
            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    setIsOpen(false);
                }, 2000); // Close after 2 seconds on success
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to upgrade account.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-4 py-2 text-sm font-medium text-emerald-400 border border-emerald-500/20 transition-all hover:bg-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] active:scale-95"
            >
                <Shield className="h-4 w-4" />
                <span>Secure Account</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => !isLoading && !success && setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-500/20 bg-ic-surface/90 p-8 shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl"
                        >
                            <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-[64px]" />

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-8 text-center"
                                >
                                    <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">Account Secured!</h3>
                                    <p className="text-white/60 text-sm">You can now login with this email anywhere.</p>
                                </motion.div>
                            ) : (
                                <div className="relative">
                                    <div className="mb-8 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                            <Shield className="h-8 w-8 text-emerald-400" />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight text-white font-space">
                                            Lock Down @{user.username}
                                        </h2>
                                        <p className="mt-2 text-sm text-white/60">
                                            Attach an email and password to secure your identity and sync across devices.
                                        </p>
                                    </div>

                                    <form onSubmit={handleUpgrade} className="space-y-4">
                                        <div className="space-y-4">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full rounded-xl border border-white/10 bg-black/20 py-3.5 px-4 text-white placeholder-white/30 outline-none transition-all focus:border-emerald-500/50 focus:bg-black/40 focus:ring-1 focus:ring-emerald-500/50"
                                                placeholder="Email Address"
                                                required
                                                disabled={isLoading}
                                            />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full rounded-xl border border-white/10 bg-black/20 py-3.5 px-4 text-white placeholder-white/30 outline-none transition-all focus:border-emerald-500/50 focus:bg-black/40 focus:ring-1 focus:ring-emerald-500/50"
                                                placeholder="Create Password"
                                                required
                                                minLength={8}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        {error && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-red-400 text-center">
                                                {error}
                                            </motion.div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isLoading || password.length < 8 || !email}
                                            className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    <span>Secure Identity</span>
                                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
