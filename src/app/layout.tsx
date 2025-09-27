import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { BeaconProvider } from "@/components/beacon-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Tezos Boilerplate",
    description: "A comprehensive starter template for building decentralized applications on Tezos",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-title" content="Tezos Boilerplate" />
            </head>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <BeaconProvider>{children}</BeaconProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
