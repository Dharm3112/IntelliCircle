"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
    const pathname = usePathname();

    // Hide footer on chat routes as they need full screen height
    if (pathname?.startsWith("/chat")) {
        return null;
    }

    return (
        <footer className="w-full border-t border-white/10 bg-background pt-16 pb-8 mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-lg font-bold text-white font-display">IC</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white font-display">
                                Intelli<span className="text-primary">Circle</span>
                            </span>
                        </Link>
                        <p className="text-muted text-sm mt-2">
                            The real-time watercooler for your city. Built for modern professionals.
                        </p>
                    </div>

                    {/* Platform links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Platform</h3>
                        <ul className="flex flex-col gap-2">
                            <li><Link href="/discover" className="text-muted hover:text-white transition-colors text-sm">Discover</Link></li>
                            <li><Link href="/chat" className="text-muted hover:text-white transition-colors text-sm">Chat Rooms</Link></li>
                            <li><Link href="/dashboard" className="text-muted hover:text-white transition-colors text-sm">Dashboard</Link></li>
                            <li><Link href="/profile" className="text-muted hover:text-white transition-colors text-sm">My Profile</Link></li>
                        </ul>
                    </div>

                    {/* Company links */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Company</h3>
                        <ul className="flex flex-col gap-2">
                            <li><Link href="/about" className="text-muted hover:text-white transition-colors text-sm">About Us</Link></li>
                            <li><Link href="/contact" className="text-muted hover:text-white transition-colors text-sm">Contact</Link></li>
                            <li><Link href="/admin" className="text-muted hover:text-white transition-colors text-sm">Admin</Link></li>
                        </ul>
                    </div>

                    {/* Legal & Social */}
                    <div>
                        <h3 className="font-semibold text-white mb-4">Connect</h3>
                        <div className="flex gap-4 mb-6">
                            <a href="#" className="text-muted hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-muted hover:text-white transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-muted hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                        <ul className="flex flex-col gap-2">
                            <li><a href="#" className="text-muted hover:text-white transition-colors text-sm">Privacy Policy</a></li>
                            <li><a href="#" className="text-muted hover:text-white transition-colors text-sm">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-muted text-sm text-center md:text-left">
                        &copy; {new Date().getFullYear()} IntelliCircle. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
