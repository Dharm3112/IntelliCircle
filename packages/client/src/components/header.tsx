"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { AuthModal } from "./auth-modal";
import { UpgradeAccountModal } from "./upgrade-modal";
import { MobileDrawer } from "./mobile-drawer";

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                            <UpgradeAccountModal />
                            <AuthModal />
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
                        <UpgradeAccountModal />
                        <AuthModal />
                    </div>
                </div>
            </MobileDrawer>
        </>
    );
}
