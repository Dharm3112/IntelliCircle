"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Users, Loader2, Wifi, WifiOff, Menu, Sparkles } from "lucide-react";
import { MobileDrawer } from "@/components/mobile-drawer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Virtuoso } from "react-virtuoso";
import toast from "react-hot-toast";

interface Message {
    id: number;
    userId: number;
    username: string;
    content: string;
    createdAt: string;
}

interface RoomData {
    id: number;
    name: string;
    description: string;
    interests: string[];
}

export default function ChatRoomPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const { connected, connecting, error, subscribe, sendMessage } = useSocket();
    const queryClient = useQueryClient();

    const [room, setRoom] = useState<RoomData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [roomSummary, setRoomSummary] = useState<string | null>(null);
    const [summaryStatus, setSummaryStatus] = useState<"idle" | "pending" | "ready" | "unavailable">("idle");
    const [input, setInput] = useState("");
    const [participants, setParticipants] = useState<any[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Typing indicator states
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typingUsers.size]);

    // Initial Gate
    useEffect(() => {
        if (!isAuthenticated) router.push("/auth");

        // Lock body completely to prevent any rogue scrollbars
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, [isAuthenticated, router]);

    // Initial Hydration
    const { data: historyData, isLoading: historyLoading } = useQuery({
        queryKey: ["roomHistory", id],
        queryFn: async () => {
            const res = await api.get(`/rooms/${id}/history`);
            return (res.data as any).data;
        },
        enabled: isAuthenticated && !!id
    });

    useEffect(() => {
        if (historyData) {
            setRoom(historyData.room);
            setMessages(historyData.messages || []);
        }
    }, [historyData]);

    // WebSocket Binder
    useEffect(() => {
        if (!connected) return;

        // Ask the server to map this socket stream to the Postgres Room ID
        sendMessage("join_room", { roomId: Number(id) });

        const unsubscribe = subscribe((data: any) => {
            console.log("⬇️ FRONTEND RECEIVED WS:", data);
            if (data.type === "new_message") {
                // Sync the incoming WS message straight into the TanStack cache
                queryClient.setQueryData(["roomHistory", id], (old: any) => {
                    if (!old) return old;
                    return {
                        ...old,
                        messages: [...(old.messages || []), data.payload]
                    };
                });

                // Also update local state for immediate render
                setMessages(prev => [...prev, data.payload]);
            } else if (data.type === "user_joined") {
                // In production, we'd add to the precise participants list based on payload diff
                // For now, we'll refetch or push
            } else if (data.type === "user_left") {
                // Remove from participants list
            } else if (data.type === "typing_start") {
                if (data.payload.userId !== user?.id) {
                    setTypingUsers(prev => {
                        const next = new Set(prev);
                        next.add(data.payload.username || "Anon");
                        return next;
                    });
                }
            } else if (data.type === "typing_stop") {
                if (data.payload.userId !== user?.id) {
                    setTypingUsers(prev => {
                        const next = new Set(prev);
                        next.delete(data.payload.username || "Anon");
                        return next;
                    });
                }
            } else if (data.type === "room_summary_update") {
                setRoomSummary(data.content);
                setSummaryStatus("ready");
            } else if (data.type === "room_summary_pending") {
                setSummaryStatus("pending");
            } else if (data.type === "room_summary_unavailable") {
                setSummaryStatus("unavailable");
            } else if (data.type === "error") {
                toast.error(data.message || "Network Error");
            }
        });

        return () => unsubscribe();
    }, [connected, id, sendMessage, subscribe]);

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        if (!connected) return;

        // Broadcast we are typing (throttled)
        if (!isTypingRef.current) {
            isTypingRef.current = true;
            sendMessage("typing_start", { roomId: Number(id) });
        }

        // Clear existing debounce
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // Stop typing indicator after 1 second of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            sendMessage("typing_stop", { roomId: Number(id) });
        }, 1000);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("🚀 SEND HIT!", { input: input.trim(), connected });
        if (!input.trim() || !connected) {
            console.log("❌ REJECTED ALGORITHM!");
            return;
        }

        const messageContent = input.trim();
        console.log("📤 Sending message to WS Engine:", { roomId: Number(id), content: messageContent });

        sendMessage("send_message", { roomId: Number(id), content: messageContent });

        // --- FIX: Optimistically add the message to your screen immediately ---
        const optimisticMsg = {
            id: Date.now(), // Temporary ID
            userId: user?.id || 0,
            username: user?.username || "You",
            content: messageContent,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);
        // ----------------------------------------------------------------------

        setInput(""); // Optimistic clear

        // Immediately halt typing indicator
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        isTypingRef.current = false;
        sendMessage("typing_stop", { roomId: Number(id) });
    };

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-[calc(100dvh-4rem)] w-full bg-black text-white overflow-hidden">

            {/* LEFT SIDEBAR - Room Info */}
            <aside className="w-80 border-r border-white/10 bg-zinc-950 flex flex-col hidden md:flex shrink-0">
                <div className="h-16 border-b border-white/10 flex items-center px-4 shrink-0">
                    <button
                        onClick={() => router.push("/discover")}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Discover</span>
                    </button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    {room ? (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight mb-2">{room.name}</h2>
                                <p className="text-sm text-zinc-400 leading-relaxed">{room.description || "No description provided."}</p>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {room.interests.map((tag: string) => (
                                        <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-zinc-300">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : historyLoading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-white/10 rounded w-2/3"></div>
                            <div className="h-4 bg-white/5 rounded w-full"></div>
                            <div className="h-4 bg-white/5 rounded w-4/5"></div>
                        </div>
                    ) : null}
                </div>
            </aside>

            <div className="flex-1 flex flex-col relative h-full min-w-0">
                {/* Header */}
                <header className="shrink-0 h-16 border-b border-white/10 bg-zinc-900/50 flex items-center justify-between px-4 lg:px-6 z-10 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/discover")}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors hidden md:block" // Desktop back
                        >
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </button>
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors md:hidden" // Mobile menu
                        >
                            <Menu className="w-5 h-5 text-zinc-400" />
                        </button>
                        <div>
                            <h2 className="font-bold tracking-tight">{room?.name || `Room #${id}`}</h2>
                            <div className="flex items-center gap-1.5 text-xs">
                                {connecting ? (
                                    <span className="text-yellow-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Connecting...</span>
                                ) : error ? (
                                    <span className="text-red-400 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Offline</span>
                                ) : connected ? (
                                    <span className="text-emerald-400 flex items-center gap-1"><Wifi className="w-3 h-3" /> Synchronized</span>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-medium text-zinc-300">Live</span>
                    </div>
                </header>

                {/* Message Feed */}
                <main className="flex-1 overflow-hidden relative bg-black/50 flex flex-col pt-4">
                    {historyLoading ? (
                        <div className="flex items-center justify-center h-full text-zinc-500 flex-col gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            <span className="text-sm font-medium">Hydrating history...</span>
                        </div>
                    ) : (
                        <div className="flex-1 w-full h-full min-h-0 max-w-4xl mx-auto flex flex-col overflow-y-auto px-4 lg:px-6 scroll-smooth">
                            <div className="flex flex-col gap-1 mt-auto pb-4 w-full pt-4">
                                {summaryStatus === "pending" && (
                                    <div className="mb-6 p-4 rounded-xl bg-zinc-900/50 border border-white/5 shadow-lg backdrop-blur-md relative overflow-hidden flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 animate-pulse">
                                            <Sparkles className="w-4 h-4 text-zinc-500" />
                                        </div>
                                        <div className="flex-1 space-y-2 mt-1">
                                            <div className="h-3 w-1/4 bg-white/10 rounded animate-pulse"></div>
                                            <div className="space-y-1.5">
                                                <div className="h-2 w-full bg-white/5 rounded animate-pulse"></div>
                                                <div className="h-2 w-5/6 bg-white/5 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {summaryStatus === "ready" && roomSummary && (
                                    <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/40 transition-colors">
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                        <div className="flex gap-3 relative z-10">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-2">
                                                    AI Context Summary
                                                </h4>
                                                <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                                                    {roomSummary}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg, i) => {
                                    const isMe = msg.userId === user?.id;

                                    return (
                                        <div
                                            key={msg.id || `temp-${i}`}
                                            className={`flex flex-col py-2 ${isMe ? 'items-end' : 'items-start'}`}
                                        >
                                            {!isMe && (
                                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 ml-1">
                                                    {msg.username || 'Anon'}
                                                </span>
                                            )}
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl max-w-[85%] ${isMe
                                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                                    : 'bg-zinc-800 text-zinc-200 rounded-bl-sm border border-white/5'
                                                    }`}
                                            >
                                                <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                <AnimatePresence>
                                    {typingUsers.size > 0 && (
                                        <motion.div
                                            key="typing-indicator"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="text-xs text-zinc-400 font-medium italic mt-2 ml-2 pb-4"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1 items-center">
                                                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                                                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                                                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                                                </div>
                                                {Array.from(typingUsers).join(", ")} {typingUsers.size > 1 ? "are" : "is"} typing...
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={messagesEndRef} className="h-1" />
                            </div>
                        </div>
                    )}
                </main>

                {/* Input Area */}
                <footer className="shrink-0 p-4 border-t border-white/10 bg-zinc-900/50 backdrop-blur-md">
                    <div className="max-w-4xl mx-auto relative cursor-text group" onClick={() => document.getElementById('chat-input')?.focus()}>
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <input
                                id="chat-input"
                                type="text"
                                value={input}
                                onChange={handleTyping}
                                disabled={!connected || historyLoading}
                                autoComplete="off"
                                placeholder={connected ? "Type a message..." : "Reconnecting to network..."}
                                className="flex-1 bg-black/50 border border-white/10 rounded-full px-5 py-3.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50 transition-all hover:border-white/20"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || !connected}
                                className="p-3.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-indigo-600 cursor-pointer shadow-lg shadow-indigo-500/20"
                            >
                                <Send className="w-5 h-5 -ml-[1px]" />
                            </button>
                        </form>
                    </div>
                </footer>
                {/* Mobile Drawer */}
                <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Room Info">
                    <div className="p-4 space-y-6">
                        <button
                            onClick={() => router.push("/discover")}
                            className="flex items-center gap-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Leave & Return to Map</span>
                        </button>

                        {room ? (
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight mb-2">{room.name}</h2>
                                    <p className="text-sm text-zinc-400 leading-relaxed">{room.description || "No description provided."}</p>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Interests</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {room.interests.map((tag: string) => (
                                            <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-zinc-300">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="pt-4 border-t border-white/10">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Participants ({participants.length})</h3>
                            {participants.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 py-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                                    </div>
                                    <span className="text-sm font-medium text-zinc-200">{p.username || "Anon"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </MobileDrawer>
            </div >
        </div >
    );
}
