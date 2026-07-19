export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,119,198,0.1),rgba(255,255,255,0))] -z-10" />

            <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-pulse">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="h-8 w-48 bg-white/10 rounded-md mb-4"></div>
                    <div className="h-4 w-64 bg-white/5 rounded-md"></div>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="h-4 w-24 bg-white/10 rounded-md mb-2"></div>
                        <div className="h-10 w-full bg-white/5 rounded-md border border-white/10"></div>
                    </div>
                    
                    <div>
                        <div className="h-4 w-24 bg-white/10 rounded-md mb-2"></div>
                        <div className="h-10 w-full bg-white/5 rounded-md border border-white/10"></div>
                    </div>

                    <div className="h-10 w-full bg-indigo-500/20 rounded-md mt-6"></div>
                    
                    <div className="mt-4 flex justify-center">
                        <div className="h-4 w-32 bg-white/5 rounded-md"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
