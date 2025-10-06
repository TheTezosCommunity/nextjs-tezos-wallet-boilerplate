"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/lib/tezos/store/walletStore";

interface WalletProviderProps {
    children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
    const { isInitialized, initializeWallets } = useWalletStore();

    useEffect(() => {
        if (!isInitialized) {
            initializeWallets();
        }
    }, [isInitialized, initializeWallets]);

    return <>{children}</>;
}
