import { Activity, Compass, MessageSquare, Target } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex-1 w-full bg-background flex flex-col animate-pulse">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
                {/* Header Section Skeleton */}
                <div className="mb-10">
                    <div className="h-10 w-64 bg-white/10 rounded mb-4"></div>
                    <div className="h-6 w-96 bg-white/5 rounded"></div>
                </div>

                {/* Main Dashboard Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column Skeleton */}
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Action Cards Skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 rounded-2xl bg-[#111827] border border-[#27272a] h-48">
                                <Compass className="w-8 h-8 text-white/20 mb-4" />
                                <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
                                <div className="h-4 w-full bg-white/5 rounded mb-2"></div>
                                <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                            </div>
                            <div className="p-6 rounded-2xl bg-[#111827] border border-[#27272a] h-48">
                                <MessageSquare className="w-8 h-8 text-white/20 mb-4" />
                                <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
                                <div className="h-4 w-full bg-white/5 rounded mb-2"></div>
                                <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                            </div>
                        </div>

                        {/* Recent Activity/Feed Section Skeleton */}
                        <div className="bg-[#111827] rounded-2xl border border-[#27272a] p-6 flex flex-col flex-grow h-64">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Activity className="w-5 h-5 mr-2 text-white/20" />
                                    <div className="h-6 w-40 bg-white/10 rounded"></div>
                                </div>
                                <div className="h-4 w-16 bg-white/10 rounded"></div>
                            </div>
                            <div className="flex-1 border-2 border-dashed border-[#27272a] rounded-xl bg-background/50"></div>
                        </div>
                    </div>

                    {/* Right Column Skeleton */}
                    <div className="flex flex-col gap-6">
                        {/* Mini Profile Card Skeleton */}
                        <div className="bg-[#111827] rounded-2xl border border-[#27272a] p-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-white/10 mx-auto mb-4"></div>
                            <div className="h-6 w-24 bg-white/10 rounded mx-auto mb-6"></div>
                            
                            <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                                <div>
                                    <div className="h-8 w-8 bg-white/10 rounded mx-auto mb-2"></div>
                                    <div className="h-3 w-16 bg-white/5 rounded mx-auto"></div>
                                </div>
                                <div className="border-l border-white/10">
                                    <div className="h-8 w-8 bg-white/10 rounded mx-auto mb-2"></div>
                                    <div className="h-3 w-16 bg-white/5 rounded mx-auto"></div>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions Block Skeleton */}
                        <div className="bg-[#111827] rounded-2xl border border-[#27272a] p-6 flex-grow">
                            <div className="flex items-center mb-4">
                                <Target className="w-5 h-5 mr-2 text-white/20" />
                                <div className="h-6 w-32 bg-white/10 rounded"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-background/80 p-4 rounded-xl h-24 border border-white/5"></div>
                                <div className="bg-background/80 p-4 rounded-xl h-24 border border-white/5"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
