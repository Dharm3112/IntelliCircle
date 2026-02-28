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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
                <Providers>
                    <Header />
                    <main className="pt-16 min-h-screen">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
