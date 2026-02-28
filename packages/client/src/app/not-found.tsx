"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Sparkles, Map, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col items-center justify-center overflow-hidden p-6">
            <title>404 | Vector Not Found</title>

            {/* Background Decorators */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative"
                >
                    {/* Pulsing ring */}
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute inset-0 bg-indigo-500 rounded-full blur-xl"
                    />

                    <div className="relative w-32 h-32 bg-zinc-950 border border-white/10 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl mb-8">
                        <Compass className="w-16 h-16 text-indigo-400 animate-[spin_5s_linear_infinite]" />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-7xl font-black tracking-tighter mb-4"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                        404
                    </span>
                </motion.h1>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-4"
                >
                    Signal Lost.
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-zinc-400 max-w-md mx-auto mb-10 leading-relaxed"
                >
                    We couldn't map you to this coordinate. The room or page you are looking for has been archived, restricted, or never existed in this physical plane.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <Link href="/discover" className="relative group overflow-hidden bg-white text-black font-bold text-sm px-8 py-4 rounded-xl hover:scale-[1.02] focus:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        <Map className="w-4 h-4" />
                        <span>Return to Map</span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-shimmer" />
                    </Link>

                    <Link href="/auth" className="relative group bg-zinc-900 border border-white/10 text-white font-bold text-sm px-8 py-4 rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                        <Home className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                        <span>Basecamp</span>
                    </Link>
                </motion.div>

                {/* Micro detail */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 flex items-center gap-2 text-xs text-zinc-600 font-mono bg-white/5 px-3 py-1.5 rounded-md border border-white/5"
                >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    STATUS: OFFLINE
                </motion.div>
            </div>
        </div>
    );
}
