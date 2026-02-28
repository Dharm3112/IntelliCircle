"use client";

import Link from "next/link";
import { AuthModal } from "./auth-modal";
import { UpgradeAccountModal } from "./upgrade-modal";

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-ic-surface/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-ic-accent to-ic-primary flex items-center justify-center shadow-lg shadow-ic-primary/20">
                            <span className="text-lg font-bold text-white font-space">IC</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white font-space hidden sm:block">
                            IntelliCircle
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <UpgradeAccountModal />
                    <AuthModal />
                </div>
            </div>
        </header>
    );
}
