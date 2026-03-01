"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { AuthModal } from "./auth-modal";
import { UpgradeAccountModal } from "./upgrade-modal";
import { MobileDrawer } from "./mobile-drawer";

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const navLinks = [
        { name: "Discover", href: "/discover" },
        { name: "Chat Rooms", href: "/chat" },
        { name: "About", href: "/about" },
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-lg font-bold text-white font-display">IC</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white font-display hidden sm:block">
                                Intelli<span className="text-primary">Circle</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-sm font-medium text-muted hover:text-white transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4">
                            {mounted && isAuthenticated && user ? (
                                <div className="flex items-center gap-4">
                                    <Link href="/profile" className="flex items-center gap-2 group">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-sm font-bold text-white shadow-md border border-[#27272a] group-hover:border-primary/50 transition-colors overflow-hidden">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                user.username.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                                            {user.username}
                                        </span>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <UpgradeAccountModal />
                                    <AuthModal />
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="p-2 md:hidden text-muted hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                            aria-label="Open Menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <MobileDrawer
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                title="Menu"
            >
                <div className="flex flex-col p-4 gap-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-lg font-medium text-white hover:text-primary transition-colors py-2 border-b border-white/5"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 mt-4">
                        {mounted && isAuthenticated && user ? (
                            <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-primary flex items-center justify-center text-lg font-bold text-white shadow-md border border-[#27272a] overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        user.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <span>{user.username}</span>
                            </Link>
                        ) : (
                            <>
                                <UpgradeAccountModal />
                                <AuthModal />
                            </>
                        )}
                    </div>
                </div>
            </MobileDrawer>
        </>
    );
}
