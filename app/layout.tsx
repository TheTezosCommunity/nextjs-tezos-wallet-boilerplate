import type React from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    ],
    width: "device-width",
    initialScale: 1,
};

export const metadata: Metadata = {
    title: "Tezos Boilerplate",
    description: "A comprehensive starter template for building decentralized applications on Tezos",
    manifest: "/manifest.json",
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Tezos Boilerplate",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="apple-mobile-web-app-title" content="Tezos Boilerplate" />
                <meta name="theme-color" content="#09090b" />
            </head>
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <WalletProvider>
                        <div className="flex min-h-screen flex-col">
                            <Header />
                            <main className="flex-1">{children}</main>
                        </div>
                    </WalletProvider>
                </ThemeProvider>
                <Script
                    id="register-sw"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `if(typeof window!=='undefined'&&'serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{});});}`,
                    }}
                />
            </body>
        </html>
    );
}
