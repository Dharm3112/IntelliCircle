"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form fields
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (isLogin) {
                // Login Flow
                const res = await api.post("/auth/login", {
                    usernameOrEmail: username, // using username field to store either
                    password,
                });

                const { accessToken, user } = (res.data as any).data;
                setAuth(accessToken, user);
                router.push("/discover"); // Navigate to core app
            } else {
                // Sign Up Flow (Anonymous -> Upgrade)
                if (username.length < 3 || password.length < 8) {
                    throw new Error("Username must be at least 3 chars; Password at least 8 chars.");
                }

                // 1. Create Identity
                const anonRes = await api.post("/auth/anonymous", { username });
                const { accessToken, user } = (anonRes.data as any).data;
                // Temporarily set auth to allow the authenticated upgrade endpoint to process
                setAuth(accessToken, user);

                // 2. Upgrade Identity with strict credentials
                try {
                    await api.post("/auth/upgrade", { email, password });
                    router.push("/discover");
                } catch (upgradeErr: any) {
                    // Fallback to anonymous if upgrade fails (e.g. weak password)
                    setError(upgradeErr.response?.data?.message || upgradeErr.message || "Failed to upgrade account");
                }
            }
        } catch (err: any) {
            const apiError = err.response?.data?.error;
            let errorMsg = apiError?.message || err.message || "Authentication failed";

            // Extract specific Zod validation details if present
            if (apiError?.code === "VALIDATION_ERROR" && apiError?.details) {
                const firstDetail = Object.values(apiError.details).find((v: any) => v && v._errors?.length > 0) as any;
                if (firstDetail && firstDetail._errors[0]) {
                    errorMsg = firstDetail._errors[0];
                } else if (apiError.details._errors?.length > 0) {
                    errorMsg = apiError.details._errors[0];
                }
            }

            setError(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-black vi-gray-900 to-black overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),rgba(255,255,255,0))] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isLogin ? "Welcome back" : "Create an account"}
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        {isLogin ? "Enter your credentials to access your account." : "Join the IntelliCircle network today."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-zinc-600"
                                placeholder="name@example.com"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">
                            {isLogin ? "Username or Email" : "Username"}
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-zinc-600"
                            placeholder={isLogin ? "user123 or name@example.com" : "user123"}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-zinc-600"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !username || !password || (!isLogin && !email)}
                        className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-zinc-200 focus:ring-4 focus:ring-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Register")}
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(""); }}
                            className="text-sm text-zinc-400 hover:text-white transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
