"use client";

import { Mail, MessageSquare, MapPin, Send, Twitter, Linkedin, Github } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => setIsSubmitting(false), 1500);
    };

    return (
        <div className="flex-1 w-full bg-background flex flex-col min-h-screen relative">

            {/* Background elements */}
            <div className="absolute top-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 lg:px-8 pt-24 pb-12 w-full max-w-7xl mx-auto z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="w-full md:w-1/2">
                    <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                        <MessageSquare className="w-4 h-4 mr-2" /> Let's Connect
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-display font-bold tracking-tight text-white mb-6 leading-tight">
                        Reach out and <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
                            say hello.
                        </span>
                    </h1>
                    <p className="text-lg text-zinc-400 leading-relaxed mb-10 max-w-lg">
                        Whether you have a question about our platform, need support, or want to discuss a partnership, our team is ready to listen.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start">
                            <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[#27272a] flex items-center justify-center text-primary mr-4 shrink-0 shadow-lg shadow-black/20">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Email Us directly</h3>
                                <p className="text-muted text-sm mb-2">Typically replies within 2 hours.</p>
                                <a href="mailto:dharmpatel311287@gmail.com" className="text-primary hover:text-indigo-400 font-medium transition-colors">dharmpatel311287@gmail.com</a>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[#27272a] flex items-center justify-center text-primary mr-4 shrink-0 shadow-lg shadow-black/20">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold mb-1">Company HQ</h3>
                                <p className="text-muted text-sm">
                                    Somewhere in Ahmedabad<br />
                                    Gujarat, India
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-[#111827] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white hover:border-primary/50 transition-all">
                            <Twitter className="w-4 h-4" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-[#111827] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white hover:border-primary/50 transition-all">
                            <Linkedin className="w-4 h-4" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-[#111827] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white hover:border-primary/50 transition-all">
                            <Github className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="w-full md:w-1/2 max-w-md lg:max-w-lg">
                    <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-[#27272a] rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                        <h2 className="text-2xl font-bold text-white mb-6 font-display">Send a message</h2>

                        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="firstName" className="text-sm font-medium text-zinc-300">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        className="w-full bg-[#111827] border border-[#27272a] rounded-xl px-4 py-3text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm h-11"
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="lastName" className="text-sm font-medium text-zinc-300">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        className="w-full bg-[#111827] border border-[#27272a] rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm h-11"
                                        placeholder="Your Surname"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full bg-[#111827] border border-[#27272a] rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm h-11"
                                    placeholder="yourname@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="subject" className="text-sm font-medium text-zinc-300">Subject</label>
                                <select
                                    id="subject"
                                    className="w-full bg-[#111827] border border-[#27272a] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm h-11 appearance-none"
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="support">Technical Support</option>
                                    <option value="billing">Billing Question</option>
                                    <option value="partnership">Partnership</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="message" className="text-sm font-medium text-zinc-300">Message</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    className="w-full bg-[#111827] border border-[#27272a] rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm resize-none"
                                    placeholder="How can we help you?"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 bg-primary hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center justify-center disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>Send Message <Send className="w-4 h-4 ml-2" /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
