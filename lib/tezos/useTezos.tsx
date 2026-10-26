"use client";
import { useEffect } from "react";
import { useWalletStore, hasBeaconSession } from "./store/walletStore";

export const useTezos = () => {
    const {
        Tezos,
        address,
        wallet,
        kukai,
        network,
        isInitialized,
        initializeWallets,
        connectWallet,
        connectKukai,
        disconnectWallet,
        switchNetwork,
    } = useWalletStore();

    // Check for existing session on mount; defer heavy SDK initialization if none exists
    useEffect(() => {
        if (!isInitialized) {
            if (hasBeaconSession()) {
                initializeWallets();
            } else {
                useWalletStore.setState({ isInitialized: true });
            }
        }
    }, [isInitialized, initializeWallets]);

    // Simple hook that returns store state and methods
    return {
        Tezos,
        wallet,
        address,
        kukai,
        network,
        isInitialized,
        connectWallet,
        connectKukai,
        disconnectWallet,
        switchNetwork,
    };
};
