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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
