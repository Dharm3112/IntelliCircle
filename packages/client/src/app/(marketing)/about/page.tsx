import Link from "next/link";
import { Users, Globe2, Cpu, ArrowRight } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="flex-1 w-full bg-background flex flex-col pt-10 pb-20">
            {/* 1. Hero Section */}
            <section className="relative px-4 sm:px-6 lg:px-8 py-20 text-center max-w-4xl mx-auto overflow-hidden">
                <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent pointer-events-none blur-3xl" />
                <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-6 relative z-10">
                    We're building the <span className="text-primary">real-time</span> watercooler.
                </h1>
                <p className="text-xl text-muted leading-relaxed relative z-10">
                    IntelliCircle strips away the noise of algorithm-driven feeds, replacing them with spontaneous, high-value local connections when you need them most.
                </p>
            </section>

            {/* 2. Core Values/Pillars */}
            <section className="px-4 sm:px-6 lg:px-8 py-16 bg-zinc-950 border-y border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex flex-col items-center text-center p-6 bg-[#0A0A0A] border border-[#27272a] rounded-2xl hover:border-primary/30 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <Globe2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white font-display mb-3">Hyper-Local</h3>
                        <p className="text-muted leading-relaxed">
                            Networking shouldn't just happen online. We connect you with professionals in your immediate vicinity, turning digital chats into real-world collaborations.
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center p-6 bg-[#0A0A0A] border border-[#27272a] rounded-2xl hover:border-primary/30 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <Cpu className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white font-display mb-3">Instantaneous</h3>
                        <p className="text-muted leading-relaxed">
                            No more waiting for connection requests to be accepted. Drop directly into active chat rooms and start providing value immediately.
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center p-6 bg-[#0A0A0A] border border-[#27272a] rounded-2xl hover:border-primary/30 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-white font-display mb-3">Community First</h3>
                        <p className="text-muted leading-relaxed">
                            Built by developers, for professionals. We prioritize privacy, authentic interaction, and meaningful discovery over engagement metrics.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3. The Story / Manifesto */}
            <section className="px-4 sm:px-6 lg:px-8 py-24 max-w-4xl mx-auto text-center md:text-left">
                <h2 className="text-3xl font-display font-bold text-white mb-8">Our Story</h2>
                <div className="space-y-6 text-lg text-zinc-300 leading-relaxed">
                    <p>
                        The modern professional landscape is more fragmented than ever. Despite having countless "social networks," finding relevant people to collaborate with locally remains incredibly difficult.
                    </p>
                    <p>
                        Traditional platforms optimize for endless scrolling and algorithmic sorting. You send a connection request, wait days for a response, and eventually exchange pleasantries that rarely lead to genuine collaboration.
                    </p>
                    <p className="border-l-2 border-primary pl-6 font-medium text-white italic">
                        "We realized the best networking happens spontaneously — like bumping into someone at a conference or chatting by the watercooler. We wanted to digitize that exact experience."
                    </p>
                    <p>
                        That's why we built IntelliCircle. By focusing on real-time presence and geo-location, we enable professionals to bypass the formalities and jump straight into high-context, high-value conversations.
                    </p>
                </div>
            </section>

            {/* 4. Bottom CTA */}
            <section className="px-4 sm:px-6 lg:px-8 pb-10">
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-900/40 to-primary/20 border border-primary/30 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay pointer-events-none"></div>

                    <h2 className="text-3xl font-display font-bold text-white mb-4 relative z-10">Join the movement.</h2>
                    <p className="text-lg text-indigo-100/80 mb-8 max-w-xl mx-auto relative z-10">
                        Stop collecting connections. Start building a community. Experience IntelliCircle today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 w-full sm:w-auto">
                        <Link
                            href="/discover"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-black transition-all hover:bg-zinc-200 shadow-xl shadow-black/20"
                        >
                            Open the Map <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
