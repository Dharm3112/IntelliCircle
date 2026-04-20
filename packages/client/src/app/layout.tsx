import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
    title: "IntelliCircle | Connect Locally. Network Globally.",
    description: "The real-time watercooler for your city. Discover professionals and join local chat rooms.",
};

import { Providers } from "../components/providers";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import PageTransition from "../components/page-transition";
import { CSPostHogProvider } from "@/components/posthog-provider";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-screen flex flex-col`}>
                <Providers>
                    <Header />
                    <main className="pt-16 flex-grow flex flex-col">
                        <CSPostHogProvider>
                            {children}
                        </CSPostHogProvider>
                    </main>
                    <Footer />
                </Providers>
                <Analytics />
            </body>
        </html>
    );
}
