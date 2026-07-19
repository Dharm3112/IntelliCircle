import { Compass, MapPin, PlusCircle } from "lucide-react";

export default function DiscoverLoading() {
    return (
        <div className="min-h-screen bg-black text-white relative animate-pulse">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[128px] pointer-events-none" />

            <main className="max-w-5xl mx-auto px-4 py-12 relative z-10">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <div className="h-10 w-48 bg-white/10 rounded mb-4"></div>
                        <div className="h-5 w-80 bg-white/5 rounded"></div>
                    </div>
                    <div className="h-10 w-36 bg-white/10 rounded-full"></div>
                </header>

                <div className="space-y-6">
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 px-6 py-4 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-full h-9 w-9"></div>
                            <div>
                                <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                                <div className="h-3 w-32 bg-white/5 rounded"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-4 w-20 bg-white/10 rounded"></div>
                            <div className="h-2 w-32 bg-white/5 rounded"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 h-48 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-6 w-32 bg-white/10 rounded"></div>
                                        <div className="h-5 w-16 bg-white/10 rounded-md"></div>
                                    </div>
                                    <div className="space-y-2 mb-6">
                                        <div className="h-3 w-full bg-white/5 rounded"></div>
                                        <div className="h-3 w-2/3 bg-white/5 rounded"></div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-5 w-12 bg-white/10 rounded"></div>
                                    <div className="h-5 w-16 bg-white/10 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
