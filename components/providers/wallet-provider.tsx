"use client";

import { useEffect } from "react";
import { useWalletStore, hasBeaconSession } from "@/lib/tezos/store/walletStore";

interface WalletProviderProps {
    children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
    const { isInitialized, initializeWallets } = useWalletStore();

    useEffect(() => {
        if (!isInitialized) {
            if (hasBeaconSession()) {
                initializeWallets();
            } else {
                useWalletStore.setState({ isInitialized: true });
            }
        }
    }, [isInitialized, initializeWallets]);

    return <>{children}</>;
}
